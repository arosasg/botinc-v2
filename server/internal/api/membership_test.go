package api

import (
	"github.com/google/uuid"
	"testing"
)

func TestInvitationIdentityAndPermissions(t *testing.T) {
	owner := newHarness(t)
	owner.signIn(uniqueEmail(t))
	guest := newHarness(t)
	guest.signIn(uniqueEmail(t))
	var invite struct{ ID, Link string }
	owner.decode(owner.do("POST", owner.w("/invitations"), map[string]any{"email": "intended@example.test"}, 201), &invite)
	token := invite.Link[len(owner.server.cfg.FrontendOrigin+"/invite/"):]
	guest.do("POST", "/api/workspaces/accept-invite", map[string]any{"token": token}, 400)
	_, err := testPool.Exec(t.Context(), `insert into members(workspace_id,user_id,role) select id,$2,'member' from workspaces where slug=$1`, owner.ws, guest.userID)
	if err != nil {
		t.Fatal(err)
	}
	guest.ws = owner.ws
	guest.do("DELETE", guest.w("/invitations/"+invite.ID), nil, 403)
	owner.do("POST", owner.w("/invitations"), map[string]any{"email": "bad", "role": "owner"}, 400)
	owner.do("PATCH", owner.w("/members/"+owner.userID.String()), map[string]any{"role": "member"}, 400)
	owner.do("PATCH", owner.w("/members/"+uuid.NewString()), map[string]any{"role": "member"}, 404)
}
