// Package workflow follows graph edges instead of flattening branches into tasks.
package workflow

import (
	"context"
	"errors"
	"fmt"
)

type Node struct {
	Key    string `json:"key"`
	Name   string `json:"name"`
	Kind   string `json:"kind"`
	Model  string `json:"model,omitempty"`
	Effort string `json:"effort,omitempty"`
	Prompt string `json:"prompt,omitempty"`
}
type Graph struct {
	Nodes  []Node         `json:"nodes"`
	Edges  [][]string     `json:"edges"`
	Limits map[string]int `json:"limits,omitempty"`
}

// Choice selects the label on an outgoing edge. With unlabeled condition edges,
// true selects the first edge and false the second. Other nodes have one edge.
type Result struct {
	Choice string
	Stop   bool
}

func Execute(ctx context.Context, g Graph, run func(Node, int) (Result, error)) error {
	nodes := map[string]Node{}
	edges := map[string][][]string{}
	current := ""
	for _, n := range g.Nodes {
		if _, ok := nodes[n.Key]; ok {
			return errors.New("duplicate workflow node")
		}
		nodes[n.Key] = n
		if n.Kind == "start" {
			if current != "" {
				return errors.New("multiple starts")
			}
			current = n.Key
		}
	}
	for _, e := range g.Edges {
		if len(e) < 2 || len(e) > 3 {
			return errors.New("invalid workflow edge")
		}
		edges[e[0]] = append(edges[e[0]], e)
	}
	if current == "" {
		return errors.New("workflow has no start")
	}
	limit := g.Limits["max_attempts"]
	if limit < 1 {
		limit = 3
	}
	if limit > 20 {
		return errors.New("workflow attempt limit exceeds 20")
	}
	visits := map[string]int{}
	for transitions := 0; transitions < 1000; transitions++ {
		if err := ctx.Err(); err != nil {
			return err
		}
		n, ok := nodes[current]
		if !ok {
			return errors.New("workflow points to missing node")
		}
		visits[current]++
		if visits[current] > limit {
			return fmt.Errorf("workflow attempt limit reached at %s", current)
		}
		if n.Kind == "finish" {
			return nil
		}
		result := Result{}
		if n.Kind != "start" {
			var err error
			result, err = run(n, visits[current])
			if err != nil {
				return err
			}
			if result.Stop {
				return nil
			}
		}
		next := edges[current]
		if len(next) == 0 {
			return fmt.Errorf("workflow ends before finish at %s", current)
		}
		if len(next) == 1 {
			current = next[0][1]
			continue
		}
		if n.Kind != "condition" && n.Kind != "repeat" {
			return fmt.Errorf("ambiguous outgoing edges at %s", current)
		}
		chosen := ""
		for _, e := range next {
			if len(e) == 3 && e[2] == result.Choice {
				chosen = e[1]
			}
		}
		if chosen == "" && len(next) == 2 && len(next[0]) == 2 && len(next[1]) == 2 {
			if result.Choice == "true" {
				chosen = next[0][1]
			}
			if result.Choice == "false" {
				chosen = next[1][1]
			}
		}
		if chosen == "" {
			return fmt.Errorf("no edge matches decision at %s", current)
		}
		current = chosen
	}
	return errors.New("workflow transition limit reached")
}
