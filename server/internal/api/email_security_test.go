package api

import (
	"sync"
	"sync/atomic"
	"testing"
)

func TestEmailCodeConcurrentConsumption(t *testing.T) {
	h := newHarness(t)
	email := uniqueEmail(t)
	if err := h.server.auth.StartEmail(t.Context(), email); err != nil {
		t.Fatal(err)
	}
	var accepted atomic.Int32
	var wg sync.WaitGroup
	for range 12 {
		wg.Go(func() {
			if _, err := h.server.auth.VerifyEmail(t.Context(), email, "000000"); err == nil {
				accepted.Add(1)
			}
		})
	}
	wg.Wait()
	if n := accepted.Load(); n != 1 {
		t.Fatalf("code accepted %d times", n)
	}
}
func TestEmailCodeConcurrentAttemptLimit(t *testing.T) {
	h := newHarness(t)
	email := uniqueEmail(t)
	if err := h.server.auth.StartEmail(t.Context(), email); err != nil {
		t.Fatal(err)
	}
	var wg sync.WaitGroup
	for range 12 {
		wg.Go(func() { _, _ = h.server.auth.VerifyEmail(t.Context(), email, "111111") })
	}
	wg.Wait()
	if _, err := h.server.auth.VerifyEmail(t.Context(), email, "000000"); err == nil {
		t.Fatal("accepted code after attempt limit")
	}
	var attempts int
	if err := testPool.QueryRow(t.Context(), `select attempts from login_codes where email=$1`, email).Scan(&attempts); err != nil {
		t.Fatal(err)
	}
	if attempts != 5 {
		t.Fatalf("attempts=%d", attempts)
	}
}

func TestEmailStartConcurrentRateLimit(t *testing.T) {
	h := newHarness(t)
	email := uniqueEmail(t)
	var wg sync.WaitGroup
	results := make(chan error, 15)
	for range 15 {
		wg.Add(1)
		go func() { defer wg.Done(); results <- h.server.auth.StartEmail(t.Context(), email) }()
	}
	wg.Wait()
	close(results)
	accepted := 0
	for err := range results {
		if err == nil {
			accepted++
		}
	}
	if accepted != 5 {
		t.Fatalf("accepted %d requests, want 5", accepted)
	}
	var valid int
	if err := testPool.QueryRow(t.Context(), `select count(*) from login_codes where email=$1 and consumed_at is null`, email).Scan(&valid); err != nil {
		t.Fatal(err)
	}
	if valid != 1 {
		t.Fatalf("%d codes valid after resending", valid)
	}
}
