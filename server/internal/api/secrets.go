package api

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"io"

	"github.com/google/uuid"
)

// The credential store. Provider tokens never sit in a row a handler returns;
// a row holds a ref, and the plaintext only leaves here for a runtime spec.
// AES-256-GCM under BOTINC_SECRETS_KEY; without a key the server refuses to
// store rather than writing something it cannot protect.

var errNoSecretsKey = errors.New("BOTINC_SECRETS_KEY is not configured")

func (s *Server) aead() (cipher.AEAD, error) {
	if s.cfg.SecretsKey == "" {
		return nil, errNoSecretsKey
	}
	key, err := hex.DecodeString(s.cfg.SecretsKey)
	if err != nil || len(key) != 32 {
		// Accept a passphrase too: derive 32 bytes from it.
		sum := sha256.Sum256([]byte(s.cfg.SecretsKey))
		key = sum[:]
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	return cipher.NewGCM(block)
}

// writeSecret stores plaintext against a fresh ref and returns that ref.
func (s *Server) writeSecret(ctx context.Context, ws uuid.UUID, plaintext string) (string, error) {
	gcm, err := s.aead()
	if err != nil {
		return "", err
	}
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}
	sealed := gcm.Seal(nonce, nonce, []byte(plaintext), []byte(ws.String()))
	ref := "sec_" + uuid.NewString()
	if _, err := s.pool.Exec(ctx, `insert into secrets (ref, workspace_id, ciphertext) values ($1,$2,$3)`, ref, ws, sealed); err != nil {
		return "", err
	}
	return ref, nil
}

func (s *Server) readSecret(ctx context.Context, ref string) (string, error) {
	if ref == "" {
		return "", errors.New("no secret ref")
	}
	gcm, err := s.aead()
	if err != nil {
		return "", err
	}
	var sealed []byte
	var ws *uuid.UUID
	if err := s.pool.QueryRow(ctx, `select ciphertext, workspace_id from secrets where ref=$1`, ref).Scan(&sealed, &ws); err != nil {
		return "", err
	}
	if len(sealed) < gcm.NonceSize() {
		return "", errors.New("secret is corrupt")
	}
	aad := ""
	if ws != nil {
		aad = ws.String()
	}
	out, err := gcm.Open(nil, sealed[:gcm.NonceSize()], sealed[gcm.NonceSize():], []byte(aad))
	if err != nil {
		return "", err
	}
	return string(out), nil
}

func (s *Server) deleteSecret(ctx context.Context, ref string) {
	if ref == "" {
		return
	}
	_, _ = s.pool.Exec(ctx, `delete from secrets where ref=$1`, ref)
}
