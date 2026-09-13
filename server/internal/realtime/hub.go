// Package realtime fans workspace events out to WebSocket subscribers.
// Events are small JSON envelopes: {type, workspace_id, payload}. A Redis
// relay can be added behind Publish when the API runs more than one replica.
package realtime

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type Event struct {
	Type        string    `json:"type"`
	WorkspaceID uuid.UUID `json:"workspace_id"`
	Payload     any       `json:"payload,omitempty"`
	At          time.Time `json:"at"`
}

type client struct {
	ws   uuid.UUID
	send chan []byte
}

type Hub struct {
	mu      sync.RWMutex
	clients map[*client]struct{}
	log     *slog.Logger
	origin  string
}

func New(log *slog.Logger, allowedOrigin string) *Hub {
	return &Hub{clients: map[*client]struct{}{}, log: log, origin: allowedOrigin}
}

func (h *Hub) Publish(ws uuid.UUID, typ string, payload any) {
	ev := Event{Type: typ, WorkspaceID: ws, Payload: payload, At: time.Now()}
	b, err := json.Marshal(ev)
	if err != nil {
		return
	}
	h.mu.RLock()
	defer h.mu.RUnlock()
	for c := range h.clients {
		if c.ws != ws {
			continue
		}
		select {
		case c.send <- b:
		default:
			// slow consumer: drop rather than block the publisher
		}
	}
}

func (h *Hub) upgrader() websocket.Upgrader {
	return websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 4096,
		CheckOrigin: func(r *http.Request) bool {
			o := r.Header.Get("Origin")
			return o == "" || o == h.origin
		},
	}
}

// Serve upgrades the request and streams events for one workspace until the
// client goes away. Authorization is the caller's job (do it before calling).
func (h *Hub) Serve(ctx context.Context, w http.ResponseWriter, r *http.Request, ws uuid.UUID) {
	up := h.upgrader()
	conn, err := up.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	c := &client{ws: ws, send: make(chan []byte, 256)}
	h.mu.Lock()
	h.clients[c] = struct{}{}
	h.mu.Unlock()
	defer func() {
		h.mu.Lock()
		delete(h.clients, c)
		h.mu.Unlock()
		_ = conn.Close()
	}()
	hello, _ := json.Marshal(Event{Type: "hello", WorkspaceID: ws, At: time.Now()})
	_ = conn.WriteMessage(websocket.TextMessage, hello)

	go func() {
		// Drain reads so pings/pongs and close frames are processed.
		conn.SetReadLimit(4096)
		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				close(c.send)
				return
			}
		}
	}()
	ping := time.NewTicker(25 * time.Second)
	defer ping.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case msg, ok := <-c.send:
			if !ok {
				return
			}
			_ = conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				return
			}
		case <-ping.C:
			_ = conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
