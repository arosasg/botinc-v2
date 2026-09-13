package config

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// isolate clears the environment overrides so a variable set by whatever is
// running the tests cannot stand in for the file under test.
func isolate(t *testing.T, path string) {
	t.Helper()
	t.Setenv("BOTINC_CONFIG", path)
	t.Setenv("BOTINC_API_URL", "")
	t.Setenv("BOTINC_TOKEN", "")
	t.Setenv("BOTINC_WORKSPACE", "")
}

func TestLoadWithNoFileIsNotAnError(t *testing.T) {
	isolate(t, filepath.Join(t.TempDir(), "missing.json"))
	c, err := Load()
	if err != nil {
		t.Fatalf("a missing config means not signed in, not a failure: %v", err)
	}
	if c.APIURL != DefaultAPIURL || c.Token != "" {
		t.Fatalf("unexpected default config: %+v", c)
	}
}

func TestSaveIsPrivateAndRoundTrips(t *testing.T) {
	path := filepath.Join(t.TempDir(), "config.json")
	isolate(t, path)

	if err := Save(Config{APIURL: "https://api.test", Token: "bis_secret", Workspace: "acme", Email: "a@b.test"}); err != nil {
		t.Fatal(err)
	}
	info, err := os.Stat(path)
	if err != nil {
		t.Fatal(err)
	}
	// The file holds a session token, so it must not be world-readable.
	if info.Mode().Perm() != 0o600 {
		t.Fatalf("config must be 0600, got %v", info.Mode().Perm())
	}
	c, err := Load()
	if err != nil {
		t.Fatal(err)
	}
	if c.Token != "bis_secret" || c.Workspace != "acme" || c.APIURL != "https://api.test" {
		t.Fatalf("config did not round-trip: %+v", c)
	}
}

func TestEnvironmentOverridesTheFile(t *testing.T) {
	path := filepath.Join(t.TempDir(), "config.json")
	isolate(t, path)
	if err := Save(Config{APIURL: "https://stored", Token: "stored", Workspace: "stored-ws"}); err != nil {
		t.Fatal(err)
	}
	t.Setenv("BOTINC_API_URL", "https://from-env")
	t.Setenv("BOTINC_TOKEN", "from-env")
	t.Setenv("BOTINC_WORKSPACE", "env-ws")

	c, err := Load()
	if err != nil {
		t.Fatal(err)
	}
	if c.APIURL != "https://from-env" || c.Token != "from-env" || c.Workspace != "env-ws" {
		t.Fatalf("the environment must win so CI can point elsewhere: %+v", c)
	}
}

func TestClearKeepsTheAPIURL(t *testing.T) {
	isolate(t, filepath.Join(t.TempDir(), "config.json"))
	if err := Save(Config{APIURL: "https://api.test", Token: "t", Workspace: "w", Email: "e@x.test"}); err != nil {
		t.Fatal(err)
	}
	if err := Clear(); err != nil {
		t.Fatal(err)
	}
	c, err := Load()
	if err != nil {
		t.Fatal(err)
	}
	if c.Token != "" || c.Workspace != "" || c.Email != "" {
		t.Fatalf("logout must forget the credentials: %+v", c)
	}
	if c.APIURL != "https://api.test" {
		t.Fatalf("logout should not forget which deployment you use: %q", c.APIURL)
	}
}

func TestCorruptConfigSaysWhichFile(t *testing.T) {
	path := filepath.Join(t.TempDir(), "config.json")
	isolate(t, path)
	if err := os.WriteFile(path, []byte("{not json"), 0o600); err != nil {
		t.Fatal(err)
	}
	_, err := Load()
	if err == nil || !strings.Contains(err.Error(), path) {
		t.Fatalf("the error should name the file so it can be fixed: %v", err)
	}
}

// An interrupted save must not leave a truncated token behind.
func TestSaveIsAtomic(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "config.json")
	isolate(t, path)
	if err := Save(Config{APIURL: "https://a", Token: "first"}); err != nil {
		t.Fatal(err)
	}
	if err := Save(Config{APIURL: "https://a", Token: "second"}); err != nil {
		t.Fatal(err)
	}
	entries, err := os.ReadDir(dir)
	if err != nil {
		t.Fatal(err)
	}
	for _, e := range entries {
		if strings.HasSuffix(e.Name(), ".tmp") {
			t.Fatalf("a temporary file was left behind: %s", e.Name())
		}
	}
	c, _ := Load()
	if c.Token != "second" {
		t.Fatalf("the second save should win: %q", c.Token)
	}
}
