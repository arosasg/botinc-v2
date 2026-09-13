// Command botinc-runtime executes one run inside a sandbox and exits.
//
// It is handed three things by the sandbox environment: the API URL, the run
// id and a token scoped to that run. It claims the run, reads its spec, does
// the work, streams what happened, and reports a final status. It never holds
// a user credential and cannot see another run.
package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/arosasg/botinc-v2/runtime/internal/agent"
	"github.com/arosasg/botinc-v2/runtime/internal/protocol"
	"github.com/arosasg/botinc-v2/runtime/internal/repo"
	"github.com/arosasg/botinc-v2/runtime/internal/workflow"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, "runtime:", err)
		os.Exit(1)
	}
}

func env(key, def string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return def
}

func run() error {
	apiURL := env("BOTINC_API_URL", "")
	runID := env("BOTINC_RUN_ID", "")
	token := env("BOTINC_RUN_TOKEN", "")
	if apiURL == "" || runID == "" || token == "" {
		return errors.New("BOTINC_API_URL, BOTINC_RUN_ID and BOTINC_RUN_TOKEN are all required")
	}
	workdir := env("BOTINC_WORKDIR", filepath.Join(os.TempDir(), "botinc-run-"+runID))
	if err := os.MkdirAll(workdir, 0o700); err != nil {
		return err
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	c := protocol.New(apiURL, runID, token)
	if _, err := c.Claim(ctx); err != nil {
		return fmt.Errorf("claim: %w", err)
	}
	spec, err := c.Spec(ctx)
	if err != nil {
		return fmt.Errorf("spec: %w", err)
	}

	// From here on every exit reports a status, so a run never hangs in
	// 'running' waiting for a reconciler to give up on it.
	heartbeatCtx, cancelHeartbeat := context.WithCancel(ctx)
	heartbeatDone := make(chan struct{})
	go func() {
		defer close(heartbeatDone)
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-heartbeatCtx.Done():
				return
			case <-ticker.C:
				call, cancel := context.WithTimeout(heartbeatCtx, 15*time.Second)
				err := c.Heartbeat(call)
				cancel()
				if errors.Is(err, protocol.ErrUnauthorized) {
					stop()
					return
				}
			}
		}
	}()
	result, workErr := execute(ctx, c, spec, workdir)
	cancelHeartbeat()
	<-heartbeatDone
	finish := protocol.Finish{Status: "done", Result: result}
	if workErr != nil {
		finish = protocol.Finish{Status: "failed", Error: workErr.Error(), Result: result}
	}
	if ctx.Err() != nil {
		finish = protocol.Finish{Status: "cancelled", Error: "the sandbox was stopped", Result: result}
	}
	// Report with a fresh context: the run's own may already be cancelled.
	report, cancel := context.WithTimeout(context.WithoutCancel(ctx), 30*time.Second)
	defer cancel()
	if err := c.Finish(report, finish); err != nil {
		return fmt.Errorf("finish: %w", err)
	}
	return workErr
}

// execute does the run's actual work and returns what to record.
func execute(ctx context.Context, c *protocol.Client, spec protocol.Spec, workdir string) (map[string]any, error) {
	if spec.Credential == nil || spec.Credential.Secret == "" {
		return nil, errors.New("this run has no model credential; connect an account or add credit")
	}
	adapter, err := agent.Pick(spec.Credential.Provider)
	if err != nil {
		return nil, err
	}
	emit := func(ev agent.Event) {
		_ = c.Emit(context.WithoutCancel(ctx), ev.Type, ev.Payload)
	}

	switch spec.Run.Purpose {
	case "chat":
		return runChat(ctx, c, spec, adapter, workdir, emit)
	default:
		return runBuild(ctx, c, spec, adapter, workdir, emit)
	}
}

// runChat answers in the conversation. No repository, no branch, no PR.
func runChat(ctx context.Context, c *protocol.Client, spec protocol.Spec, a agent.Adapter, workdir string, emit func(agent.Event)) (map[string]any, error) {
	key := stepKey(spec, "answer")
	_ = c.Step(ctx, protocol.StepUpdate{Key: key, Status: "running", Model: spec.Run.Model})
	prompt := chatPrompt(spec)
	out, err := agent.Run(ctx, a, agent.Options{
		Dir: workdir, Prompt: prompt, Model: spec.Run.Model, Secret: spec.Credential.Secret,
		Timeout: 20 * time.Minute, BudgetCents: spec.Run.TaskLimitCents, Emit: emit,
	})
	if err != nil {
		_ = c.Step(ctx, protocol.StepUpdate{Key: key, Status: "stuck", CostCents: resultCost(out)})
		return nil, err
	}
	if text := resultText(out); text != "" {
		if err := c.Say(ctx, text); err != nil {
			return nil, fmt.Errorf("could not post the answer: %w", err)
		}
	}
	_ = c.Step(ctx, protocol.StepUpdate{Key: key, Status: "done", CostCents: resultCost(out)})
	return map[string]any{"answer": resultText(out)}, nil
}

// runBuild checks the repository out, works, and opens a draft pull request.
// It never merges: approval is a person's step.
func runBuild(ctx context.Context, c *protocol.Client, spec protocol.Spec, a agent.Adapter, workdir string, emit func(agent.Event)) (map[string]any, error) {
	if len(spec.Repositories) == 0 {
		return nil, errors.New("this workspace has no repository connected, so there is nothing to change")
	}
	target := spec.Repositories[0]
	ghToken := target.Token
	if ghToken == "" {
		return nil, errors.New("repository has no authorized GitHub connection")
	}
	branch := branchName(spec)

	_ = c.Emit(ctx, "notice", map[string]any{"text": "Checking out " + target.FullName})
	checkout, err := repo.Clone(ctx, workdir, target.FullName, target.DefaultBranch, ghToken, branch)
	if err != nil {
		return nil, err
	}
	defer checkout.Cleanup()

	var graph workflow.Graph
	if len(spec.Graph) > 0 {
		if err := json.Unmarshal(spec.Graph, &graph); err != nil {
			return nil, err
		}
	} else {
		graph.Nodes = []workflow.Node{{Key: "start", Kind: "start"}}
		previous := "start"
		for _, step := range workSteps(spec) {
			graph.Nodes = append(graph.Nodes, workflow.Node{Key: step.Key, Name: step.Name, Kind: step.Kind, Model: step.Model})
			graph.Edges = append(graph.Edges, []string{previous, step.Key})
			previous = step.Key
		}
		graph.Nodes = append(graph.Nodes, workflow.Node{Key: "finish", Kind: "finish"})
		graph.Edges = append(graph.Edges, []string{previous, "finish"})
	}
	var cost int
	stepCosts := map[string]int{}
	previousOutput := ""
	err = workflow.Execute(ctx, graph, func(node workflow.Node, attempt int) (workflow.Result, error) {
		step := protocol.Step{Key: node.Key, Name: node.Name, Kind: node.Kind, Model: node.Model}
		if node.Kind == "approval" {
			err := c.Step(ctx, protocol.StepUpdate{Key: node.Key, Status: "waiting"})
			return workflow.Result{Stop: true}, err
		}
		if node.Kind == "question" {
			if err := c.Step(ctx, protocol.StepUpdate{Key: node.Key, Status: "waiting", Output: map[string]any{"question": node.Prompt}}); err != nil {
				return workflow.Result{}, err
			}
			ticker := time.NewTicker(2 * time.Second)
			defer ticker.Stop()
			for {
				select {
				case <-ctx.Done():
					return workflow.Result{}, ctx.Err()
				case <-ticker.C:
					answer, err := c.Input(ctx, node.Key)
					if err != nil {
						return workflow.Result{}, err
					}
					if answer != "" {
						previousOutput = answer
						return workflow.Result{}, c.Step(ctx, protocol.StepUpdate{Key: node.Key, Status: "done"})
					}
				}
			}
		}
		if cost >= spec.Run.TaskLimitCents {
			return workflow.Result{}, errors.New("task budget exhausted")
		}
		model := node.Model
		if model == "" || model == "auto" {
			model = spec.Run.Model
		}
		if err := c.Step(ctx, protocol.StepUpdate{Key: node.Key, Status: "running", Model: model}); err != nil {
			return workflow.Result{}, err
		}
		prompt := buildPrompt(spec, step) + "\n\nWorkflow instructions:\n" + node.Prompt + "\n\nPrevious step result:\n" + previousOutput
		if node.Kind == "condition" || node.Kind == "repeat" {
			choices := []string{}
			for _, e := range graph.Edges {
				if e[0] == node.Key && len(e) == 3 {
					choices = append(choices, e[2])
				}
			}
			if len(choices) == 0 {
				choices = []string{"true", "false"}
			}
			prompt += "\nThis is a decision only. Do not edit files. Respond with exactly one of: " + strings.Join(choices, ", ")
		}
		out, runErr := agent.Run(ctx, a, agent.Options{Dir: checkout.Dir, Prompt: prompt, Model: model, Secret: spec.Credential.Secret, Timeout: 30 * time.Minute, BudgetCents: spec.Run.TaskLimitCents - cost, Emit: emit})
		cost += resultCost(out)
		stepCosts[node.Key] += resultCost(out)
		previousOutput = resultText(out)
		status := "done"
		if runErr != nil {
			status = "stuck"
		}
		if err := c.Step(ctx, protocol.StepUpdate{Key: node.Key, Status: status, CostCents: stepCosts[node.Key], Output: map[string]any{"result": previousOutput, "attempt": attempt}}); err != nil {
			return workflow.Result{}, err
		}
		return workflow.Result{Choice: strings.TrimSpace(previousOutput)}, runErr
	})
	if err != nil {
		return partial(checkout, ctx), err
	}

	committed, err := checkout.Commit(ctx, commitMessage(spec))
	if err != nil {
		return nil, err
	}
	if !committed {
		// An honest empty result beats an empty pull request.
		return map[string]any{"changed": false, "cost_cents": cost}, errors.New("the run finished without changing any files")
	}
	if err := checkout.Push(ctx); err != nil {
		return nil, err
	}
	head, _ := checkout.Head(ctx)
	diffstat, _ := checkout.Diffstat(ctx)
	pr, err := checkout.OpenPullRequest(ctx, prTitle(spec), prBody(spec, diffstat))
	if err != nil {
		return map[string]any{"changed": true, "branch": branch, "head": head, "diffstat": diffstat, "cost_cents": cost}, err
	}
	_ = c.Emit(ctx, "notice", map[string]any{"text": "Opened " + pr.URL})
	return map[string]any{
		"changed": true, "branch": branch, "head": head, "diffstat": diffstat, "cost_cents": cost,
		"pull_request": map[string]any{"url": pr.URL, "number": pr.Number},
	}, nil
}

// partial records what exists on disk when a step failed part way.
func partial(c *repo.Checkout, ctx context.Context) map[string]any {
	head, _ := c.Head(ctx)
	stat, _ := c.Diffstat(ctx)
	return map[string]any{"changed": stat != "", "head": head, "diffstat": stat}
}

func stepKey(spec protocol.Spec, fallback string) string {
	if len(spec.Steps) > 0 {
		return spec.Steps[0].Key
	}
	return fallback
}

func workSteps(spec protocol.Spec) []protocol.Step {
	if len(spec.Steps) > 0 {
		return spec.Steps
	}
	return []protocol.Step{{Key: "implement", Name: "Implement", Kind: "task"}}
}

func branchName(spec protocol.Spec) string {
	id := "run"
	if spec.Issue != nil && spec.Issue.Identifier != "" {
		id = strings.ToLower(spec.Issue.Identifier)
	}
	short := spec.Run.ID
	if len(short) > 8 {
		short = short[:8]
	}
	return "botinc/" + id + "-" + short
}

func chatPrompt(spec protocol.Spec) string {
	var b strings.Builder
	b.WriteString("You are the Operator for this BotInc workspace. Answer in the fewest words that are complete and true. Say what you do not know.\n\n")
	b.WriteString(knowledgePrompt(spec))
	for _, m := range spec.Messages {
		b.WriteString(m.Role + ": " + m.Body + "\n")
	}
	if len(spec.Messages) == 0 {
		b.WriteString("User: " + spec.Run.Prompt + "\n")
	}
	return b.String()
}

func knowledgePrompt(spec protocol.Spec) string {
	var b strings.Builder
	for _, k := range spec.Knowledge {
		fmt.Fprintf(&b, "\n<workspace-context kind=%q name=%q>\n%s\n</workspace-context>\n", k.Kind, k.Name, k.Body)
	}
	return b.String()
}

func buildPrompt(spec protocol.Spec, step protocol.Step) string {
	var b strings.Builder
	b.WriteString(knowledgePrompt(spec))
	fmt.Fprintf(&b, "Step: %s.\n\n", step.Name)
	b.WriteString(spec.Run.Prompt)
	b.WriteString("\n\nWork in this checkout. Make the change, keep it small, and run the project's own tests. Do not commit, push or open a pull request: the runtime does that once every step is done.")
	switch step.Key {
	case "plan":
		b.WriteString("\n\nFor this step, read enough of the code to be sure of the cause, then state the plan. Do not edit files yet.")
	case "review":
		b.WriteString("\n\nFor this step, read the change you just made as an independent reviewer would and fix what is wrong.")
	case "verify":
		b.WriteString("\n\nFor this step, run the tests and report exactly what passed and what failed. Do not claim a pass you did not see.")
	}
	return b.String()
}

func commitMessage(spec protocol.Spec) string {
	title := "work from a BotInc run"
	if spec.Issue != nil {
		title = spec.Issue.Identifier + ": " + spec.Issue.Title
	}
	return title + "\n\nOpened by a BotInc run. Nothing merges itself.\n"
}

func prTitle(spec protocol.Spec) string {
	if spec.Issue != nil {
		return spec.Issue.Identifier + ": " + spec.Issue.Title
	}
	return "BotInc run " + spec.Run.ID
}

func prBody(spec protocol.Spec, diffstat string) string {
	var b strings.Builder
	if spec.Issue != nil {
		b.WriteString(spec.Issue.Description)
		b.WriteString("\n\n")
	}
	b.WriteString("Opened by a BotInc run. This pull request is a draft and waits for a person: nothing merges itself.\n")
	if strings.TrimSpace(diffstat) != "" {
		b.WriteString("\n```\n" + strings.TrimSpace(diffstat) + "\n```\n")
	}
	return b.String()
}

// resultText pulls the human-readable answer out of a CLI's result event.
func resultText(out map[string]any) string {
	if out == nil {
		return ""
	}
	for _, key := range []string{"result", "text", "content", "message"} {
		if v, ok := out[key].(string); ok && strings.TrimSpace(v) != "" {
			return v
		}
	}
	return ""
}

// resultCost reads the spend the CLI reported, in cents, rounding up so a
// fraction of a cent is never recorded as free.
func resultCost(out map[string]any) int {
	if out == nil {
		return 0
	}
	for _, key := range []string{"total_cost_usd", "cost_usd", "total_cost"} {
		if v, ok := out[key].(float64); ok && v > 0 {
			cents := int(v * 100)
			if float64(cents) < v*100 {
				cents++
			}
			return cents
		}
	}
	return 0
}
