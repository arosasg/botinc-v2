# BotInc — Ramp-style refresh (v6 spec)

What the landing page in project **Landing Page** (`MarketingPage Ramp.dc.html`) actually
uses. Hand this to the design-system project and apply it to `tokens/`, `styles.css`,
`components/`, `guidelines/`, `ui_kits/` and both templates.

## The change in one line

v5 was a saturated gradient sky over warm paper with Playfair display type and pastel
washes. v6 is **bone paper, ink text, one highlighter accent, one weight, hairlines and
no shadows** — the Ramp geometry the team asked for, on BotInc's own vocabulary.

## Colour — replaces the cobalt/cream ramps

| Token | Value | Use |
| --- | --- | --- |
| `--bone` | `#f4f2f0` | page canvas, every light band |
| `--paper` | `#ffffff` | cards, panels, console surfaces |
| `--paper-2` | `#faf9f8` | toolbar strips inside panels |
| `--ink` | `#0c0a08` | all text, filled buttons, dark cards |
| `--ink-band` | `#1a1919` | full-bleed dark bands (ticker, receipts, install) |
| `--ink-line` | `#2b2a2a` | hairline inside dark bands |
| `--muted` | `#6d6c6b` | secondary text |
| `--faint` | `#8c8a88` | mono metadata, timestamps |
| `--line` | `#e5e7eb` | the only border colour on light |
| `--line-soft` | `#f0eeec` | row separators inside panels |
| `--accent` | `#e4f222` | THE accent — actions, live state, ticks, active bars |

Rules: the accent never carries text meaning on its own and never tints a large area
except a filled button, a chip or a 2px progress bar. No gradients anywhere. No second
chromatic accent — the pastel washes (mint/peach/lavender/teal-mist) and the marker set
(coral/amber/orchid/azure/teal) are retired.

## Type — one family, one weight

- Sans: `var(--font-sans)` for everything, **weight 400 only** (`h1,h2,h3,strong,b`
  are reset to 400). Hierarchy comes from size and colour, never weight.
- Mono: `var(--font-mono)` for every machine value — ids, counts, timestamps, spend,
  branch names, runtime names, eyebrows inside panels.
- Playfair / Libre Caslon display is **retired**.

Scale as used:

| Role | Size / tracking / leading |
| --- | --- |
| Hero | `clamp(40px,6.4vw,72px)` · `-0.025em` · 1 |
| Band head | `clamp(30px,4.2vw,46px)` · `-0.025em` · 1.02 |
| Section head | `clamp(28px,3.4vw,40px)` · `-0.015em` · 1.05 |
| Lead | `20–24px` · 1.3 · `--muted` |
| Card title | `20–24px` · `-0.02em` · 1.15 |
| Body | `14–16px` · 1.5 |
| Row / UI | `12–13.5px` |
| Eyebrow | `10px` · `0.018em` · uppercase · `--muted` |
| Mono data | `10–12px` |

## Radii, borders, elevation

- `6px` controls and chips · `8px` tiles and menus · `10px` panels · `12px` inner
  frames · `14px` cards and windows · `16px` outer cards · `9999px` dots only.
- Borders are always `1px solid var(--line)`. Selection is a `3px` accent bar on the
  left edge, never a heavier border.
- **No shadows** except two: a menu popover `0 8px 24px rgba(12,10,8,0.12)` and a
  modal `0 24px 60px rgba(12,10,8,0.24)`. The hero console adds
  `0 18px 48px rgba(12,10,8,0.10)`.

## Motion

- `300ms ease-out` for anything a pointer caused; `500ms ease-out` for state that the
  page decided (a row highlighting itself, a chip filling).
- Named keyframes in use: `bi-rise` (menus/modals), `bi-caret` (terminal cursor),
  `bi-bar` (indeterminate run bar), `bi-sweep` (lane progress), `bi-marquee`
  (horizontal CLI wall), `bi-scrollup` (receipts columns), `bi-pulse` (demo click).
- One shared 1500ms beat drives every ambient animation on the page — tiles derive
  their frame from it rather than owning timers.
- `prefers-reduced-motion` collapses every animation to a single frame.

## Section architecture (Ramp order, BotInc content)

1. Announcement bar → 2. white sticky nav (centred pill nav, chevrons, ghost log-in,
filled CTA) → 3. hero: counter eyebrow, headline, lead, **platform download row**
(Mac downloads a file; iOS/Android open a QR modal, redirect on phones) → 4. **live
console window** on the dot field, 520px fixed, own title bar with traffic lights →
5. ink ticker band → 6. tool wall of the 14 CLIs → 7. **bento grid** (5 tiles, all
animated off the shared beat) → 8. **contrast pair** (old way vs one lane) → 9.
**three-step walkthrough** with a live 352px panel per step → 10. metric strip → 11.
**receipts wall** (dark, three columns scrolling at different speeds) → 12. roster
register → 13. install → 14. **add desks** pair → 15. pricing → 16. FAQ → 17. closing
ink band → 18. oversize wordmark footer.

## Components to add / retire

**Add:** `ConsoleStage` (the fixed-height window with title bar), `StoreModal` (QR +
copy link + phone redirect), `BentoTile`, `ContrastPair`, `StepWalkthrough`,
`ReceiptsWall`, `RuntimePicker`, `OfficerPicker` (portrait dropdown), `RunRecordModal`.

**Retire:** `GrainPlate`, `PastelBlock`, the arch crop, `.bi-plate`, the ruled ledger
ground, `LogoStrip`/`ToolLogo` CDN marks (the tool wall is plain wordmarks — the CDN
404s on `claude` and `cursor` and latches a failed state), `EmailCapture`.

**Keep:** `DotField` (as `dot-wave.js` — pointer displacement plus a click ripple that
expands as a ring), `TickerBar`, `PlanCard`, `FaqItem`, `SiteFooter`, the console
primitives (`IssueRow`, `StatusPill`, `PriorityChip`, `ActorAvatar`, `RunTimeline`).

## Voice — unchanged

The register voice still holds: sentence case with terminal periods, uppercase mono
eyebrows, real unrounded numbers with receipts, state the limit out loud, no emoji.

