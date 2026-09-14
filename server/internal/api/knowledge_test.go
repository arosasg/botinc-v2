package api

import (
	"strings"
	"testing"
)

func TestKnowledgeIsolationAndPersistence(t *testing.T) {
	a := newHarness(t)
	a.signIn(uniqueEmail(t))
	b := newHarness(t)
	b.signIn(uniqueEmail(t))
	var sk struct{ Skill Skill }
	a.decode(a.do("POST", a.w("/skills"), map[string]any{"name": "Review", "body": "Check the actual diff."}, 201), &sk)
	a.do("PATCH", a.w("/skills/"+sk.Skill.ID.String()), map[string]any{"enabled": false}, 200)
	b.do("PATCH", b.w("/skills/"+sk.Skill.ID.String()), map[string]any{"body": "overwrite"}, 404)
	var mem struct{ Memory Memory }
	a.decode(a.do("POST", a.w("/memories"), map[string]any{"body": "private fact"}, 201), &mem)
	_, err := testPool.Exec(t.Context(), `insert into members(workspace_id,user_id,role) select id,$2,'member' from workspaces where slug=$1`, a.ws, b.userID)
	if err != nil {
		t.Fatal(err)
	}
	b.ws = a.ws
	if strings.Contains(b.do("GET", b.w("/memories"), nil, 200).Body.String(), "private fact") {
		t.Fatal("private memory leaked")
	}
	b.do("PATCH", b.w("/memories/"+mem.Memory.ID.String()), map[string]any{"body": "overwrite"}, 404)
	b.do("POST", b.w("/skills"), map[string]any{"name": "x", "body": "x"}, 403)
	a.do("POST", a.w("/memories"), map[string]any{"body": "shared fact", "scope": "workspace"}, 201)
	if !strings.Contains(b.do("GET", b.w("/memories"), nil, 200).Body.String(), "shared fact") {
		t.Fatal("shared memory missing")
	}
	a.do("DELETE", a.w("/memories/"+mem.Memory.ID.String()), nil, 200)
	if strings.Contains(a.do("GET", a.w("/memories"), nil, 200).Body.String(), "private fact") {
		t.Fatal("deleted memory returned")
	}
}
