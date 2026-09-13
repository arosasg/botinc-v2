/* The screens the proof harness compares, and how to reach each one.
 *
 * `go` is the view name the workspace logic uses. These are the real names in
 * the logic, not guesses: driving an unknown name renders a broken screen on
 * BOTH sides and diffs to zero, which looks like a pass and proves nothing.
 * `open` is for a screen that needs a subject (a routine, an issue).
 */
export const WORKSPACE_SCREENS = [
  { name: "chat", go: "chat" },
  { name: "thread", go: "thread9" },
  { name: "conversations", go: "chats9" },
  { name: "work", go: "work" },
  { name: "issue", go: "issue" },
  { name: "schedule", go: "schedule9" },
  { name: "routine", open: ["openAuto9", "ap-intake"] },
  { name: "plugins", go: "plugins10" },
  { name: "skills", go: "skills10" },
  { name: "profile", go: "profile10" },
  { name: "settings", go: "settings" },
  { name: "accounts", go: "accounts10" },
  { name: "pricing", go: "pricing" },
];

/* The landing freezes its hero demo at the last frame of the sequence so a
 * screenshot is reproducible; the loop is otherwise mid-animation and every
 * capture differs from the last. */
export const LANDING_SCREENS = [
  { name: "landing", query: "demo=16,0,0" },
  { name: "ob-signin", query: "demo=16,0,0&screen=signin" },
  { name: "ob-goals", query: "demo=16,0,0&screen=goals" },
  { name: "ob-connect", query: "demo=16,0,0&screen=connect" },
  { name: "ob-models", query: "demo=16,0,0&screen=models" },
  { name: "ob-autos", query: "demo=16,0,0&screen=autos" },
];
