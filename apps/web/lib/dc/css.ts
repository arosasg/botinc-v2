import type { CSSProperties } from "react";

/* Design bindings hand styles over as strings ("width:252px"); React wants an
   object. Same conversion the design runtime applies. */
export function css(v: unknown): CSSProperties | undefined {
  if (!v) return undefined;
  if (typeof v !== "string") return v as CSSProperties;
  const out: Record<string, string> = {};
  for (const decl of v.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const k = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!k) continue;
    out[k.startsWith("--") ? k : k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = val;
  }
  return out as CSSProperties;
}
