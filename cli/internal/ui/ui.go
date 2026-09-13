// Package ui prints results. Two modes only: a plain table for a person and
// exact JSON for a script. The table never truncates an identifier or a
// figure, because a clipped id is worse than a wide line.
package ui

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"
	"text/tabwriter"
	"time"
)

var (
	Out io.Writer = os.Stdout
	Err io.Writer = os.Stderr
	// JSON is set by the --json flag.
	JSON bool
)

// Emit writes v as JSON when --json is set and reports whether it did, so a
// caller can skip its human rendering.
func Emit(v any) bool {
	if !JSON {
		return false
	}
	enc := json.NewEncoder(Out)
	enc.SetIndent("", "  ")
	_ = enc.Encode(v)
	return true
}

type Table struct {
	w    *tabwriter.Writer
	cols int
}

func NewTable(headers ...string) *Table {
	t := &Table{w: tabwriter.NewWriter(Out, 0, 4, 2, ' ', 0), cols: len(headers)}
	upper := make([]string, len(headers))
	for i, h := range headers {
		upper[i] = strings.ToUpper(h)
	}
	fmt.Fprintln(t.w, strings.Join(upper, "\t"))
	return t
}

func (t *Table) Row(cells ...string) {
	for i, c := range cells {
		cells[i] = strings.ReplaceAll(strings.TrimSpace(c), "\n", " ")
	}
	fmt.Fprintln(t.w, strings.Join(cells, "\t"))
}

func (t *Table) Flush() { _ = t.w.Flush() }

// Say writes one line for a person. Sentence case, terminal period, no emoji.
func Say(format string, args ...any) {
	if JSON {
		return
	}
	fmt.Fprintf(Out, format+"\n", args...)
}

// Warn writes to stderr so it does not pollute piped output.
func Warn(format string, args ...any) {
	fmt.Fprintf(Err, format+"\n", args...)
}

// Field prints a label and value pair for a detail view.
func Field(label, value string) {
	if JSON || strings.TrimSpace(value) == "" {
		return
	}
	fmt.Fprintf(Out, "%-14s %s\n", label, value)
}

// Ago renders a timestamp the way the product does: a real elapsed figure,
// never a vague word.
func Ago(t *time.Time) string {
	if t == nil {
		return "-"
	}
	d := time.Since(*t)
	switch {
	case d < time.Minute:
		return fmt.Sprintf("%ds ago", int(d.Seconds()))
	case d < time.Hour:
		return fmt.Sprintf("%dm ago", int(d.Minutes()))
	case d < 24*time.Hour:
		return fmt.Sprintf("%dh %dm ago", int(d.Hours()), int(d.Minutes())%60)
	default:
		return t.Format("2006-01-02")
	}
}

// Money renders cents as a figure with its unit, unrounded.
func Money(cents int) string {
	return fmt.Sprintf("$%d.%02d", cents/100, abs(cents)%100)
}

func abs(n int) int {
	if n < 0 {
		return -n
	}
	return n
}

// Truncate shortens free text for a table cell. Identifiers and figures are
// never passed through this.
func Truncate(s string, n int) string {
	s = strings.ReplaceAll(strings.TrimSpace(s), "\n", " ")
	if len(s) <= n {
		return s
	}
	// The brand allows two Unicode marks and an ellipsis is not one of them.
	return s[:n-3] + "..."
}
