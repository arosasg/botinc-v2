// Package scheduler fires due routines and reconciles stale runs. It is a
// single loop over the database rather than an in-memory cron table, so a
// restart never loses a schedule and two replicas cannot double-fire: the
// claim is an UPDATE ... WHERE next_run_at <= now() that only one wins.
package scheduler

import (
	"context"
	"encoding/json"
	"log/slog"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/robfig/cron/v3"
)

// Firer is the piece of the API that knows how to queue a routine's run.
type Firer interface {
	FireDue(ctx context.Context, workspaceID, autopilotID uuid.UUID) error
	Reconcile(ctx context.Context)
}

type Scheduler struct {
	pool  *pgxpool.Pool
	firer Firer
	log   *slog.Logger
	tick  time.Duration
}

func New(pool *pgxpool.Pool, firer Firer, log *slog.Logger) *Scheduler {
	return &Scheduler{pool: pool, firer: firer, log: log, tick: 20 * time.Second}
}

var parser = cron.NewParser(cron.Minute | cron.Hour | cron.Dom | cron.Month | cron.Dow | cron.Descriptor)

func (s *Scheduler) Run(ctx context.Context) {
	t := time.NewTicker(s.tick)
	defer t.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-t.C:
			s.once(ctx)
		}
	}
}

func (s *Scheduler) once(ctx context.Context) {
	s.firer.Reconcile(ctx)

	// Claim every routine that is due, one row at a time, advancing
	// next_run_at in the same statement so a second replica sees nothing.
	for {
		var id, ws uuid.UUID
		var trigger []byte
		err := s.pool.QueryRow(ctx, `update autopilots set next_run_at = null where id = (
			select id from autopilots where enabled and next_run_at is not null and next_run_at <= now()
			order by next_run_at limit 1 for update skip locked
		) returning id, workspace_id, trigger`).Scan(&id, &ws, &trigger)
		if err != nil {
			return // no due rows, or a transient error the next tick retries
		}
		if err := s.firer.FireDue(ctx, ws, id); err != nil {
			s.log.Error("autopilot fire", "autopilot", id, "err", err)
		}
		if next, ok := nextFrom(trigger); ok {
			if _, err := s.pool.Exec(ctx, `update autopilots set next_run_at=$2 where id=$1`, id, next); err != nil {
				s.log.Error("autopilot reschedule", "autopilot", id, "err", err)
			}
		}
	}
}

// nextFrom computes the following fire time from the stored trigger.
func nextFrom(raw []byte) (time.Time, bool) {
	var t struct {
		Kind string `json:"kind"`
		Cron string `json:"cron"`
		TZ   string `json:"tz"`
	}
	if err := json.Unmarshal(raw, &t); err != nil || t.Kind != "schedule" || t.Cron == "" {
		return time.Time{}, false
	}
	sched, err := parser.Parse(t.Cron)
	if err != nil {
		return time.Time{}, false
	}
	loc := time.UTC
	if t.TZ != "" {
		if l, err := time.LoadLocation(t.TZ); err == nil {
			loc = l
		}
	}
	return sched.Next(time.Now().In(loc)).UTC(), true
}
