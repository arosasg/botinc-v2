/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";
import { interp } from "@/lib/dc/interp";

export function ShellMobileTabs9({ v }: { v: Vals }) {
  return (
    <nav className="mobile-tabs9" aria-label="Main navigation">
      <button className={v.chatsTab9} onClick={v.allConversations9}>
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
          <use href="/i15.svg#message-square" />
        </svg>
        <span>Chats</span>
        {v.attentionCount ? (
          <>
            <i>{interp(v.attentionCount)}</i>
          </>
        ) : null}
      </button>
      <button className={v.workTab9} onClick={v.showWork}>
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
          <use href="/i15.svg#list-todo" />
        </svg>
        <span>Work</span>
      </button>
      <button className={v.scheduleTab9} onClick={v.showSchedule9}>
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
          <use href="/i15.svg#calendar" />
        </svg>
        <span>Schedule</span>
      </button>
      <button className={v.pluginsTab10} onClick={v.plugins10}>
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
          <use href="/i15.svg#plug" />
        </svg>
        <span>Plugins</span>
      </button>
      <button className={v.settingsTab9} onClick={v.showSettings}>
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
          <use href="/i15.svg#settings" />
        </svg>
        <span>Settings</span>
      </button>
    </nav>
  );
}
