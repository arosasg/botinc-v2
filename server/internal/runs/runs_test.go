package runs

import "testing"

func TestProviderForProductModelLabels(t *testing.T) {
	tests := map[string]string{
		"Claude Opus 5": "claude",
		"GPT-5.6 Sol":   "codex",
		"GPT-6 Astra":   "codex",
		"DeepSeek V3":   "deepseek",
		"auto":          "",
	}
	for model, want := range tests {
		if got := providerFor(model); got != want {
			t.Fatalf("providerFor(%q) = %q, want %q", model, got, want)
		}
	}
}
