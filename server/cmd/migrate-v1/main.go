package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"github.com/arosasg/botinc-v2/server/internal/db"
	"github.com/arosasg/botinc-v2/server/internal/migration"
	"github.com/arosasg/botinc-v2/server/migrations"
	"log/slog"
	"os"
	"time"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
func run() error {
	input := flag.String("input", "", "hashed v1 export directory")
	owner := flag.String("owner-email", "", "existing source workspace owner")
	apply := flag.Bool("apply", false, "commit import; default runs all inserts then rolls back")
	files := flag.String("attachments", "", "attachment manifest")
	source := flag.String("attachment-files", "", "downloaded attachment root")
	target := flag.String("attachment-dir", "", "destination attachment storage")
	flag.Parse()
	if *input == "" || *owner == "" {
		return fmt.Errorf("--input and --owner-email are required")
	}
	s, err := migration.Load(*input)
	if err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Minute)
	defer cancel()
	d, err := db.Open(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		return err
	}
	defer d.Close()
	if err := db.Migrate(ctx, d, migrations.FS, slog.Default()); err != nil {
		return err
	}
	result, err := migration.Apply(ctx, d.Pool, s, *owner, *apply)
	if err != nil {
		return err
	}
	if *files != "" {
		if *source == "" || *target == "" {
			return fmt.Errorf("attachment source and target required")
		}
		count, err := migration.ImportFiles(ctx, d.Pool, s.Manifest.WorkspaceID, *files, *source, *target, *apply)
		if err != nil {
			return err
		}
		fmt.Fprintln(os.Stderr, "verified attachments", count)
	}
	return json.NewEncoder(os.Stdout).Encode(result)
}
