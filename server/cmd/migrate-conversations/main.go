// Command migrate-conversations performs an idempotent final delta sync of v1
// conversations and messages. It preserves v2-only rows and never writes v1.
package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type sourceConversation struct {
	ID          uuid.UUID
	WorkspaceID uuid.UUID
	OwnerEmail  string
	Title       string
	Model       string
	Status      string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type targetConversation struct {
	UserID  *uuid.UUID
	NextSeq int64
}

type sourceMessage struct {
	ID, ConversationID                        uuid.UUID
	Role, Content, FailureReason, MessageKind string
	TaskID, AuthorType, AuthorID, ClientID    *string
	ElapsedMS                                 *int64
	QuickActions, ExecutionSwitch             json.RawMessage
	CreatedAt                                 time.Time
}

func main() {
	if err := run(context.Background()); err != nil {
		fmt.Fprintln(os.Stderr, "conversation migration failed:", err)
		os.Exit(1)
	}
}

func run(ctx context.Context) error {
	sourceURL := strings.TrimSpace(os.Getenv("SOURCE_DATABASE_URL"))
	targetURL := strings.TrimSpace(os.Getenv("TARGET_DATABASE_URL"))
	workspaceCSV := strings.TrimSpace(os.Getenv("SOURCE_WORKSPACE_IDS"))
	if sourceURL == "" || targetURL == "" || workspaceCSV == "" {
		return errors.New("SOURCE_DATABASE_URL, TARGET_DATABASE_URL and SOURCE_WORKSPACE_IDS are required")
	}
	workspaceIDs := strings.Split(workspaceCSV, ",")
	source, err := pgxpool.New(ctx, sourceURL)
	if err != nil {
		return err
	}
	defer source.Close()
	target, err := pgxpool.New(ctx, targetURL)
	if err != nil {
		return err
	}
	defer target.Close()

	conversations, err := loadSourceConversations(ctx, source, workspaceIDs)
	if err != nil {
		return err
	}
	targetConversations, targetMessages, err := loadTargetState(ctx, target, workspaceIDs)
	if err != nil {
		return err
	}
	tx, err := target.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	insertedConversations := 0
	for _, conversation := range conversations {
		if _, exists := targetConversations[conversation.ID]; exists {
			continue
		}
		userID, err := targetUser(ctx, tx, conversation.WorkspaceID, conversation.OwnerEmail)
		if err != nil {
			return fmt.Errorf("map owner for conversation %s: %w", conversation.ID, err)
		}
		var archivedAt *time.Time
		if conversation.Status == "archived" {
			archivedAt = &conversation.UpdatedAt
		}
		_, err = tx.Exec(ctx, `insert into conversations
			(id,workspace_id,user_id,title,model,archived_at,created_at,updated_at)
			values($1,$2,$3,$4,$5,$6,$7,$8) on conflict(id) do nothing`,
			conversation.ID, conversation.WorkspaceID, userID, conversation.Title,
			conversation.Model, archivedAt, conversation.CreatedAt, conversation.UpdatedAt)
		if err != nil {
			return fmt.Errorf("insert conversation %s: %w", conversation.ID, err)
		}
		targetConversations[conversation.ID] = targetConversation{UserID: &userID}
		insertedConversations++
	}

	insertedMessages := 0
	rows, err := source.Query(ctx, `select m.id,m.chat_session_id,m.role,m.content,
		m.task_id::text,coalesce(m.failure_reason,''),m.elapsed_ms,
		coalesce(m.message_kind,'message'),coalesce(m.quick_actions,'[]'::jsonb),
		m.author_type,m.author_id::text,coalesce(m.execution_switch,'{}'::jsonb),
		m.client_message_id,m.created_at
		from chat_message m join chat_session s on s.id=m.chat_session_id
		where s.workspace_id=any($1::uuid[]) order by m.created_at,m.id`, workspaceIDs)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var message sourceMessage
		if err := rows.Scan(&message.ID, &message.ConversationID, &message.Role, &message.Content,
			&message.TaskID, &message.FailureReason, &message.ElapsedMS, &message.MessageKind,
			&message.QuickActions, &message.AuthorType, &message.AuthorID, &message.ExecutionSwitch,
			&message.ClientID, &message.CreatedAt); err != nil {
			return err
		}
		if targetMessages[message.ID] {
			continue
		}
		conversation, exists := targetConversations[message.ConversationID]
		if !exists {
			return fmt.Errorf("message %s has no target conversation %s", message.ID, message.ConversationID)
		}
		conversation.NextSeq++
		meta, err := messageMeta(message)
		if err != nil {
			return err
		}
		var authorUserID *uuid.UUID
		if message.Role == "user" {
			authorUserID = conversation.UserID
		}
		_, err = tx.Exec(ctx, `insert into messages
			(id,conversation_id,seq,role,author_user_id,body,meta,created_at)
			values($1,$2,$3,$4,$5,$6,$7,$8) on conflict(id) do nothing`,
			message.ID, message.ConversationID, conversation.NextSeq, targetRole(message.Role),
			authorUserID, message.Content, meta, message.CreatedAt)
		if err != nil {
			return fmt.Errorf("insert message %s: %w", message.ID, err)
		}
		_, err = tx.Exec(ctx, `update conversations set updated_at=greatest(updated_at,$2)
			where id=$1`, message.ConversationID, message.CreatedAt)
		if err != nil {
			return err
		}
		targetMessages[message.ID] = true
		targetConversations[message.ConversationID] = conversation
		insertedMessages++
	}
	if err := rows.Err(); err != nil {
		return err
	}
	if strings.EqualFold(strings.TrimSpace(os.Getenv("APPLY")), "true") {
		if err := tx.Commit(ctx); err != nil {
			return err
		}
		fmt.Printf("migrated %d conversations and %d messages\n", insertedConversations, insertedMessages)
		return nil
	}
	fmt.Printf("verified delta of %d conversations and %d messages; set APPLY=true to commit\n",
		insertedConversations, insertedMessages)
	return nil
}

func loadSourceConversations(ctx context.Context, source *pgxpool.Pool, workspaceIDs []string) ([]sourceConversation, error) {
	rows, err := source.Query(ctx, `select s.id,s.workspace_id,coalesce(u.email,''),
		coalesce(nullif(s.title,''),nullif(s.name,''),'Imported conversation'),
		coalesce(nullif(s.model,''),'auto'),s.status,s.created_at,s.updated_at
		from chat_session s left join "user" u on u.id=s.creator_id
		where s.workspace_id=any($1::uuid[]) order by s.created_at,s.id`, workspaceIDs)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var conversations []sourceConversation
	for rows.Next() {
		var conversation sourceConversation
		if err := rows.Scan(&conversation.ID, &conversation.WorkspaceID, &conversation.OwnerEmail,
			&conversation.Title, &conversation.Model, &conversation.Status,
			&conversation.CreatedAt, &conversation.UpdatedAt); err != nil {
			return nil, err
		}
		conversations = append(conversations, conversation)
	}
	return conversations, rows.Err()
}

func loadTargetState(ctx context.Context, target *pgxpool.Pool, workspaceIDs []string) (map[uuid.UUID]targetConversation, map[uuid.UUID]bool, error) {
	conversations := make(map[uuid.UUID]targetConversation)
	rows, err := target.Query(ctx, `select c.id,c.user_id,coalesce(max(m.seq),0)
		from conversations c left join messages m on m.conversation_id=c.id
		where c.workspace_id=any($1::uuid[]) group by c.id,c.user_id`, workspaceIDs)
	if err != nil {
		return nil, nil, err
	}
	for rows.Next() {
		var id uuid.UUID
		var conversation targetConversation
		if err := rows.Scan(&id, &conversation.UserID, &conversation.NextSeq); err != nil {
			rows.Close()
			return nil, nil, err
		}
		conversations[id] = conversation
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return nil, nil, err
	}
	rows.Close()

	messages := make(map[uuid.UUID]bool)
	rows, err = target.Query(ctx, `select m.id from messages m join conversations c on c.id=m.conversation_id
		where c.workspace_id=any($1::uuid[])`, workspaceIDs)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			return nil, nil, err
		}
		messages[id] = true
	}
	return conversations, messages, rows.Err()
}

func targetUser(ctx context.Context, tx pgx.Tx, workspaceID uuid.UUID, email string) (uuid.UUID, error) {
	var userID uuid.UUID
	err := tx.QueryRow(ctx, `select m.user_id from members m join users u on u.id=m.user_id
		where m.workspace_id=$1 order by (lower(u.email)=lower($2)) desc,(m.role='owner') desc,m.created_at limit 1`,
		workspaceID, email).Scan(&userID)
	return userID, err
}

func targetRole(role string) string {
	switch role {
	case "user":
		return "user"
	case "assistant":
		return "operator"
	default:
		return "notice"
	}
}

func messageMeta(message sourceMessage) ([]byte, error) {
	meta := map[string]any{
		"v1":            true,
		"source_role":   message.Role,
		"message_kind":  message.MessageKind,
		"quick_actions": json.RawMessage(message.QuickActions),
	}
	if message.TaskID != nil {
		meta["task_id"] = *message.TaskID
	}
	if message.AuthorType != nil {
		meta["author_type"] = *message.AuthorType
	}
	if message.AuthorID != nil {
		meta["author_id"] = *message.AuthorID
	}
	if message.ClientID != nil {
		meta["client_message_id"] = *message.ClientID
	}
	if message.ElapsedMS != nil {
		meta["elapsed_ms"] = *message.ElapsedMS
	}
	if message.FailureReason != "" {
		meta["failure_reason"] = message.FailureReason
	}
	if len(message.ExecutionSwitch) > 0 && string(message.ExecutionSwitch) != "{}" {
		meta["execution_switch"] = json.RawMessage(message.ExecutionSwitch)
	}
	return json.Marshal(meta)
}
