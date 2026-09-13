// Package migrations carries the SQL files as an embedded filesystem so the
// binary is self-contained: no migration step to forget on deploy.
package migrations

import "embed"

//go:embed *.sql
var files embed.FS

// FS is the embedded filesystem db.Migrate reads, rooted so that entries are
// addressed as "migrations/<name>.sql".
var FS = files

// Dir is the directory name inside FS.
const Dir = "."
