// Package config stores what the CLI needs between invocations: where the API
// is, who you are, and which workspace you are working in. The file is 0600
// and holds a token, so it is never written world-readable and never logged.
package config

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"
)

type Config struct {
	APIURL    string `json:"api_url"`
	Token     string `json:"token,omitempty"`
	Workspace string `json:"workspace,omitempty"`
	Email     string `json:"email,omitempty"`
}

const DefaultAPIURL = "https://api.botinc.ai"

// Path is the config file, honouring BOTINC_CONFIG and XDG_CONFIG_HOME.
func Path() (string, error) {
	if p := strings.TrimSpace(os.Getenv("BOTINC_CONFIG")); p != "" {
		return p, nil
	}
	base := strings.TrimSpace(os.Getenv("XDG_CONFIG_HOME"))
	if base == "" {
		home, err := os.UserHomeDir()
		if err != nil {
			return "", err
		}
		base = filepath.Join(home, ".config")
	}
	return filepath.Join(base, "botinc", "config.json"), nil
}

// Load reads the file and applies environment overrides. A missing file is
// not an error: it means you have not signed in yet.
func Load() (Config, error) {
	c := Config{APIURL: DefaultAPIURL}
	path, err := Path()
	if err != nil {
		return c, err
	}
	body, err := os.ReadFile(path)
	if err == nil {
		if err := json.Unmarshal(body, &c); err != nil {
			return c, errors.New("the config file is not valid JSON: " + path)
		}
	} else if !os.IsNotExist(err) {
		return c, err
	}
	if c.APIURL == "" {
		c.APIURL = DefaultAPIURL
	}
	// The environment wins, so CI can point at a different deployment without
	// touching a file.
	if v := strings.TrimSpace(os.Getenv("BOTINC_API_URL")); v != "" {
		c.APIURL = v
	}
	if v := strings.TrimSpace(os.Getenv("BOTINC_TOKEN")); v != "" {
		c.Token = v
	}
	if v := strings.TrimSpace(os.Getenv("BOTINC_WORKSPACE")); v != "" {
		c.Workspace = v
	}
	return c, nil
}

// Save writes the file with 0600 permissions, creating the directory.
func Save(c Config) error {
	path, err := Path()
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return err
	}
	body, err := json.MarshalIndent(c, "", "  ")
	if err != nil {
		return err
	}
	// Write to a temporary file and rename, so an interrupted save cannot
	// leave a half-written token behind.
	tmp := path + ".tmp"
	if err := os.WriteFile(tmp, append(body, '\n'), 0o600); err != nil {
		return err
	}
	return os.Rename(tmp, path)
}

// Clear removes the stored credentials but keeps the API URL.
func Clear() error {
	c, err := Load()
	if err != nil {
		return err
	}
	c.Token, c.Email, c.Workspace = "", "", ""
	return Save(c)
}
