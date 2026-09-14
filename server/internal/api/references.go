package api

import (
	"github.com/arosasg/botinc-v2/server/internal/httpx"
	"github.com/google/uuid"
	"net/http"
)

// A UUID is not authority. Validate relationships as well as the route's object.
func (s *Server) referencesAllowed(w http.ResponseWriter, r *http.Request, refs map[string]*uuid.UUID) bool {
	queries := map[string]string{
		"issue":    `select exists(select 1 from issues where id=$1 and workspace_id=$2)`,
		"project":  `select exists(select 1 from projects where id=$1 and workspace_id=$2)`,
		"workflow": `select exists(select 1 from workflows where id=$1 and workspace_id=$2)`,
		"member":   `select exists(select 1 from members where user_id=$1 and workspace_id=$2)`,
	}
	for kind, id := range refs {
		if id == nil {
			continue
		}
		var allowed bool
		if err := s.pool.QueryRow(r.Context(), queries[kind], id, scopeOf(r.Context()).WorkspaceID).Scan(&allowed); err != nil {
			s.fail(w, err)
			return false
		}
		if !allowed {
			httpx.Error(w, 404, kind+" not found in this workspace")
			return false
		}
	}
	return true
}
