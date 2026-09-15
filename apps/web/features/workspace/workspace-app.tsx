"use client";

/* Mounts the Workspace v19 logic under the DC host and renders the generated
   views. Browser only: the logic touches window, document and localStorage. */

import { useCallback, useEffect, useState } from "react";
import { DCLogic, DCLogicContext, useDCLogic, type LogicClass } from "@/lib/dc/logic";
import { WorkspaceView } from "./views/workspace-view";
import { useStickToLatest } from "./use-stick-to-latest";
import { useLiveWorkspace, type LiveStatus } from "./live/use-live-workspace";

const ROOT_PROPS = { modelLabel11: "Auto", projectLabel10: "Product", thinkingLabel: "High" };

function Mounted({ Logic }: { Logic: LogicClass }) {
  const { logic, vals } = useDCLogic(Logic, ROOT_PROPS);
  useStickToLatest();
  /* Swaps the design's fixtures for real rows when an API is configured, and
     does nothing when one is not - which is what keeps the pixel proof
     reproducible and the design demo self-contained. */
  const [status,setStatus]=useState<LiveStatus>("connecting");
  const [detail,setDetail]=useState("");
  const report=useCallback((status:LiveStatus,detail?:string)=>{setStatus(status);setDetail(detail||"");},[]);
  useLiveWorkspace(logic as Parameters<typeof useLiveWorkspace>[0],report);
  if(status!=="live"&&status!=="off") {
    const destination=typeof window!=="undefined"?window.location.pathname+window.location.search:"/w";
    const href=status==="signed-out"?`/?returnTo=${encodeURIComponent(destination)}`:"/";
    return <main className="workspace-gate" role="status"><div className="workspace-gate-card"><img src="/assets/logo/botinc-mark.svg" alt=""/><span className="workspace-gate-kicker">BOTINC</span><h1>{status==="connecting"?"Opening your workspace":status==="signed-out"?"Welcome back":"Workspace unavailable"}</h1><p>{status==="connecting"?"Loading conversations, work and connections…":status==="signed-out"?"Sign in to continue exactly where this link points.":detail||"The workspace could not be loaded."}</p>{status!=="connecting"?<a className="workspace-gate-action" href={href}>{status==="signed-out"?"Sign in":"Return home"}</a>:<span className="workspace-gate-progress" aria-hidden="true"/>}</div></main>;
  }
  /* The design publishes its semantic tokens on the runtime's host element
     (`#dc-root, .sc-host`), including the dark values behind
     `:has(.app[data-theme=dark])`. Without a host, any token declared only
     there is unset and every `var(--x, <light fallback>)` silently renders
     light - which is how the dark theme kept a white tile behind the source
     icons. `display: contents` publishes the tokens without adding a box. */
  return (
    <DCLogicContext.Provider value={logic}>
      <div className="sc-host" style={{ display: "contents" }}>
        <WorkspaceView v={vals} />
      </div>
    </DCLogicContext.Provider>
  );
}

export function WorkspaceApp() {
  const [Logic, setLogic] = useState<LogicClass | null>(null);
  useEffect(() => {
    let alive = true;
    // Render as soon as the workspace logic is available. Waiting for remote
    // fonts could leave the entire product blank for up to three seconds on a
    // cold connection. The conversation ResizeObserver corrects its bottom
    // anchor if final font metrics change after the first paint.
    import("./logic/v19.js").then((m) => {
      if (alive) setLogic(() => m.makeWorkspaceLogic(DCLogic) as LogicClass);
    });
    return () => {
      alive = false;
    };
  }, []);
  if (!Logic) return null;
  return <Mounted Logic={Logic} />;
}
