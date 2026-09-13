package api

import "net/http"

// websocket streams this workspace's events. Authorization already happened in
// the workspace scope middleware, so the hub only needs the workspace id.
func (s *Server) websocket(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	s.hub.Serve(r.Context(), w, r, sc.WorkspaceID)
}
