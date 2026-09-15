package main

import (
	"crypto/aes"
	"crypto/cipher"
	"testing"
)

func TestRepositoryFullNameAcceptsLegacyGitHubForms(t *testing.T) {
	for _, raw := range []string{
		"https://github.com/Acme/widgets.git",
		"git@github.com:Acme/widgets.git",
		"ssh://git@github.com/Acme/widgets",
	} {
		got, err := repositoryFullName(raw)
		if err != nil || got != "Acme/widgets" {
			t.Fatalf("repositoryFullName(%q) = %q, %v", raw, got, err)
		}
	}
}

func TestOpenSourceEnvironmentAuthenticatesKeyID(t *testing.T) {
	key := make([]byte, 32)
	for i := range key {
		key[i] = 7
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		t.Fatal(err)
	}
	aead, err := cipher.NewGCM(block)
	if err != nil {
		t.Fatal(err)
	}
	nonce := make([]byte, aead.NonceSize())
	prefix := []byte{3}
	sealed := append(append([]byte{}, prefix...), nonce...)
	sealed = aead.Seal(sealed, nonce, []byte("secret-value"), prefix)
	opened, err := openSourceEnvironment(map[byte]cipher.AEAD{3: aead}, sealed)
	if err != nil || string(opened) != "secret-value" {
		t.Fatalf("opened source environment = %q, %v", opened, err)
	}
	sealed[0] = 4
	if _, err := openSourceEnvironment(map[byte]cipher.AEAD{3: aead}, sealed); err == nil {
		t.Fatal("unknown source key id must be rejected")
	}
}

func TestBlockedEnvironmentKeyKeepsRuntimeIsolation(t *testing.T) {
	for _, key := range []string{"BOTINC_RUN_TOKEN", "HOME", "CODEX_HOME", "XDG_CONFIG_HOME"} {
		if !blockedEnvironmentKey(key) {
			t.Fatalf("platform-owned key %s was allowed", key)
		}
	}
	if blockedEnvironmentKey("DATABASE_URL") {
		t.Fatal("ordinary repository variable was blocked")
	}
}
