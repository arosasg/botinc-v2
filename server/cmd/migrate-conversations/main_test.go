package main

import (
	"encoding/json"
	"testing"
)

func TestTargetRole(t *testing.T) {
	for source, want := range map[string]string{
		"user": "user", "assistant": "operator", "system": "notice",
	} {
		if got := targetRole(source); got != want {
			t.Fatalf("targetRole(%q)=%q, want %q", source, got, want)
		}
	}
}

func TestMessageMetaPreservesSourceProvenance(t *testing.T) {
	taskID := "task-1"
	authorType := "agent"
	message := sourceMessage{
		Role: "assistant", MessageKind: "message", TaskID: &taskID,
		AuthorType: &authorType, QuickActions: json.RawMessage(`[]`),
		ExecutionSwitch: json.RawMessage(`{"from":"claude","to":"codex"}`),
	}
	encoded, err := messageMeta(message)
	if err != nil {
		t.Fatal(err)
	}
	var meta map[string]any
	if err := json.Unmarshal(encoded, &meta); err != nil {
		t.Fatal(err)
	}
	if meta["v1"] != true || meta["source_role"] != "assistant" || meta["task_id"] != taskID {
		t.Fatalf("unexpected metadata: %s", encoded)
	}
	if _, ok := meta["execution_switch"]; !ok {
		t.Fatalf("execution switch missing: %s", encoded)
	}
}
