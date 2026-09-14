const ROOT_PUBLIC_ASSET = /^(?:assets\/|[a-z0-9-]+\.svg(?:#|$))/i;

export interface ConversationPaneBounds {
  min: number;
  max: number;
}

export function absolutePublicAsset(value: string): string {
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
  const mainContent = available < 960 ? 440 : 520;
  return { min, max: Math.max(min, Math.min(720, available - mainContent)) };
}

export function clampConversationPaneWidth(width: number, availableWidth: number): number {
  const bounds = conversationPaneBounds(availableWidth);
  return Math.round(Math.max(bounds.min, Math.min(bounds.max, width)));
}
