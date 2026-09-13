package api

import (
	"encoding/json"
	"github.com/arosasg/botinc-v2/server/internal/runs"
	"strings"
	"testing"
)

func TestPrivateRunCannotBeReadOrCancelledByAnotherMember(t *testing.T) {
	a := newHarness(t)
	a.signIn(uniqueEmail(t))
	b := newHarness(t)
	b.signIn(uniqueEmail(t))
	var c struct {
		Conversation Conversation
		Run          *runs.Run
	}
	a.decode(a.do("POST", a.w("/conversations"), map[string]any{"message": "private instruction"}, 201), &c)
	_, err := testPool.Exec(t.Context(), `insert into members(workspace_id,user_id,role) select id,$2,'member' from workspaces where slug=$1`, a.ws, b.userID)
	if err != nil {
		t.Fatal(err)
	}
	b.ws = a.ws
	b.do("GET", b.w("/runs/"+c.Run.ID.String()), nil, 404)
	b.do("GET", b.w("/runs/"+c.Run.ID.String()+"/events"), nil, 404)
	b.do("POST", b.w("/runs/"+c.Run.ID.String()+"/cancel"), nil, 404)
	if strings.Contains(b.do("GET", b.w("/runs"), nil, 200).Body.String(), c.Run.ID.String()) {
		t.Fatal("private run listed")
	}
}
func TestReadOnlyKeyCannotWriteOrMintCredentials(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	var out struct{ Token string }
	h.decode(h.do("POST", "/api/me/keys", map[string]any{"name": "readonly"}, 201), &out)
	raw, _ := json.Marshal([]string{"read"})
	_, err := testPool.Exec(t.Context(), `update api_keys set scopes=$1 where user_id=$2`, raw, h.userID)
	if err != nil {
		t.Fatal(err)
	}
	h.token = out.Token
	h.do("GET", h.w("/issues"), nil, 200)
	h.do("POST", h.w("/issues"), map[string]any{"title": "not allowed"}, 403)
	h.do("POST", "/api/me/keys", map[string]any{"name": "escape"}, 403)
}
