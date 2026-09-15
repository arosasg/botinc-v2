package api

import (
	"fmt"
	"testing"
)

func TestIssuePaginationIncludesEveryStatusWithoutDuplicates(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	_, err := testPool.Exec(t.Context(), `insert into issues(workspace_id,number,title,status) select id,n,'Imported issue '||n,case when n%2=0 then 'cancelled' else 'done' end from workspaces cross join generate_series(1,601) n where slug=$1`, h.ws)
	if err != nil {
		t.Fatal(err)
	}
	seen := map[string]bool{}
	offset := 0
	for {
		var page struct {
			Issues []Issue `json:"issues"`
			More   bool    `json:"has_more"`
			Next   int     `json:"next_offset"`
		}
		h.decode(h.do("GET", h.w(fmt.Sprintf("/issues?limit=200&offset=%d", offset)), nil, 200), &page)
		for _, i := range page.Issues {
			if seen[i.ID.String()] {
				t.Fatal("duplicate issue")
			}
			seen[i.ID.String()] = true
		}
		if !page.More {
			break
		}
		if page.Next <= offset {
			t.Fatal("pagination did not advance")
		}
		offset = page.Next
	}
	if len(seen) != 601 {
		t.Fatalf("lost issues: %d", len(seen))
	}
	h.do("GET", h.w("/issues?offset=-1"), nil, 400)
	h.do("GET", h.w("/issues?limit=1000"), nil, 400)
}

func TestIssueListOmitsHeavyDescriptionsButDetailKeepsThem(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))

	var created struct {
		Issue Issue `json:"issue"`
	}
	h.decode(h.do("POST", h.w("/issues"), map[string]any{
		"title":       "Imported evidence",
		"description": "The complete migration evidence belongs on the stable issue URL.",
	}, 201), &created)

	var list struct {
		Issues []Issue `json:"issues"`
	}
	h.decode(h.do("GET", h.w("/issues?limit=80"), nil, 200), &list)
	if len(list.Issues) != 1 || list.Issues[0].Description != "" {
		t.Fatalf("issue lists must stay compact: %+v", list.Issues)
	}

	var detail struct {
		Issue Issue `json:"issue"`
	}
	h.decode(h.do("GET", h.w("/issues/"+created.Issue.ID.String()), nil, 200), &detail)
	if detail.Issue.Description != "The complete migration evidence belongs on the stable issue URL." {
		t.Fatalf("issue detail lost its description: %q", detail.Issue.Description)
	}
}
