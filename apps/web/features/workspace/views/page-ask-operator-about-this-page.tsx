/* Generated from design-ref/Workspace v19.dc.html by scripts/gen-workspace.py.
   Do not edit by hand; regenerate. Markup is the design's, 1:1. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Vals } from "../vals";

export function PageAskOperatorAboutThisPage({ v }: { v: Vals }) {
  return (
    v.dockLauncher15 ? (
      <>
        <button
          className={`dock-launch15 ${v.launchIntro16}`}
          onClick={v.dockOpenBtn15}
          aria-label="Ask Operator about this page"
          title="Ask Operator about this page"
        >
          <img className="dock-launch-mark16" src="/assets/logo/botinc-mark.svg" alt="" />
          {v.dockBadge15 ? (
            <>
              <i />
            </>
          ) : null}
        </button>
      </>
    ) : null
  );
}
