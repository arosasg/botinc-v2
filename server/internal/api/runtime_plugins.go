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
func (s *Server) runtimeMCPConfig(ctx context.Context, workspaceID, runID uuid.UUID) (json.RawMessage, error) {
	rows, err := s.pool.Query(ctx, `select p.kind, p.secret_ref from run_plugins rp join plugins p on p.id=rp.plugin_id
		where rp.run_id=$1 and p.workspace_id=$2 and p.status='connected' and p.kind like 'mcp:%' order by p.kind`, runID, workspaceID)
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
