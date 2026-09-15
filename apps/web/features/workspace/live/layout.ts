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

export function usageRingStyleFromCapacity(value: unknown): string {
  const capacity = Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(capacity)) return "--used:0deg";
  const used = 100 - Math.max(0, Math.min(100, capacity));
  return `--used:${Math.round(used * 3.6)}deg`;
}
