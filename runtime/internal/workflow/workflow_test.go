package workflow

import (
	"context"
	"strings"
	"testing"
)

func TestBranchesOnlyExecuteSelectedPath(t *testing.T) {
	g := Graph{Nodes: []Node{{Key: "s", Kind: "start"}, {Key: "c", Kind: "condition"}, {Key: "a", Kind: "task"}, {Key: "b", Kind: "task"}, {Key: "f", Kind: "finish"}}, Edges: [][]string{{"s", "c"}, {"c", "a", "yes"}, {"c", "b", "no"}, {"a", "f"}, {"b", "f"}}}
	visited := ""
	err := Execute(context.Background(), g, func(n Node, _ int) (Result, error) { visited += n.Key; return Result{Choice: "no"}, nil })
	if err != nil || visited != "cb" {
		t.Fatalf("path=%s err=%v", visited, err)
	}
}
func TestRepeatLimitStopsCycle(t *testing.T) {
	g := Graph{Nodes: []Node{{Key: "s", Kind: "start"}, {Key: "r", Kind: "repeat"}, {Key: "f", Kind: "finish"}}, Edges: [][]string{{"s", "r"}, {"r", "r", "again"}, {"r", "f", "done"}}, Limits: map[string]int{"max_attempts": 2}}
	count := 0
	err := Execute(context.Background(), g, func(Node, int) (Result, error) { count++; return Result{Choice: "again"}, nil })
	if err == nil || !strings.Contains(err.Error(), "attempt limit") || count != 2 {
		t.Fatalf("count=%d err=%v", count, err)
	}
}
func TestApprovalStopsBeforeFollowingTask(t *testing.T) {
	g := Graph{Nodes: []Node{{Key: "s", Kind: "start"}, {Key: "approve", Kind: "approval"}, {Key: "f", Kind: "finish"}}, Edges: [][]string{{"s", "approve"}, {"approve", "f"}}}
	if err := Execute(context.Background(), g, func(n Node, _ int) (Result, error) { return Result{Stop: n.Kind == "approval"}, nil }); err != nil {
		t.Fatal(err)
	}
}
