const ROOT_PUBLIC_ASSET = /^(?:assets\/|[a-z0-9-]+\.svg(?:#|$))/i;
const LEGACY_WORKSPACE_SPRITE = /^\/?assets\/icons\/workspace-v(?:6|9)\.svg(#.*)?$/i;

export interface ConversationPaneBounds {
  min: number;
  max: number;
}

export function absolutePublicAsset(value: string): string {
  const legacySprite = LEGACY_WORKSPACE_SPRITE.exec(value);
  if (legacySprite) return `/assets/icons/workspace-v14.svg${legacySprite[1] || ""}`;
  return ROOT_PUBLIC_ASSET.test(value) ? `/${value}` : value;
}

export function normalizePublicAssets(value: unknown, seen = new WeakSet<object>()): unknown {
  if (typeof value === "string") return absolutePublicAsset(value);
  if (!value || typeof value !== "object" || seen.has(value)) return value;

  seen.add(value);
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      value[index] = normalizePublicAssets(value[index], seen);
    }
    return value;
  }

  for (const [key, child] of Object.entries(value)) {
    (value as Record<string, unknown>)[key] = normalizePublicAssets(child, seen);
  }
  return value;
}

export function conversationPaneBounds(availableWidth: number): ConversationPaneBounds {
  const available = Number.isFinite(availableWidth) ? Math.max(0, availableWidth) : 1040;
  const min = available < 960 ? 300 : 360;
  const mainContent = available < 960 ? 448 : Math.max(640, available * 0.56);
  return { min, max: Math.max(min, Math.min(520, available * 0.44, available - mainContent)) };
}

export function clampConversationPaneWidth(width: number, availableWidth: number): number {
  const bounds = conversationPaneBounds(availableWidth);
  return Math.round(Math.max(bounds.min, Math.min(bounds.max, width)));
}

export function formatUsageReset(value: unknown): string {
  const text = String(value || "").trim();
  if (!text) return "";
  const instant = new Date(text);
  if (Number.isNaN(instant.getTime())) return text.length > 16 ? `${text.slice(0, 15)}…` : text;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(instant);
}

/* The design's usageRing19 draws the v19 ring from `--used14` and the older
   rings from `--remaining`; the base rules still read `--used`. Emit all three
   so every ring variant fills. */
export function usageRingStyleFromCapacity(value: unknown): string {
  const capacity = Number.parseFloat(String(value ?? ""));
  const left = Number.isFinite(capacity) ? Math.max(0, Math.min(100, capacity)) : null;
  const usedDeg = left === null ? 0 : Math.round((100 - left) * 3.6);
  const leftDeg = left === null ? 0 : Math.round(left * 3.6);
  return `--used14:${usedDeg}deg;--used:${usedDeg}deg;--remaining:${leftDeg}deg`;
}

type WindowRow = Record<string, unknown>;

/* Day and time only ("21 00:00"); the month lives in the tooltip. A bare time
   (today) gets today's day. Mirrors the design's resetDay19. */
export function resetDayLabel(resetShort: unknown): string {
  const text = String(resetShort || "").replace(/\s*·\s*/g, ", ").trim();
  if (/^\d{1,2}:\d{2}$/.test(text)) return `${new Date().getDate()} ${text}`;
  return text.replace(/^\w{3},?\s+(\d{1,2}),?\s*/, "$1 ");
}

/* The account row's bar and reset note follow the binding window, the one
   with the least capacity left. Mirrors the design's account-window rows. */
export function bindingWindowFields(windows: WindowRow[]): WindowRow {
  let bind: { window: WindowRow; left: number } | null = null;
  for (const window of windows) {
    const left = Number.parseInt(String(window.leftLabel14 ?? ""), 10);
    if (Number.isNaN(left)) continue;
    if (!bind || left < bind.left) bind = { window, left };
  }
  const reset = bind ? String(bind.window.resetShort14 || "") : "";
  return {
    barStyle19: `width:${bind ? Math.max(0, Math.min(100, bind.left)) : 0}%`,
    barTone19: bind ? String(bind.window.tone14 || "muted14") : "muted14",
    hasReset19: Boolean(reset),
    resetNote19: reset ? `Resets ${reset}` : "",
    resetTitle19: bind ? `${String(bind.window.label || "")} · ${String(bind.window.reset || "")}` : "",
  };
}
