# BotInc icons

## What is here

| Path | Contents |
| --- | --- |
| `botinc-icons.svg` | One sprite, 35 symbols — the whole set. |
| `svg/icons/` | 25 engraved product glyphs, one file each. |
| `svg/connectors-mono/` | 10 monoline connector marks, one file each. |
| `providers/` | Official coding-provider + model-vendor logos (brand colour, vendor artwork). |
| `connectors/` | Official connector logos (brand colour, vendor artwork). |
| `index.html` | Contact sheet — open it in a browser to see every glyph named. |

## Drawing rules

Monoline, `stroke-width: 1.5`, round caps and joins, `currentColor`, 24×24 viewBox.
`sun` and `moon` carry 2 (they render at 14px in the topbar and need the weight).
`more` is a filled glyph. Nothing is hand-tuned per size — set the box, inherit the colour.

## Sprite

Inline the sprite once near the top of `<body>`, then reference symbols by id:

```html
<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
  <use href="#bi-icon-issue"></use>
</svg>
```

Sizes in the console: 19px rail, 16px menu rows, 14px topbar and inline chips, 12–13px section
headers. Colour comes from the parent — `color: var(--mute)` for resting, `var(--ink)` active,
`var(--accent)` for live state.

## Ids

Product: agents, issue, review, merge, runtime, model, routing, more, autopilot, connector, memory, design-system, subscription, key, search, sun, moon, person, logout, home, inbox, project, chat, skill, artifact.

Connectors (monoline): github, slack, figma, linear, sentry, email, lark, webhook, web, notion.

## Provider logos

Vendor artwork, used as shipped — never redrawn, never recoloured. `*-inverse.svg` variants are
for ink or accent fills. Resolve a model or CLI name to a file the way the console does
(`claude code` → `anthropic`, `codex` → `openai`), so one map serves accounts, runtimes and runs.

