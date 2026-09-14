package api

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestTimeoutUnlessWebSocket(t *testing.T) {
	var hasDeadline bool
	handler := timeoutUnlessWebSocket(time.Minute)(http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		_, hasDeadline = r.Context().Deadline()
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/example", nil)
	handler.ServeHTTP(httptest.NewRecorder(), req)
	if !hasDeadline {
		t.Fatal("ordinary API request should have a deadline")
	}

	req = httptest.NewRequest(http.MethodGet, "/api/w/example/ws", nil)
	req.Header.Set("Upgrade", "websocket")
	handler.ServeHTTP(httptest.NewRecorder(), req)
	if hasDeadline {
		t.Fatal("WebSocket request must not have an HTTP request deadline")
	}
}
