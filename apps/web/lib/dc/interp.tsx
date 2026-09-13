/* A text binding, rendered the way the design runtime renders it: wrapped in
   <span class="sc-interp"> so the design CSS that targets those spans applies;
   nothing at all for null, undefined and booleans. */
export function interp(v: unknown) {
  if (v === null || v === undefined || typeof v === "boolean") return null;
  return <span className="sc-interp">{String(v)}</span>;
}
