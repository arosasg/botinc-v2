//go:build integration

package agent

import (
	"context"
	"os"
	"strings"
	"testing"
	"time"
)

func TestDeepSeekHarnessLiveOpenRouter(t *testing.T) {
	if os.Getenv("BOTINC_RUN_REAL_AGENT_SMOKE") != "1" || os.Getenv("OPENROUTER_API_KEY") == "" {
		t.Fatal("live DeepSeek Harness smoke requires explicit opt-in and an OpenRouter credential")
	}
	adapter, err := Pick("deepseek")
	if err != nil {
		t.Fatal(err)
	}
	result, err := Run(context.Background(), adapter, Options{
		Dir: t.TempDir(), Prompt: "Answer exactly DSH_V2_LIVE_OK", Model: "DeepSeek V4.1 Flash", Effort: "High",
		Secret: os.Getenv("OPENROUTER_API_KEY"), Timeout: 3 * time.Minute,
	})
	if err != nil {
		t.Fatal(err)
	}
	if strings.TrimSpace(result["result"].(string)) != "DSH_V2_LIVE_OK" {
		t.Fatalf("unexpected live result: %+v", result)
	}
}
