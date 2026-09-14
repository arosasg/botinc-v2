package scheduler

import (
	"testing"
	"time"
)

func TestNextFromInitializesAFutureOccurrence(t *testing.T) {
	next, ok := nextFrom([]byte(`{"kind":"schedule","cron":"0 8 * * 1-5","tz":"Europe/Madrid"}`))
	if !ok {
		t.Fatal("valid migrated schedule was rejected")
	}
	if !next.After(time.Now()) || next.Sub(time.Now()) > 8*24*time.Hour {
		t.Fatalf("next occurrence is not a safe future schedule: %s", next)
	}
}

func TestNextFromRejectsInvalidImportedSchedule(t *testing.T) {
	if _, ok := nextFrom([]byte(`{"kind":"schedule","cron":"not cron","tz":"Europe/Madrid"}`)); ok {
		t.Fatal("invalid schedule must remain unfired")
	}
}
