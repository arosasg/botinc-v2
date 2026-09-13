// Package auth: email codes, sessions, API keys, device codes and the request
// middleware that resolves the caller. Tokens are random, stored hashed.
package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"math/big"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

const (
	SessionCookie = "botinc_session"
	sessionTTL    = 30 * 24 * time.Hour
	codeTTL       = 10 * time.Minute
	deviceTTL     = 10 * time.Minute
)

type User struct {
	ID        uuid.UUID `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	AvatarURL string    `json:"avatar_url"`
	CreatedAt time.Time `json:"created_at"`
}

type Principal struct {
	User      User
	SessionID uuid.UUID // zero for API-key callers
	APIKeyID  uuid.UUID // zero for session callers
}

type Service struct {
	pool         *pgxpool.Pool
	devCode      string
	cookieDomain string
	secure       bool
	SendCode     func(ctx context.Context, email, code string) error
}

func New(pool *pgxpool.Pool, devCode, cookieDomain string, secure bool) *Service {
	return &Service{pool: pool, devCode: devCode, cookieDomain: cookieDomain, secure: secure}
}

func hash(s string) string {
	h := sha256.Sum256([]byte(s))
	return hex.EncodeToString(h[:])
}

func randomToken(n int) string {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return base64.RawURLEncoding.EncodeToString(b)
}

func randomDigits(n int) string {
	var sb strings.Builder
	for i := 0; i < n; i++ {
		v, _ := rand.Int(rand.Reader, big.NewInt(10))
		sb.WriteString(v.String())
	}
	return sb.String()
}

func normalizeEmail(e string) (string, error) {
	e = strings.ToLower(strings.TrimSpace(e))
	if !strings.Contains(e, "@") || strings.HasPrefix(e, "@") || strings.HasSuffix(e, "@") || len(e) > 254 {
		return "", errors.New("enter a valid email address")
	}
	return e, nil
}

// StartEmail creates a login code and sends it. In development the code is
// fixed so the flow can be exercised without a mail provider.
func (s *Service) StartEmail(ctx context.Context, email string) error {
	email, err := normalizeEmail(email)
	if err != nil {
		return err
	}
	var count int
	if err := s.pool.QueryRow(ctx, `select count(*) from login_codes where email=$1 and created_at > now() - interval '15 minutes'`, email).Scan(&count); err != nil {
		return err
	}
	if count >= 5 {
		return errors.New("too many codes requested; wait a few minutes")
	}
	code := s.devCode
	if code == "" {
		code = randomDigits(6)
	}
	if _, err := s.pool.Exec(ctx, `insert into login_codes (email, code_hash, expires_at) values ($1,$2,$3)`, email, hash(email+":"+code), time.Now().Add(codeTTL)); err != nil {
		return err
	}
	if s.devCode != "" || s.SendCode == nil {
		return nil
	}
	return s.SendCode(ctx, email, code)
}

// VerifyEmail consumes a code and returns the user (created on first login).
func (s *Service) VerifyEmail(ctx context.Context, email, code string) (User, error) {
	email, err := normalizeEmail(email)
	if err != nil {
		return User{}, err
	}
	code = strings.TrimSpace(code)
	var id uuid.UUID
	var attempts int
	var codeHash string
	err = s.pool.QueryRow(ctx, `select id, code_hash, attempts from login_codes where email=$1 and consumed_at is null and expires_at > now() order by created_at desc limit 1`, email).Scan(&id, &codeHash, &attempts)
	if errors.Is(err, pgx.ErrNoRows) {
		return User{}, errors.New("that code has expired; request a new one")
	}
	if err != nil {
		return User{}, err
	}
	if attempts >= 5 {
		return User{}, errors.New("too many attempts; request a new code")
	}
	if subtle.ConstantTimeCompare([]byte(codeHash), []byte(hash(email+":"+code))) != 1 {
		_, _ = s.pool.Exec(ctx, `update login_codes set attempts=attempts+1 where id=$1`, id)
		return User{}, errors.New("that code is not right")
	}
	if _, err := s.pool.Exec(ctx, `update login_codes set consumed_at=now() where id=$1`, id); err != nil {
		return User{}, err
	}
	return s.upsertUser(ctx, email, "", "")
}

func (s *Service) upsertUser(ctx context.Context, email, name, avatar string) (User, error) {
	var u User
	err := s.pool.QueryRow(ctx, `insert into users (email, name, avatar_url) values ($1,$2,$3)
		on conflict (email) do update set name = case when users.name='' then excluded.name else users.name end,
		  avatar_url = case when users.avatar_url='' then excluded.avatar_url else users.avatar_url end, last_seen_at=now()
		returning id, email, name, avatar_url, created_at`, email, name, avatar).Scan(&u.ID, &u.Email, &u.Name, &u.AvatarURL, &u.CreatedAt)
	return u, err
}

// UpsertOAuthUser is used by the Google callback.
func (s *Service) UpsertOAuthUser(ctx context.Context, email, name, avatar string) (User, error) {
	email, err := normalizeEmail(email)
	if err != nil {
		return User{}, err
	}
	return s.upsertUser(ctx, email, name, avatar)
}

// CreateSession issues a session token and sets the cookie.
func (s *Service) CreateSession(ctx context.Context, w http.ResponseWriter, r *http.Request, user User) (string, error) {
	token := "bis_" + randomToken(32)
	ip, _, _ := net.SplitHostPort(r.RemoteAddr)
	if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
		ip = strings.TrimSpace(strings.Split(fwd, ",")[0])
	}
	if _, err := s.pool.Exec(ctx, `insert into sessions (user_id, token_hash, user_agent, ip, expires_at) values ($1,$2,$3,$4,$5)`,
		user.ID, hash(token), truncate(r.UserAgent(), 200), ip, time.Now().Add(sessionTTL)); err != nil {
		return "", err
	}
	http.SetCookie(w, &http.Cookie{Name: SessionCookie, Value: token, Path: "/", Domain: s.cookieDomain, HttpOnly: true, Secure: s.secure, SameSite: http.SameSiteLaxMode, Expires: time.Now().Add(sessionTTL)})
	return token, nil
}

func (s *Service) ClearSession(ctx context.Context, w http.ResponseWriter, sessionID uuid.UUID) {
	if sessionID != uuid.Nil {
		_, _ = s.pool.Exec(ctx, `update sessions set revoked_at=now() where id=$1`, sessionID)
	}
	http.SetCookie(w, &http.Cookie{Name: SessionCookie, Value: "", Path: "/", Domain: s.cookieDomain, HttpOnly: true, Secure: s.secure, SameSite: http.SameSiteLaxMode, MaxAge: -1})
}

func truncate(s string, n int) string {
	if len(s) > n {
		return s[:n]
	}
	return s
}

// Resolve looks up the caller from the cookie or a Bearer token (session or API key).
func (s *Service) Resolve(ctx context.Context, r *http.Request) (*Principal, error) {
	token := ""
	if h := r.Header.Get("Authorization"); strings.HasPrefix(strings.ToLower(h), "bearer ") {
		token = strings.TrimSpace(h[7:])
	} else if c, err := r.Cookie(SessionCookie); err == nil {
		token = c.Value
	}
	if token == "" {
		return nil, nil
	}
	// A run token belongs to the runtime protocol, which authenticates itself
	// further down the stack. It is not a user credential, so leave the
	// request unauthenticated rather than failing it here.
	if strings.HasPrefix(token, RunTokenPrefix) {
		return nil, nil
	}
	if strings.HasPrefix(token, "bik_") {
		var p Principal
		err := s.pool.QueryRow(ctx, `select k.id, u.id, u.email, u.name, u.avatar_url, u.created_at from api_keys k join users u on u.id=k.user_id where k.token_hash=$1 and k.revoked_at is null`, hash(token)).
			Scan(&p.APIKeyID, &p.User.ID, &p.User.Email, &p.User.Name, &p.User.AvatarURL, &p.User.CreatedAt)
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("invalid API key")
		}
		if err != nil {
			return nil, err
		}
		_, _ = s.pool.Exec(ctx, `update api_keys set last_used_at=now() where id=$1`, p.APIKeyID)
		return &p, nil
	}
	var p Principal
	err := s.pool.QueryRow(ctx, `select s.id, u.id, u.email, u.name, u.avatar_url, u.created_at from sessions s join users u on u.id=s.user_id where s.token_hash=$1 and s.revoked_at is null and s.expires_at > now()`, hash(token)).
		Scan(&p.SessionID, &p.User.ID, &p.User.Email, &p.User.Name, &p.User.AvatarURL, &p.User.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("session expired")
	}
	if err != nil {
		return nil, err
	}
	_, _ = s.pool.Exec(ctx, `update sessions set last_seen_at=now() where id=$1 and last_seen_at < now() - interval '5 minutes'`, p.SessionID)
	return &p, nil
}

// --- device code flow (CLI login) ---

type DeviceStart struct {
	DeviceCode string `json:"device_code"`
	UserCode   string `json:"user_code"`
	ExpiresIn  int    `json:"expires_in"`
	Interval   int    `json:"interval"`
}

func (s *Service) StartDevice(ctx context.Context) (DeviceStart, error) {
	device := randomToken(32)
	user := strings.ToUpper(randomToken(3))[:4] + "-" + strings.ToUpper(randomToken(3))[:4]
	if _, err := s.pool.Exec(ctx, `insert into device_codes (device_code_hash, user_code, expires_at) values ($1,$2,$3)`, hash(device), user, time.Now().Add(deviceTTL)); err != nil {
		return DeviceStart{}, err
	}
	return DeviceStart{DeviceCode: device, UserCode: user, ExpiresIn: int(deviceTTL.Seconds()), Interval: 3}, nil
}

func (s *Service) ApproveDevice(ctx context.Context, userCode string, userID uuid.UUID) error {
	tag, err := s.pool.Exec(ctx, `update device_codes set user_id=$2, approved_at=now() where user_code=$1 and approved_at is null and expires_at > now()`, strings.ToUpper(strings.TrimSpace(userCode)), userID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return errors.New("that code is not valid or has expired")
	}
	return nil
}

// PollDevice returns an API key once the user approved the device code.
func (s *Service) PollDevice(ctx context.Context, deviceCode string) (token string, pending bool, err error) {
	var id uuid.UUID
	var userID *uuid.UUID
	err = s.pool.QueryRow(ctx, `select id, user_id from device_codes where device_code_hash=$1 and expires_at > now()`, hash(deviceCode)).Scan(&id, &userID)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", false, errors.New("device code expired")
	}
	if err != nil {
		return "", false, err
	}
	if userID == nil {
		return "", true, nil
	}
	token, err = s.CreateAPIKey(ctx, *userID, uuid.Nil, "botinc CLI")
	if err != nil {
		return "", false, err
	}
	_, _ = s.pool.Exec(ctx, `delete from device_codes where id=$1`, id)
	return token, false, nil
}

func (s *Service) CreateAPIKey(ctx context.Context, userID, workspaceID uuid.UUID, name string) (string, error) {
	token := "bik_" + randomToken(32)
	var ws any
	if workspaceID != uuid.Nil {
		ws = workspaceID
	}
	if _, err := s.pool.Exec(ctx, `insert into api_keys (user_id, workspace_id, name, prefix, token_hash) values ($1,$2,$3,$4,$5)`, userID, ws, name, token[:12], hash(token)); err != nil {
		return "", err
	}
	return token, nil
}

// --- context plumbing ---

// RunTokenPrefix marks a token issued to a sandbox for one run.
const RunTokenPrefix = "brt_"

type ctxKey int

const principalKey ctxKey = 1

func WithPrincipal(ctx context.Context, p *Principal) context.Context {
	return context.WithValue(ctx, principalKey, p)
}

func FromContext(ctx context.Context) *Principal {
	p, _ := ctx.Value(principalKey).(*Principal)
	return p
}

// Middleware resolves the caller when credentials are present; handlers that
// need one use Require.
func (s *Service) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		p, err := s.Resolve(r.Context(), r)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error":%q}`, err.Error()), http.StatusUnauthorized)
			return
		}
		if p != nil {
			r = r.WithContext(WithPrincipal(r.Context(), p))
		}
		next.ServeHTTP(w, r)
	})
}

func Require(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if FromContext(r.Context()) == nil {
			w.Header().Set("Content-Type", "application/json")
			http.Error(w, `{"error":"sign in to continue","code":"unauthenticated"}`, http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}
