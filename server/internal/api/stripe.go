package api

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/arosasg/botinc-v2/server/internal/httpx"
	"github.com/google/uuid"
)

func (s *Server) createCheckout(w http.ResponseWriter, r *http.Request) {
	sc := scopeOf(r.Context())
	if !requireRole(sc, "owner", "admin") {
		httpx.Error(w, 403, "workspace owner or admin required")
		return
	}
	if s.cfg.StripeSecretKey == "" || s.cfg.StripeWebhook == "" {
		httpx.Error(w, 503, "payments are not configured")
		return
	}
	var in struct {
		Amount int `json:"amount_cents"`
	}
	if err := httpx.Decode(r, &in); err != nil {
		httpx.Error(w, 400, err.Error())
		return
	}
	if in.Amount != 500 && in.Amount != 1000 && in.Amount != 2500 && in.Amount != 5000 {
		httpx.Error(w, 400, "choose $5, $10, $25 or $50")
		return
	}
	var id uuid.UUID
	if err := s.pool.QueryRow(r.Context(), `insert into billing_orders(workspace_id,created_by,amount_cents) values($1,$2,$3) returning id`, sc.WorkspaceID, sc.UserID, in.Amount).Scan(&id); err != nil {
		s.fail(w, err)
		return
	}
	back := strings.TrimRight(s.cfg.FrontendOrigin, "/") + "/w?workspace=" + url.QueryEscape(sc.Slug)
	form := url.Values{
		"adaptive_pricing[enabled]": {"false"},
		"mode":                      {"payment"}, "client_reference_id": {id.String()}, "metadata[order_id]": {id.String()},
		"line_items[0][price_data][currency]": {"usd"}, "line_items[0][price_data][unit_amount]": {strconv.Itoa(in.Amount)},
		"line_items[0][price_data][product_data][name]": {"BotInc credits"}, "line_items[0][quantity]": {"1"},
		"success_url": {back + "&payment=received"}, "cancel_url": {back + "&payment=cancelled"},
	}
	base := s.stripeAPI
	if base == "" {
		base = "https://api.stripe.com"
	}
	req, err := http.NewRequestWithContext(r.Context(), "POST", base+"/v1/checkout/sessions", strings.NewReader(form.Encode()))
	if err != nil {
		s.fail(w, err)
		return
	}
	req.SetBasicAuth(s.cfg.StripeSecretKey, "")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Idempotency-Key", id.String())
	client := &http.Client{Timeout: 20 * time.Second, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}
	res, err := client.Do(req)
	if err != nil {
		httpx.Error(w, 502, "payment provider could not be reached")
		return
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		httpx.Error(w, 502, "payment provider could not create checkout")
		return
	}
	var session struct {
		ID  string `json:"id"`
		URL string `json:"url"`
	}
	if err := json.NewDecoder(io.LimitReader(res.Body, 1<<20)).Decode(&session); err != nil || session.ID == "" {
		httpx.Error(w, 502, "payment provider returned an invalid checkout")
		return
	}
	dest, err := url.Parse(session.URL)
	if err != nil || dest.Scheme != "https" || dest.Host != "checkout.stripe.com" {
		httpx.Error(w, 502, "payment provider returned an invalid checkout URL")
		return
	}
	if _, err := s.pool.Exec(r.Context(), `update billing_orders set stripe_session_id=$2,checkout_url=$3 where id=$1`, id, session.ID, session.URL); err != nil {
		s.fail(w, err)
		return
	}
	httpx.JSON(w, 201, map[string]any{"url": session.URL, "order_id": id, "test_mode": strings.HasPrefix(s.cfg.StripeSecretKey, "sk_test_")})
}

func validStripeSignature(body []byte, header, secret string, now time.Time) bool {
	if secret == "" {
		return false
	}
	var timestamp string
	var signatures []string
	for _, part := range strings.Split(header, ",") {
		key, value, ok := strings.Cut(strings.TrimSpace(part), "=")
		if !ok {
			continue
		}
		if key == "t" {
			timestamp = value
		}
		if key == "v1" {
			signatures = append(signatures, value)
		}
	}
	ts, err := strconv.ParseInt(timestamp, 10, 64)
	if err != nil || ts < now.Unix()-300 || ts > now.Unix()+300 {
		return false
	}
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(timestamp + "."))
	mac.Write(body)
	for _, signature := range signatures {
		candidate, err := hex.DecodeString(signature)
		if err == nil && hmac.Equal(candidate, mac.Sum(nil)) {
			return true
		}
	}
	return false
}

func (s *Server) stripeWebhook(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(http.MaxBytesReader(w, r.Body, 1<<20))
	if err != nil {
		httpx.Error(w, 400, "invalid webhook body")
		return
	}
	if !validStripeSignature(body, r.Header.Get("Stripe-Signature"), s.cfg.StripeWebhook, time.Now()) {
		httpx.Error(w, 400, "invalid webhook signature")
		return
	}
	var event struct {
		ID   string `json:"id"`
		Type string `json:"type"`
		Live bool   `json:"livemode"`
		Data struct {
			Object struct {
				ID        string `json:"id"`
				Status    string `json:"payment_status"`
				Currency  string `json:"currency"`
				Amount    int    `json:"amount_total"`
				Reference string `json:"client_reference_id"`
				Metadata  struct {
					Order string `json:"order_id"`
				} `json:"metadata"`
			} `json:"object"`
		} `json:"data"`
	}
	if err := json.Unmarshal(body, &event); err != nil || event.ID == "" {
		httpx.Error(w, 400, "invalid webhook event")
		return
	}
	if event.Live != strings.HasPrefix(s.cfg.StripeSecretKey, "sk_live_") {
		httpx.Error(w, 400, "payment environment mismatch")
		return
	}
	if event.Type != "checkout.session.completed" && event.Type != "checkout.session.async_payment_succeeded" {
		httpx.JSON(w, 200, map[string]bool{"ok": true})
		return
	}
	object := event.Data.Object
	if object.Status != "paid" {
		httpx.JSON(w, 200, map[string]bool{"ok": true})
		return
	}
	id, err := uuid.Parse(object.Metadata.Order)
	if err != nil || object.Reference != id.String() || object.Currency != "usd" {
		httpx.Error(w, 400, "payment order does not match")
		return
	}
	ctx := r.Context()
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		s.fail(w, err)
		return
	}
	defer tx.Rollback(ctx)
	var ws uuid.UUID
	var amount int
	var session, status string
	if err := tx.QueryRow(ctx, `select workspace_id,amount_cents,coalesce(stripe_session_id,''),status from billing_orders where id=$1 for update`, id).Scan(&ws, &amount, &session, &status); err != nil {
		httpx.Error(w, 409, "payment order is not ready")
		return
	}
	if amount != object.Amount || session != object.ID {
		httpx.Error(w, 409, "payment amount or session does not match")
		return
	}
	tag, err := tx.Exec(ctx, `insert into billing_events(event_id) values($1) on conflict do nothing`, event.ID)
	if err != nil {
		s.fail(w, err)
		return
	}
	if tag.RowsAffected() > 0 && status != "paid" {
		var ledger uuid.UUID
		if err := tx.QueryRow(ctx, `insert into credit_ledger(workspace_id,kind,amount_cents,note) values($1,'topup',$2,$3) returning id`, ws, amount, fmt.Sprintf("Stripe payment %s", session)).Scan(&ledger); err != nil {
			s.fail(w, err)
			return
		}
		if _, err := tx.Exec(ctx, `update billing_orders set status='paid',paid_at=now(),ledger_id=$2 where id=$1`, id, ledger); err != nil {
			s.fail(w, err)
			return
		}
	}
	if err := tx.Commit(ctx); err != nil {
		s.fail(w, err)
		return
	}
	s.hub.Publish(ws, "credits.updated", map[string]any{})
	httpx.JSON(w, 200, map[string]bool{"ok": true})
}
