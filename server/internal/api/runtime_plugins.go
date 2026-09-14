package api

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/google/uuid"
)

// runtimeMCPConfig reconstructs the standard Claude-style MCP document from
// individually encrypted connector entries. The plaintext exists only in the
// task-scoped runtime response and never in a list or workspace response.
func (s *Server) runtimeMCPConfig(ctx context.Context, workspaceID uuid.UUID) (json.RawMessage, error) {
	rows, err := s.pool.Query(ctx, `select kind, secret_ref from plugins
		where workspace_id=$1 and status='connected' and kind like 'mcp:%' order by kind`, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	servers := map[string]json.RawMessage{}
	for rows.Next() {
		var kind, ref string
		if err := rows.Scan(&kind, &ref); err != nil {
			return nil, err
		}
		plaintext, err := s.readSecret(ctx, ref)
		if err != nil {
			return nil, err
		}
		var entry json.RawMessage
		if err := json.Unmarshal([]byte(plaintext), &entry); err != nil {
			return nil, err
		}
		servers[strings.TrimPrefix(kind, "mcp:")] = entry
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	if len(servers) == 0 {
		return nil, nil
	}
	encoded, err := json.Marshal(map[string]any{"mcpServers": servers})
	return encoded, err
}
