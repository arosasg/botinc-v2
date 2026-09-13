/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function AppTopbar({ v }: { v: Vals }) {
  return (
    <header className="topbar">
      <button className="mobile-menu icon-button" onClick={v.toggleNav} aria-label="Open navigation">
        <svg
          className="ui-icon "
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <use href="/i15.svg#menu" />
        </svg>
      </button>
      <div className="breadcrumb">
        <span>{interp(v.headerSection)}</span>
        {v.hasBreadcrumb ? (
          <>
            <span className="muted">/</span>
            <strong>{interp(v.headerDetail)}</strong>
          </>
        ) : null}
      </div>
      <div className="top-actions">
        {v.hasConversation ? (
          <>
            <button className="icon-button" aria-label="Conversation options" onClick={v.chatActions12}>
              <svg
                className="ui-icon "
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <use href="/i15.svg#ellipsis" />
              </svg>
            </button>
          </>
        ) : null}
        {v.showSharedLabel ? (
          <>
            <span className="privacy-label">
              <svg
                className="ui-icon "
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <use href="/i15.svg#users" />
              </svg>
              Shared with BotInc
            </span>
          </>
        ) : null}
        <button
          className="call-top call-btn16"
          aria-label="Call your Operator"
          title="Call your Operator"
          onClick={v.openCall}
        >
          <span className="call-btn-mark16">
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
              <use href="/i15.svg#phone" />
            </svg>
          </span>
          <span>Call</span>
        </button>
        <button className="icon-button" aria-label="Change appearance" onClick={v.toggleTheme}>
          <svg
            className="ui-icon "
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <use href="/i15.svg#sun-moon" />
          </svg>
        </button>
      </div>
    </header>
  );
}
