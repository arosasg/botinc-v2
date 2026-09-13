"use client";

/* Mounts the Workspace v19 logic under the DC host and renders the generated
   views. Browser only: the logic touches window, document and localStorage. */

import { useEffect, useState } from "react";
import { DCLogic, useDCLogic, type LogicClass } from "@/lib/dc/logic";
import { WorkspaceView } from "./views/workspace-view";
import { useStickToLatest } from "./use-stick-to-latest";

const ROOT_PROPS = { modelLabel11: "Auto", projectLabel10: "Product", thinkingLabel: "High" };

function Mounted({ Logic }: { Logic: LogicClass }) {
  const { vals } = useDCLogic(Logic, ROOT_PROPS);
  useStickToLatest();
  return <WorkspaceView v={vals} />;
}

export function WorkspaceApp() {
  const [Logic, setLogic] = useState<LogicClass | null>(null);
  useEffect(() => {
    let alive = true;
    // Wait for the webfonts (capped) so the first layout, and the logic's
    // scroll-to-latest on mount, use final text metrics.
    const fonts =
      typeof document !== "undefined" && document.fonts
        ? Promise.all([document.fonts.load('400 14px "Instrument Sans"'), document.fonts.load('400 12px "IBM Plex Mono"')]).then(() => document.fonts.ready)
        : Promise.resolve();
    const cap = new Promise<void>((r) => setTimeout(r, 3000));
    Promise.all([import("./logic/v19.js"), Promise.race([fonts, cap])]).then(([m]) => {
      if (alive) setLogic(() => m.makeWorkspaceLogic(DCLogic) as LogicClass);
    });
    return () => {
      alive = false;
    };
  }, []);
  if (!Logic) return null;
  return <Mounted Logic={Logic} />;
}
