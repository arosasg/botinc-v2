/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function PageConversations({ v }: { v: Vals }) {
  return (
    v.conversationsPage9 ? (
      <>
        <main className="conversations9" data-screen-label="Conversations">
          <div className="v7-page-heading">
            <div>
              <h1>Conversations</h1>
              <p>One place for each piece of work.</p>
            </div>
            <button className="small-button primary" onClick={v.newChat} aria-label="New chat">
              <svg
                className="ui-icon use14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <use href="/i15.svg#square-pen" />
              </svg>
              <span>New chat</span>
            </button>
          </div>
          <label className="c9-search">
            <svg
              className="ui-icon use14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <use href="/i15.svg#search" />
            </svg>
            <input
              aria-label="Find a conversation"
              placeholder="Find a conversation"
              value={v.conversationSearch9}
              onChange={v.editConversationSearch9}
            />
          </label>
          {(v.allConversationGroups9 ?? []).map((g: any, i: number) => (
            <Fragment key={i}>
              <section className="c9-group c9-main-group">
                <h3>
                  {interp(g.title)}
                  <span>{interp(g.count)}</span>
                </h3>
                {(g.rows ?? []).map((c: any, i: number) => (
                  <Fragment key={i}>
                    <button className={c.cls} onClick={c.open}>
                      <span className={`c9-status ${c.tone}`}>
                        <svg
                          className="ui-icon use14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <use href={c.icon} />
                        </svg>
                      </span>
                      <span className="c9-row-copy" title={c.fullLabel}>
                        <strong>{interp(c.title)}</strong>
                        <small>{interp(c.subtitle)}</small>
                      </span>
                      <svg
                        className="ui-icon use14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <use href="/i15.svg#chevron-right" />
                      </svg>
                    </button>
                  </Fragment>
                ))}
              </section>
            </Fragment>
          ))}
          {v.conversationEmpty9 ? (
            <>
              <div className="n9-empty">
                <h2>No conversations found</h2>
                <p>Try a shorter title or start a new conversation.</p>
              </div>
            </>
          ) : null}
        </main>
      </>
    ) : null
  );
}
