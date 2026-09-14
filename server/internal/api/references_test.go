package api

import "testing"

func TestForeignRelationshipsAreRejected(t *testing.T) {
	a := newHarness(t)
	a.signIn(uniqueEmail(t))
	b := newHarness(t)
	b.signIn(uniqueEmail(t))
	var issue struct{ Issue Issue }
	var project struct{ Project Project }
	var workflows struct{ Workflows []Workflow }
	a.decode(a.do("POST", a.w("/issues"), map[string]any{"title": "private"}, 201), &issue)
	a.decode(a.do("POST", a.w("/projects"), map[string]any{"name": "private"}, 201), &project)
	a.decode(a.do("GET", a.w("/workflows"), nil, 200), &workflows)
	b.do("POST", b.w("/conversations"), map[string]any{"issue_id": issue.Issue.ID, "message": "leak"}, 404)
	for key, id := range map[string]any{"project_id": project.Project.ID, "parent_id": issue.Issue.ID, "assignee_user_id": a.userID} {
		b.do("POST", b.w("/issues"), map[string]any{"title": "invalid", "description": "x", key: id}, 404)
	}
	var own struct{ Issue Issue }
	b.decode(b.do("POST", b.w("/issues"), map[string]any{"title": "own"}, 201), &own)
	b.do("PATCH", b.w("/issues/"+own.Issue.ID.String()), map[string]any{"workflow_id": workflows.Workflows[0].ID}, 404)
	b.do("POST", b.w("/autopilots"), map[string]any{"name": "invalid", "prompt": "x", "workflow_id": workflows.Workflows[0].ID}, 404)
}
