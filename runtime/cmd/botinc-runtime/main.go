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

	// From the moment the run is claimed, every exit reports a status. Spec
	// loading can fail too (for example when an account expires between queue
	// selection and sandbox startup), and that must not leave the UI stuck in
	// 'running' waiting for the reconciler.
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
	var result map[string]any
	spec, workErr := c.Spec(ctx)
	if workErr != nil {
		workErr = fmt.Errorf("spec: %w", workErr)
	} else {
		result, workErr = execute(ctx, c, spec, workdir)
	}
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
	if spec.Credential == nil || (spec.Credential.Secret == "" && len(spec.Credential.Env) == 0 && len(spec.Credential.Files) == 0) {
		return nil, errors.New("this run has no model credential; connect an account or add credit")
	}
	adapter, err := agent.Pick(spec.Credential.Provider)
	if err != nil {
		return nil, err
	}
	if err := materializeAttachments(ctx, c, &spec, workdir); err != nil {
		return nil, fmt.Errorf("prepare attachments: %w", err)
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

func materializeAttachments(ctx context.Context, c *protocol.Client, spec *protocol.Spec, workdir string) error {
	if len(spec.Attachments) == 0 {
		return nil
	}
	dir := filepath.Join(workdir, "attachments")
	if err := os.MkdirAll(dir, 0o700); err != nil {
		return err
	}
	for i := range spec.Attachments {
		attachment := &spec.Attachments[i]
		name := filepath.Base(strings.ReplaceAll(attachment.Filename, "\\", "/"))
		if name == "" || name == "." {
			name = "attachment"
		}
		path := filepath.Join(dir, attachment.ID+"-"+name)
		partial := path + ".partial"
		file, err := os.OpenFile(partial, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o600)
		if err != nil {
			return err
		}
		written, downloadErr := c.DownloadAttachment(ctx, attachment.ID, file)
		closeErr := file.Close()
		if downloadErr != nil || closeErr != nil || written != attachment.SizeBytes {
			_ = os.Remove(partial)
			if downloadErr != nil {
				return downloadErr
			}
			if closeErr != nil {
				return closeErr
			}
			return fmt.Errorf("attachment %s size was %d, expected %d", attachment.ID, written, attachment.SizeBytes)
		}
		if err := os.Rename(partial, path); err != nil {
			_ = os.Remove(partial)
			return err
		}
		attachment.Path = path
	}
	return nil
}

// runChat answers in the conversation. No repository, no branch, no PR.
func runChat(ctx context.Context, c *protocol.Client, spec protocol.Spec, a agent.Adapter, workdir string, emit func(agent.Event)) (map[string]any, error) {
	key := stepKey(spec, "answer")
	_ = c.Step(ctx, protocol.StepUpdate{Key: key, Status: "running", Model: spec.Run.Model, Effort: spec.Run.Effort})
	prompt := chatPrompt(spec)
	out, err := agent.Run(ctx, a, agent.Options{
		Dir: workdir, Prompt: prompt, Model: spec.Run.Model, Effort: spec.Run.Effort, Secret: spec.Credential.Secret,
		CredentialEnv: spec.Credential.Env, CredentialFiles: spec.Credential.Files,
		MCPConfig: spec.MCPConfig,
		Timeout:   40 * time.Minute, BudgetCents: spec.Run.TaskLimitCents, Emit: emit,
	})
	answer := resultText(out)
	if err != nil {
		partialAnswer := visibleTimeoutAnswer(answer, err)
		if partialAnswer != "" {
			if sayErr := c.Say(ctx, partialAnswer); sayErr != nil {
				err = errors.Join(err, fmt.Errorf("could not post the partial answer: %w", sayErr))
			}
		}
		_ = c.Step(ctx, protocol.StepUpdate{
			Key: key, Status: "stuck", CostCents: resultCost(out),
			Output: map[string]any{"result": partialAnswer, "partial": partialAnswer != ""},
		})
		return map[string]any{"answer": partialAnswer, "partial": partialAnswer != ""}, err
	}
	if answer != "" {
		if err := c.Say(ctx, answer); err != nil {
			return nil, fmt.Errorf("could not post the answer: %w", err)
		}
	}
	_ = c.Step(ctx, protocol.StepUpdate{Key: key, Status: "done", CostCents: resultCost(out)})
	return map[string]any{"answer": answer}, nil
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
	baseHead, err := checkout.Head(ctx)
	if err != nil {
		return nil, err
	}
	// Preserve completed step commits on this run's branch before long work.
	checkpoint := func() error {
		if _, err := checkout.Commit(ctx, commitMessage(spec)); err != nil {
			return err
		}
		head, err := checkout.Head(ctx)
		if err != nil {
			return err
		}
		if head == baseHead {
			return nil
		}
		return checkout.Push(ctx)
	}

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
	reviewedHead := ""
	err = workflow.Execute(ctx, graph, func(node workflow.Node, attempt int) (workflow.Result, error) {
		step := protocol.Step{Key: node.Key, Name: node.Name, Kind: node.Kind, Model: node.Model}
		if node.Kind == "approval" {
			err := c.Step(ctx, protocol.StepUpdate{Key: node.Key, Status: "waiting"})
			return workflow.Result{Stop: true}, err
		}
		if node.Kind == "question" {
			if err := checkpoint(); err != nil {
				return workflow.Result{}, err
			}
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
		effort := node.Effort
		if effort == "" {
			effort = spec.Run.Effort
		}
		if err := c.Step(ctx, protocol.StepUpdate{Key: node.Key, Status: "running", Model: model, Effort: effort}); err != nil {
			return workflow.Result{}, err
		}
		prompt := buildPrompt(spec, step) + "\n\nWorkflow instructions:\n" + node.Prompt
		if node.Key != "review" {
			prompt += "\n\nPrevious step result:\n" + previousOutput
		}
		if node.Key == "review" {
			if err := checkpoint(); err != nil {
				return workflow.Result{}, err
			}
		}

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
		out, runErr := agent.Run(ctx, a, agent.Options{Dir: checkout.Dir, Prompt: prompt, Model: model, Effort: effort, Secret: spec.Credential.Secret, CredentialEnv: spec.Credential.Env, CredentialFiles: spec.Credential.Files, MCPConfig: spec.MCPConfig, Timeout: 30 * time.Minute, BudgetCents: spec.Run.TaskLimitCents - cost, Emit: emit})
		cost += resultCost(out)
		stepCosts[node.Key] += resultCost(out)
		previousOutput = resultText(out)
		if runErr == nil && node.Key == "review" {
			dirty, err := checkout.Dirty(ctx)
			if err != nil {
				runErr = err
			} else if dirty {
				runErr = errors.New("reviewer changed files; a fresh review is required")
			} else if !strings.HasSuffix(strings.TrimSpace(previousOutput), "REVIEW_APPROVED") {
				runErr = errors.New("review did not approve the change")
			} else {
				reviewedHead, runErr = checkout.Head(ctx)
			}
		}
		status := "done"
		if runErr != nil {
			status = "stuck"
		}
		if err := c.Step(ctx, protocol.StepUpdate{Key: node.Key, Status: status, CostCents: stepCosts[node.Key], Output: map[string]any{"result": previousOutput, "attempt": attempt, "reviewed_head": reviewedHead, "review_approved": node.Key == "review" && runErr == nil}}); err != nil {
			return workflow.Result{}, err
		}
		if runErr == nil && node.Kind == "task" && node.Key != "review" && node.Key != "verify" {
			runErr = checkpoint()
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
	headBeforePush, headErr := checkout.Head(ctx)
	if headErr != nil {
		return nil, headErr
	}
	if reviewedHead != "" && headBeforePush != reviewedHead {
		return partial(checkout, ctx), errors.New("the change advanced after review; another review is required")
	}
	if !committed && headBeforePush == baseHead {
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
		"changed": true, "repository": target.FullName, "branch": branch, "head": head, "diffstat": diffstat, "cost_cents": cost, "reviewed_head": reviewedHead,
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
	b.WriteString("Do not wait indefinitely for external CI, reviews, or other asynchronous work. Once the requested work is safely preserved and only external completion remains, report the durable links and current status, then end with a useful answer.\n\n")
	b.WriteString(knowledgePrompt(spec))
	for _, m := range spec.Messages {
		b.WriteString(m.Role + ": " + m.Body + "\n")
		for _, attachment := range spec.Attachments {
			if attachment.MessageID == m.ID {
				fmt.Fprintf(&b, "Attachment %q (%s, %d bytes) is available at %s. Inspect it when it is relevant to the request.\n", attachment.Filename, attachment.ContentType, attachment.SizeBytes, attachment.Path)
			}
		}
	}
	if len(spec.Messages) == 0 {
		b.WriteString("User: " + spec.Run.Prompt + "\n")
	}
	return b.String()
}

func visibleTimeoutAnswer(answer string, err error) string {
	if !errors.Is(err, context.DeadlineExceeded) {
		return ""
	}
	prefix := "This run reached its execution limit before it could produce a final answer. Completed external changes were preserved."
	if strings.TrimSpace(answer) == "" {
		return prefix
	}
	return prefix + "\n\nLatest verified update:\n\n" + strings.TrimSpace(answer)
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
	for _, attachment := range spec.Attachments {
		fmt.Fprintf(&b, "\nAttachment %q (%s, %d bytes) is available at %s. Inspect it when it is relevant to the request.", attachment.Filename, attachment.ContentType, attachment.SizeBytes, attachment.Path)
	}
	b.WriteString("\n\nWork in this checkout. Make the change, keep it small, and run the project's own tests. Do not commit, push or open a pull request: the runtime does that once every step is done.")
	switch step.Key {
	case "plan":
		b.WriteString("\n\nFor this step, read enough of the code to be sure of the cause, then state the plan. Do not edit files yet.")
	case "review":
		b.WriteString("\n\nYou are a separate reviewer invocation. Inspect the actual diff against the default branch and the issue requirements. Do not edit files. End with exactly REVIEW_APPROVED only if the final change is correct, otherwise end with REVIEW_CHANGES and explain the findings.")
	case "verify":
		b.WriteString("\n\nFor this step, run the tests and report exactly what passed and what failed. Do not edit source files or claim a pass you did not see.")
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
