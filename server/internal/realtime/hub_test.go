package realtime

import (
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

func TestBroadcastInvalidatesWithoutPrivatePayload(t *testing.T) {
	h := New(slog.New(slog.NewTextHandler(io.Discard, nil)), "")
	ws := uuid.New()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { h.Serve(context.Background(), w, r, ws) }))
	defer srv.Close()
	c, _, err := websocket.DefaultDialer.Dial("ws"+strings.TrimPrefix(srv.URL, "http"), nil)
	if err != nil {
		t.Fatal(err)
	}
	defer c.Close()
	c.SetReadDeadline(time.Now().Add(time.Second))
	if _, _, err = c.ReadMessage(); err != nil {
		t.Fatal(err)
	}
	h.Publish(ws, "message.created", map[string]string{"body": "private"})
	_, b, err := c.ReadMessage()
	if err != nil {
		t.Fatal(err)
	}
	var e Event
	if err = json.Unmarshal(b, &e); err != nil {
		t.Fatal(err)
	}
	if e.Payload != nil {
		t.Fatal("private payload broadcast")
	}
	// Repeated disconnects and publishes used to race sending to a closed channel.
	c.Close()
	for i := 0; i < 100; i++ {
		h.Publish(ws, "run.updated", nil)
	}
}

func TestWebSocketOriginAllowsConfiguredAndSameHostOnly(t *testing.T) {
	h := New(slog.New(slog.NewTextHandler(io.Discard, nil)), "https://botinc.ai")
	ws := uuid.New()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h.Serve(context.Background(), w, r, ws)
	}))
	defer srv.Close()
	wsURL := "ws" + strings.TrimPrefix(srv.URL, "http")

	for _, origin := range []string{"https://botinc.ai", srv.URL} {
		header := http.Header{"Origin": []string{origin}}
		conn, response, err := websocket.DefaultDialer.Dial(wsURL, header)
		if err != nil {
			t.Fatalf("origin %q should be accepted: response=%v err=%v", origin, response, err)
		}
		conn.Close()
	}

	header := http.Header{"Origin": []string{"https://evil.example"}}
	conn, response, err := websocket.DefaultDialer.Dial(wsURL, header)
	if err == nil {
		conn.Close()
		t.Fatal("cross-site origin should be rejected")
	}
	if response == nil || response.StatusCode != http.StatusForbidden {
		t.Fatalf("cross-site origin response = %v, want 403", response)
	}
}
