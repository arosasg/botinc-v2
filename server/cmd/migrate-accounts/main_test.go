package main

import (
	"encoding/json"
	"testing"
	"time"
)

func TestConvertQuotaPreservesUsageAndObservationTime(t *testing.T) {
	observed := time.Date(2026, 9, 14, 18, 5, 0, 0, time.FixedZone("source", 2*60*60))
	raw := json.RawMessage(`[{"label":"Session","percent":45,"resets_at":"19:00"},{"label":"Week","percent":63,"resets_at":null}]`)
	converted, err := convertQuota(raw, &observed)
	if err != nil {
		t.Fatal(err)
	}
	var windows []targetLimit
	if err := json.Unmarshal(converted, &windows); err != nil {
		t.Fatal(err)
	}
	if len(windows) != 2 || windows[0].Window != "session" || windows[0].Used != 45 || windows[0].Limit != 100 {
		t.Fatalf("unexpected converted quota: %+v", windows)
	}
	if windows[0].ObservedAt != "2026-09-14T16:05:00Z" || windows[1].ObservedAt != windows[0].ObservedAt {
		t.Fatalf("observation time was not preserved: %+v", windows)
	}
}
