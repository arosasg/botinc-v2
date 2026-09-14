package api

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/google/uuid"
)

func signStripe(body []byte, secret string, at time.Time) string {
	ts := fmt.Sprint(at.Unix())
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(ts + "."))
	mac.Write(body)
	return "t=" + ts + ",v1=" + hex.EncodeToString(mac.Sum(nil))
}
func TestStripeCheckoutAndConcurrentPayment(t *testing.T) {
	h := newHarness(t)
	h.signIn(uniqueEmail(t))
	h.server.cfg.StripeSecretKey = "sk_test_private"
	h.server.cfg.StripeWebhook = "whsec_private"
	var order string
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/checkout/sessions" {
			t.Error("wrong Stripe endpoint")
		}
		user, _, ok := r.BasicAuth()
		if !ok || user != "sk_test_private" {
			t.Error("missing Stripe auth")
		}
		r.ParseForm()
		order = r.Form.Get("metadata[order_id]")
		if r.Form.Get("line_items[0][price_data][unit_amount]") != "500" || r.Form.Get("mode") != "payment" || r.Form.Get("client_reference_id") != order || r.Header.Get("Idempotency-Key") != order {
			t.Error("invalid checkout request")
		}
		json.NewEncoder(w).Encode(map[string]string{"id": "cs_test_" + order, "url": "https://checkout.stripe.com/c/pay/" + order})
	}))
	defer upstream.Close()
	h.server.stripeAPI = upstream.URL
	h.do("POST", h.w("/billing/checkout"), map[string]int{"amount_cents": 1}, 400)
	h.do("POST", h.w("/billing/checkout"), map[string]int{"amount_cents": 500}, 201)
	id, err := uuid.Parse(order)
	if err != nil {
		t.Fatal(err)
	}
	var ws uuid.UUID
	if err := testPool.QueryRow(t.Context(), `select workspace_id from billing_orders where id=$1`, id).Scan(&ws); err != nil {
		t.Fatal(err)
	}
	balance := func() int {
		var amount int
		if err := testPool.QueryRow(t.Context(), `select sum(amount_cents) from credit_ledger where workspace_id=$1`, ws).Scan(&amount); err != nil {
			t.Fatal(err)
		}
		return amount
	}
	if balance() != 200 {
		t.Fatal("checkout granted unpaid credit")
	}
	event := func(eventID string, amount int, paid bool) []byte {
		status := "unpaid"
		if paid {
			status = "paid"
		}
		b, _ := json.Marshal(map[string]any{"id": eventID, "type": "checkout.session.completed", "livemode": false, "data": map[string]any{"object": map[string]any{"id": "cs_test_" + order, "payment_status": status, "amount_total": amount, "currency": "usd", "client_reference_id": order, "metadata": map[string]string{"order_id": order}}}})
		return b
	}
	call := func(body []byte, sig string) *httptest.ResponseRecorder {
		r := httptest.NewRequest("POST", "/api/hooks/stripe", strings.NewReader(string(body)))
		r.Header.Set("Stripe-Signature", sig)
		rec := httptest.NewRecorder()
		h.router.ServeHTTP(rec, r)
		return rec
	}
	bad := event("evt_bad", 501, true)
	if rec := call(bad, signStripe(bad, h.server.cfg.StripeWebhook, time.Now())); rec.Code != 409 {
		t.Fatal("wrong amount accepted")
	}
	good := event("evt_good", 500, true)
	if rec := call(good, signStripe(good, "wrong", time.Now())); rec.Code != 400 {
		t.Fatal("forged signature accepted")
	}
	if rec := call(good, signStripe(good, h.server.cfg.StripeWebhook, time.Now().Add(-10*time.Minute))); rec.Code != 400 {
		t.Fatal("expired signature accepted")
	}
	unpaid := event("evt_unpaid", 500, false)
	if rec := call(unpaid, signStripe(unpaid, h.server.cfg.StripeWebhook, time.Now())); rec.Code != 200 {
		t.Fatal(rec.Body.String())
	}
	if balance() != 200 {
		t.Fatal("unpaid webhook granted credit")
	}
	var wg sync.WaitGroup
	results := make(chan int, 12)
	for i := range 12 {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			body := event(fmt.Sprintf("evt_%d", i%3), 500, true)
			results <- call(body, signStripe(body, h.server.cfg.StripeWebhook, time.Now())).Code
		}(i)
	}
	wg.Wait()
	close(results)
	for code := range results {
		if code != 200 {
			t.Fatalf("webhook status %d", code)
		}
	}
	if balance() != 700 {
		t.Fatalf("payment replay credited wrong amount: %d", balance())
	}
	var count int
	if err := testPool.QueryRow(t.Context(), `select count(*) from credit_ledger where workspace_id=$1 and kind='topup'`, ws).Scan(&count); err != nil {
		t.Fatal(err)
	}
	if count != 1 {
		t.Fatalf("duplicate topups: %d", count)
	}
}
