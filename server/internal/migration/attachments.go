package migration

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"io"
	"os"
	"path/filepath"
)

type File struct {
	Path      string    `json:"path"`
	Size      int64     `json:"bytes"`
	SHA       string    `json:"sha256"`
	Filename  string    `json:"filename"`
	Type      string    `json:"content_type"`
	Issue     uuid.UUID `json:"issue_id"`
	Comment   uuid.UUID `json:"comment_id"`
	Workspace uuid.UUID `json:"workspace_id"`
	Error     string    `json:"error"`
}

func ImportFiles(ctx context.Context, pool *pgxpool.Pool, workspace uuid.UUID, manifest, source, target string, apply bool) (int, error) {
	b, err := os.ReadFile(manifest)
	if err != nil {
		return 0, err
	}
	files := map[string]File{}
	if err := json.Unmarshal(b, &files); err != nil {
		return 0, err
	}
	if apply {
		if err := os.MkdirAll(target, 0o700); err != nil {
			return 0, err
		}
	}
	count := 0
	for key, f := range files {
		id, err := uuid.Parse(key)
		if err != nil || f.Error != "" || f.Workspace != workspace || !filepath.IsLocal(f.Path) {
			return count, fmt.Errorf("invalid attachment record %s", key)
		}
		path := filepath.Join(source, f.Path)
		input, err := os.Open(path)
		if err != nil {
			return count, err
		}
		hash := sha256.New()
		size, err := io.Copy(hash, input)
		input.Close()
		if err != nil || size != f.Size || hex.EncodeToString(hash.Sum(nil)) != f.SHA {
			return count, fmt.Errorf("attachment integrity failed %s", id)
		}
		var linked bool
		if err := pool.QueryRow(ctx, `select exists(select 1 from issue_comments c join issues i on i.id=c.issue_id where c.id=$1 and i.id=$2 and i.workspace_id=$3)`, f.Comment, f.Issue, workspace).Scan(&linked); err != nil {
			return count, err
		}
		if !linked {
			return count, fmt.Errorf("attachment comment is not in imported workspace: %s", id)
		}
		if apply {
			dst := filepath.Join(target, id.String())
			if existing, err := os.ReadFile(dst); err == nil {
				sum := sha256.Sum256(existing)
				if hex.EncodeToString(sum[:]) != f.SHA {
					return count, fmt.Errorf("target attachment collision: %s", id)
				}
			} else if !os.IsNotExist(err) {
				return count, err
			} else {
				input, err := os.Open(path)
				if err != nil {
					return count, err
				}
				out, err := os.OpenFile(dst, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o600)
				if err != nil {
					input.Close()
					return count, err
				}
				_, copyErr := io.Copy(out, input)
				input.Close()
				closeErr := out.Close()
				if copyErr != nil || closeErr != nil {
					os.Remove(dst)
					return count, fmt.Errorf("attachment copy failed %s", id)
				}
			}
			var existing string
			var existingWorkspace uuid.UUID
			err := pool.QueryRow(ctx, `select sha256,workspace_id from attachments where id=$1`, id).Scan(&existing, &existingWorkspace)
			if err == nil && (existing != f.SHA || existingWorkspace != workspace) {
				return count, fmt.Errorf("target metadata collision: %s", id)
			}
			if _, err := pool.Exec(ctx, `insert into attachments(id,workspace_id,issue_id,comment_id,filename,content_type,size_bytes,sha256) values($1,$2,$3,$4,$5,$6,$7,$8) on conflict(id) do nothing`, id, workspace, f.Issue, f.Comment, f.Filename, f.Type, f.Size, f.SHA); err != nil {
				return count, err
			}
		}
		count++
	}
	return count, nil
}
