# BotInc Design System

**BotInc is the incorporated workforce.** You post an issue; a roster of agent
employees dispatches it, builds it, reviews it, and merges it. You supervise by
exception.

The product is an open-source managed-agents platform: a Next.js web app and
desktop client, a Go backend, and a local daemon that drives whichever coding
CLI you already have on your PATH (Claude Code, Codex, CodeBuddy, GitHub Copilot
CLI, OpenCode, OpenClaw, Hermes, Pi, Cursor Agent, Kimi, Kiro CLI, Antigravity,
Qoder CLI, Trae CLI). Agents are first-class teammates: they hold issues, post
comments, raise blockers, and ship pull requests. Squads add a routing layer so
work goes to a group led by an agent rather than to a named individual.

The brand is **late Bronze Age meets modern agents**: a company register kept in
cobalt ink on cream paper, staffed by the Greek pantheon. Agents are named
officers with fixed duties — hermes dispatches, hephaestus builds, athena
reviews, apollo polishes, argus watches, mnemosyne remembers, agamemnon
orchestrates. Nothing about the identity is playful; it is a ledger.

## Products represented here

| Surface | Kit | What it is |
| --- | --- | --- |
| Marketing site (botinc.ai) | [`ui_kits/website/`](ui_kits/website/) | Home + the pantheon register, rebuilt on the Ramp section architecture (see below) on BotInc's own brand. |
| Console (the workspace app) | [`ui_kits/console/`](ui_kits/console/) | Incorporation wizard, issue board and list, issue record, agent roster, connector catalog, runtime panel, composer. |

Two **templates** are the fastest way to start something new: `templates/marketing-page/`
(the full page, editable in place) and `templates/console-screen/` (the workspace shell).

Not covered: the docs site (`apps/docs`), the desktop shell (`apps/desktop`) and
the iOS client (`apps/mobile`) — they reuse the console's tokens and components,
so the console kit is the reference for all three.

## The web direction (v5): sunrise over the workshop

Reference: the **Micro** style system (micro.so / the pasted Micro style guide),
with [ai-cmo.dev](https://ai-cmo.dev/) still setting the dev-first section
contract. The shape of the page is now:

- **One gradient sky.** `--gradient-sky` (azure → teal, in oklab) fills the top of the
  page and nowhere else. Repeating it kills the opening. The masthead floats
  transparent over it and only picks up paper + a hairline once you scroll.
- **A quiet paper canvas below it.** `#f5f5f5` page, `#ffffff` cards, warm
  near-black `#221f1c` text. Never pure black, never clinical grey.
- **The live dot field runs on both.** White dots on the sky, ink dots on paper —
  displacing away from the pointer and springing back. That is the grain-gradient
  signature and it is the one place the system spends motion.
- **Two faces, never swapped.** Playfair Display 800 carries headlines with
  **positive +0.02em tracking** (the anti-trend move); Instrument Sans carries
  every word the reader actually reads plus all product chrome; IBM Plex Mono is
  data only.
- **Pastel washes** (mint, peach, lavender, teal-mist) are the feature surfaces —
  the fill IS the visual, so nothing goes inside but type.
- **A closed marker set** (coral, amber, orchid, azure, teal) colours icons and
  the roster-graph node rings categorically. Never add a new chromatic accent.
- **Radii cluster:** 8px chrome, 14px cards, 18px blocks, 9999px pills. Never 4px
  on a card.
- **Real logos, never redrawn.** `ToolLogo` pulls marks from the Simple Icons CDN
  for Claude, Codex/OpenAI, Copilot, Cursor, GitHub, Slack, Linear, Figma,
  Sentry, Notion, PagerDuty, Docker, AWS, Discord, Grok, Gemini, DeepSeek.
  Tools with no published mark (CodeBuddy, OpenCode, OpenClaw, Kimi, Kiro,
  Antigravity, Qoder, Trae, Pi, Hermes) render as honest monogram tiles.

### The v5 language is system-wide

The gradient sky, the warm paper canvas and the pastel washes are not a
marketing-only skin — the console and both templates run the same language:

- **Console toolbar and sidebar** carry the gradient as the workspace chip
  (`background-image: var(--gradient-sky)` on an 18–20px `--radius-sm` tile), the
  only place the gradient appears in product UI.
- **Page titles** in the console are the display face (`.bi-display` at
  `--text-heading`), matching a marketing band head; row and card titles stay
  Instrument Sans 600 at `-0.015em`.
- **Summary tiles** are the pastel washes at `--radius-block`, not bordered cards —
  the same treatment as `PastelBlock` on the site.
- **The onboarding aside is a full gradient-sky panel.** `StepRail` takes an
  `onSky` prop that recolours every step as a white tint, because a
  token-driven cobalt tick vanishes into the gradient.
- **Radii and elevation come from the tokens**, never literals: 8px chrome,
  14px cards, 18px blocks, plus `--shadow-subtle`.
### The screenshots are real

`assets/product/console-*.png` are captures of `ui_kits/console/index.html`
in this project — board, roster, connectors, setup wizard. Recapture them when
the console kit changes; never hand-draw a dashboard.

### Font substitutions to confirm

The Micro reference names **perfectlyNineties** and **haffer**, neither of which
is web-licensable here. Standing in: **Playfair Display** (the reference's own
named substitute) for display, **Instrument Sans** for the workhorse. Send the
real files and I will wire them into `tokens/fonts.css`.

## Ramp geometry reference

The marketing surface follows the section architecture of ramp.com, read from the
Mobbin capture the team supplied. What is copied is **structure and interaction
rhythm**, never Ramp's identity — no yellow, no Ramp typeface, no Ramp copy.

| Ramp pattern | BotInc translation |
| --- | --- |
| 56px navbar, small wordmark, centred nav with chevron mega-menus, quiet "Sign in" + one filled CTA | Same geometry; wordmark in Caslon, menu panels are hairline cards on cream |
| Hero: mono micro-eyebrow carrying a live figure, tight two-line headline, one-line sub, **email-capture pill** | Same, with the figure as "ISSUES CLOSED BY THE ROSTER THIS WEEK" and the headline in Caslon Display |
| Full-width product collage on a **dotted grid** | `ProductFrame` mounted figure over `DotField` — cobalt dots that flee the pointer |
| **Live odometer ticker bar** under the hero | `TickerBar`: dispatched / review rounds / merges / agent minutes / merge rate, climbing |
| Logo wall of customers | A ruled **tool wall** of the 14 coding CLIs the daemon drives — BotInc has no logo wall to show, and the tools are the honest proof |
| Centred caps eyebrow + big headline + one line, then a **bento grid** of white cards with tinted icon tiles | `BandHead` + `BentoCard` with the engraved icon suite in cobalt-100 tiles |
| Two-column feature blocks with a "Corporate card →" text link | Same, with `.bi-textlink` (arrow moves, label underlines) |
| **Dark testimonial carousel** with prev/next circles | `CaseCard` in `Carousel` — quotes are cases from the ledger, stamped with their issue id |
| Pricing register | `PlanCard` ×3, the featured plan taking the ink treatment instead of a badge |
| Closing CTA band + large footer | Ink `DotField` band with a second `EmailCapture`, then `SiteFooter` with the wordmark set oversize on the bottom rule |
| Alternating white / light-grey bands | Alternating `cream-100` / `cream-50` / `cream-200`, with two ink bands for the roster and the close |

Radii: **6px** controls, **8px** tiles, **10px** panels. The console keeps its own
8/10/14px scale.

Reference sections on Mobbin: [hero](https://mobbin.com/sites/sections/c224c647-a876-44fc-ad18-ac01acee3004) ·
[bento grid](https://mobbin.com/sites/sections/b54966b6-e31a-4e18-af6a-80810799c008) ·
[case carousel](https://mobbin.com/sites/sections/f94cb20b-8c96-4d62-ac73-7acb482f2767) ·
[full section list](https://mobbin.com/sites/ramp-ce5fe5e7-4dd5-4bf7-bd90-a4cd4945b4de/c7bdc9b7-d439-4c61-a13a-c35688970d1f/sections)

## Sources this system was built from

- **GitHub — [`github.com/arosasg/botinc`](https://github.com/arosasg/botinc)** (private; branch `main`). Read directly:
  - `packages/brand/tokens.css` — the brand source of truth (cobalt/cream ramps, plate CSS, type stacks). Copied here verbatim into `tokens/`.
  - `packages/brand/{mark.tsx,icon.tsx,plate.tsx,icons.svg}` — helm mark, the 13-glyph engraved icon sprite, the six tuned Paper Shaders plates.
  - `packages/ui/styles/tokens.css` — the console's OKLCh semantic layer, the 10-step type scale, light and the cobalt-ink dark theme.
  - `packages/ui/components/ui/{button,badge,card,input,switch,tabs}.tsx` — exact geometry for the console primitives (heights, radii, paddings).
  - `docs/design.md` — the product's written design law (surface hierarchy, three font sizes, two weights, hover-vs-active rules, anti-pattern list). Written in Chinese; distilled into English below.
  - `apps/web/features/landing/v2/{content.ts,home-page.tsx,pantheon-page.tsx,site-shell.tsx,primitives.tsx,media.tsx}` and `site-v2.css` — marketing copy, section order and the display type ramp.
  - `apps/web/public/brand/pantheon/*.webp`, `docs/assets/*` — portraits and product screenshots, copied into `assets/`.
- **User-supplied motion loops** — `uploads/loop-{apollo,argus,athena,hephaestus,hermes}-agent.mp4`, copied to `assets/pantheon/loops/`.
- **Mobbin (Ramp)** — [the section list the team linked](https://mobbin.com/sites/ramp-ce5fe5e7-4dd5-4bf7-bd90-a4cd4945b4de/c7bdc9b7-d439-4c61-a13a-c35688970d1f/sections), read through the Mobbin connector. Drove the section architecture above.
- **Paper Design *Grain Gradient*** (<https://shaders.paper.design/grain-gradient>, `npm i @paper-design/shaders-react`) — the shader the product's `Plate` wraps. Reproduced dependency-free as `GrainPlate` and `DotField`; see "Intentional additions".

Anyone with access to that repository should read it further before building:
`docs/product-overview.md`, `docs/ui-consistency-audit.md` and
`packages/views/` carry far more product detail than a design system can hold.

---

## Content fundamentals

**The voice is a company register, not a pitch.** Copy states what happened or
what will happen, in the fewest words, in the present tense, and stops.

- **Second person for the reader, third person for the company.** "You post an
  issue. The company answers." Never "we"; BotInc-the-vendor does not speak.
  Agents are never "I".
- **Sentence case with terminal periods, even in headlines.** "Incorporate your
  workforce." "Hire your staff." "Let it run." The period is the point: these
  are entries, not slogans.
- **Eyebrows and stamps are uppercase mono.** `BOTINC · THE INCORPORATED
  WORKFORCE`, `THE SIX-STEP STORY`, `REGISTER OF OFFICERS`, `FILED`, `PL. 03`,
  `EST. ANTIQUITY · INC. 2026`. Separator is a middot with spaces.
- **Nouns from employment and record-keeping.** Hire, staff, roster, desk, duty,
  officer, register, ledger, filed, stamp, dispatch, merge. Never "AI-powered",
  "supercharge", "seamless", "unleash", "revolutionise".
- **Antiquity is stated flatly, never winked at.** "The old gods, on staff."
  "Handles are duty titles, not personalities. The gods do not chat; they file."
  No mythology jokes, no thunderbolt metaphors, no lightning emoji.
- **Feature copy ends with the click.** The product's own pattern: two or three
  sentences of what it is, then a mono line naming the exact affordance —
  `CLICK: RUNTIMES, THEN CONNECT A DAEMON`.
- **Numbers are real and unrounded.** `14 coding CLIs`, `$0.42`, `4m 12s`,
  `BOT-289`, `PR #333`. A figure with no receipt does not ship.
- **Run records read as past-tense third person** with the machine values in a
  mono detail line: "hephaestus opened PR #341 · 12 files · +418 / -96 · $0.42".
- **No emoji anywhere.** Not in product UI, not in marketing, not in commit
  copy. The one exception in the codebase is user-chosen avatar emoji.
- **Say the limit out loud.** "Nothing merges itself." "Read-only by default."
  "Uninstalls in one command." A developer trusts the sentence that tells them
  what the product will *not* do.
- **Lead with the command, not the claim.** On any developer surface the first
  action is the install line, and the first number is time-to-first-result.
- **Product UI writes short and unpunctuated**: button labels are 1–3 words
  ("New issue", "Reassign", "Pair a daemon"), helper text is one sentence, error
  text is inline and specific.

---

## Visual foundations

### Colour

One hue carries the brand: **cobalt**, an eleven-step ramp whose 600 step
(`#1745C9`) is *the* brand colour. The neutral is not grey — it is **cream
paper**, five steps from `#FFFDF4` to `#DED3B0`. There is no grey ramp anywhere
in the system; every "grey" you would reach for is a tint of paper or a
desaturated cobalt (`--bi-text-muted: #4a5c93`).

Three **period pigments** carry semantics and nothing else: **ochre** (warning),
**verdigris** (success), **oxide** (destructive). Two more exist in the console
for lifecycle nuance: `--merged` (a verdigris-cyan that sits between success and
info) and `--difficulty-heavy` (a cobalt-mauve, deliberately far from oxide so a
heavy cost tier never reads as an error).

Rules: semantic colour appears on small elements — a badge, an icon, a border. A
large tinted area uses the 10–16% alpha variant of the token, never the solid.
Two or three semantic colours per screen, maximum. Text colour never exceeds
three levels in one view.

The marketing site has **no dark mode**; it alternates paper bands and ink bands
down the page (`.botinc-inverse`). The console *does* have a dark theme, and it
is the cobalt-ink world — every step a tint of ink, text in cream, never a grey
theme and never pure black.

### Type

Four faces, two ramps that never mix.

- **Libre Caslon Display** — marketing headlines and the wordmark. Fluid clamps
  from `2.4rem` to `8.4rem`, negative tracking down to `-0.052em`, leading down
  to `0.93`. High-contrast, slightly literary; it is what makes the page read as
  printed matter.
- **Libre Caslon Text** — marketing prose, italic for asides. `1.05rem` body,
  `clamp(1.05rem, 1.5vw, 1.3rem)` lead, 1.5 leading.
- **Archivo** — all UI chrome and the entire console. Ten named steps from
  `micro` 11px to `display` 36px, each with its line-height baked in.
- **IBM Plex Mono** — every machine value: eyebrows, stamps, ids, figures,
  timestamps, model names, spend. Tabular numerals.

Weights: **400 and 500 only.** No bold, no semibold — in a density-first tool,
weight is a hierarchy signal, and spending it on emphasis destroys the rhythm.
Emphasis comes from size, colour, or the mono/serif switch. Console type never
exceeds 36px; marketing display type is a separate ramp and stays out of the
product scale.

### Spacing and layout

Marketing bands centre on a **92rem measure** with the gutter computed as
`max(1rem, calc((100vw - 92rem) / 2))`; vertical padding is
`clamp(5rem, 9vw, 9rem)` (`12vw/12rem` for tall bands). Console spacing is the
**4px grid**, and each step names a relationship: 4px binds an icon to its
label, 8px separates siblings, 12px is card padding, 16px separates blocks, 24px
separates regions. **If you need a divider, the gap was too small** — spacing
first, one hairline second, a background tint third, a full card last.

Fixed elements: the marketing masthead is sticky and gains its bottom hairline
only after scroll; the console's chat launcher owns the bottom-right corner via
`--chat-launcher-clearance`, so page content stays clear of it.

### Backgrounds and imagery

No photography. Four background treatments exist:

1. **Plain cream paper** — the default.
2. **Ruled ledger ground** — hairlines repeating every ~4.6rem, drawn straight
   onto a band behind hero copy. It is the grid made visible.
3. **The halftone plate** — a cobalt radial ink pool over a 3px dot screen
   (`.bi-plate`), optionally cropped to the **arch** (`999px 999px 0 0`), the
   most recognisable BotInc shape after the helm.
4. **Ink bands** — full-bleed `.botinc-inverse` sections for the roster, the
   closing CTA and the footer.

Illustration is one style only: **cobalt engraving on cream stock** — the seven
pantheon portraits, drawn as Bronze-Age busts with clockwork internals, dotted
halftone shading, visible paper grain. Warm, not cool; two colours, never more.
Product screenshots are **mounted like printed figures** — hairline frame, cream
mount, mono caption bar, `FIG. 01` stamp — never tilted, never floating on a
gradient, never with a drop shadow.

Protection: BotInc does not dim a plate with a flat scrim. It fades the plate
*into* the surrounding paper (`.bi-scrim-paper`) or into the ink
(`.bi-scrim-bottom`), so the join disappears. Blur is used in exactly one place:
`backdrop-filter: blur(10px)` on the sticky masthead. Transparency otherwise
appears only as alpha on hairlines and semantic tints.

### Borders, radii, shadow

Corners are almost square where the brand shows: **2px** on marketing controls,
**4px** on marketing panels, `999px 999px 0 0` for the arch. The console is the
one place with real radii: **10px** controls and fields, **8px** on the small
sizes, **14px** cards, **26px+** (effectively pill) badges, `999px` avatars and
switches.

Separation is a **hairline** (`rgb(10 34 112 / 16%)`), stepping up to the full
ink rule and, once per page at most, the 3px double rule. Shadows are
cobalt-tinted, never black, and nearly invisible: `--surface-shadow` is two 1px
layers at 4–6% alpha. Menus get `--menu-shadow`, window-level overlays get
`--floating-shadow`. Marketing surfaces use **no shadow at all** — a panel is
paper with a hairline. Cards therefore look like: cream fill, 1px hairline,
14px radius (console) or 4px (marketing), and a shadow you have to look for.

### Motion, hover, press, focus

Two durations carry everything: **160ms** for anything a pointer caused, **420ms**
for anything the page decided (scroll reveal, plate settle). One curve,
`cubic-bezier(0.22, 0.61, 0.36, 1)`; on the console side plain `ease-out`. No
spring, no bounce, no page transitions, no skeletons (a spinner or inline
loading text instead).

- **Hover** changes colour only. List rows and ghost buttons go to `--muted`;
  filled buttons darken one notch; marketing panels raise their hairline from
  16% to full ink; nav links grow a 1px underline; the CTA's arrow slides 2px.
  Never `scale`, never a new shadow, never a size change.
- **Active/selected** always carries one dimension hover does not — weight plus
  colour, not just a darker background — so hovering a selected row can never
  make it look deselected. (This is the bug the product's design doc names
  explicitly.)
- **Press** is a 1px downward nudge (`translateY(1px)`), skipped on buttons that
  open a popover.
- **Focus** is `focus-visible` only: border to `--ring` plus a 3px `ring/50`
  halo, the same on every control, never the component's own colour.
- **Disabled** is `opacity: 0.5` and no pointer events. That is the whole rule.
- **Reveal on scroll** is opacity plus 12px of travel, once, 420ms.

**The one place BotInc spends motion** is the grain plate: a continuous dot
field that displaces away from the pointer in real time and springs back
(`GrainPlate`). It replaces the Paper Design *Dithering* shader the product
loads from `@paper-design/shaders-react`, so a plate needs no npm dependency and
no WebGL. `prefers-reduced-motion` freezes the drift and every marquee.

---

## Iconography

- **The engraved BotInc suite is the brand set** — 13 glyphs for product
  concepts, shipped as an SVG sprite: `assets/icons/botinc-icons.svg`, referenced
  by symbol id (`#bi-icon-merge`). Monoline, `stroke-width: 1.5`, round caps,
  `fill: none`, `currentColor`. Names: `agents, issue, review, merge, runtime,
  model, routing, autopilot, connector, memory, design-system, subscription,
  key`. Use `BotIncIcon` — do not redraw them and do not add a fourteenth
  without drawing it at the same weight.
- **Everything else is Lucide.** The product mandates `lucide-react` and forbids
  mixing icon libraries or hand-rolling SVGs. For chevrons, close, search, plus,
  copy, external-link and the rest, use Lucide at the size bound to the control:
  12px in a 24px control, 14px in 28px, 16px in 32px and 36px. Icons inherit the
  text colour and step down to `--muted-foreground` when quiet. In these HTML
  kits Lucide is not bundled; where a generic glyph was needed we used a mono
  character or a component-drawn figure and noted it. **Load Lucide from CDN
  (`https://unpkg.com/lucide-static`) when you need generic icons in a mock.**
- **The helm mark is not an icon.** It is the logo: `assets/logo/botinc-mark.svg`
  (currentColor) with `-cobalt` and `-cream` variants for `<img>` use, plus the
  repo's `botinc-logo-light.svg` / `-dark.svg`. Never redraw, recolour or
  outline it.
- **Priority is a figure, not an icon** — three bars whose filled count is the
  level (`PriorityChip`). Lifecycle is a ring / half-ring / solid dot
  (`StatusPill`), so a column reads without colour.
- **No emoji as iconography.** Unicode is used sparingly for two marks only: the
  CTA arrow `↗` and the disclosure caret `▾`.

---

## Intentional additions

Three things here have no one-to-one counterpart in the source, and why:

1. **`GrainPlate` and `DotField`** — the repo's `Plate` wraps
   `@paper-design/shaders-react` `Dithering`, which cannot run in a
   dependency-free HTML file. `GrainPlate` keeps the same six look names
   (`arcade, vista, fountain, orbit, keystone, swell`), the same colour pairs and
   the same "CSS halftone first" behaviour. `DotField` is the quiet, full-band
   version you can set type on. Both displace away from the pointer in real time
   and spring back — the Ramp-style particle interaction the team asked for.
2. **`EmailCapture`, `TickerBar`, `BentoCard`, `CaseCard`, `Carousel`,
   `PlanCard`, `ConnectorMarquee`, `StatBand`, `FeatureTabs`, `ProductFrame`** —
   the slots the Ramp section architecture needs. All built from existing brand
   parts only: rules, mono eyebrows, hairline panels, engraved icons.
   `StepRail`, `OptionCard`, `ConnectorTile` and `AgentTile` are the console
   equivalents for the incorporation wizard, the connector catalog and the
   roster — the product has these screens; it did not have named components for
   them.
3. **`StatusPill` / `PriorityChip` / `ActorAvatar`** — the product expresses
   these through `Badge` plus Lucide icons and a large property-icon module;
   they are pulled out as named components because every console screen needs
   them and getting them wrong is what makes a mock look off-brand.

## Substitutions to confirm

- **Fonts are loaded from Google Fonts, not from binaries.** The product loads
  Libre Caslon Display, Libre Caslon Text, Archivo and IBM Plex Mono through
  `next/font/google`, so there are no font files in the repository to copy.
  `tokens/fonts.css` imports the same four families from the Google CDN. If you
  have licensed/self-hosted `.woff2` files, drop them in `assets/fonts/` and
  replace that `@import` with `@font-face` rules — **please send them and I will
  wire them up.**
- **No Lucide binaries were copied** (see Iconography) — CDN or your app's own
  `lucide-react` install.
- **`assets/product/board-view.png` is the repo's pre-migration capture** and
  shows an older palette. It is kept for provenance only — the site now uses
  `console-board/agents/connectors/setup.png`, captured from this project's own
  console kit on the v3 tokens.

---

## Index

| Path | What it is |
| --- | --- |
| `styles.css` | The one entry point. Imports everything below. |
| `tokens/colors.css` | Cobalt brand, **paper** + **ink** ramps, period pigments, semantic aliases, `.botinc-inverse`. Cream is kept for mounting engravings only. |
| `tokens/typography.css` | Both type ramps: marketing clamps and the console's ten named steps. |
| `tokens/fonts.css` | The four Google-hosted families. |
| `tokens/spacing.css` | Marketing measure/gutter/band, console 4px grid with named relationships. |
| `tokens/elevation.css` | Radii, hairline/rule/double borders, the cobalt shadow set. |
| `tokens/motion.css` | Durations, curve, grain-field parameters, reduced-motion overrides. |
| `tokens/app.css` | Console semantic layer, light + the cobalt-ink `.dark` theme. |
| `tokens/surfaces.css` | `.bi-plate`, the arch, scrims, ruled grounds, rules, type helpers. |
| `tokens/components.css` | Interaction states that cannot be inline: hover, focus, press, marquee, tabs, reveal. |
| `components/brand/` | `BotIncMark`, `BotIncIcon`, `GrainPlate`, `LedgerRule`. |
| `components/site/` | `AnnounceBar`, `SiteNav`, `SiteFooter`, `SiteButton`, `EyebrowPill`, `CommandBlock`, `ToolLogo`, `LogoStrip`, `PastelBlock`, `RosterGraph`, `StepShot`, `MetricStrip`, `AgentRow`, `FaqItem`, `CompareTable`, `DotField`, `TickerBar`, `EmailCapture`, `BentoCard`, `CaseCard`, `Carousel`, `PlanCard`, `SectionHeading`, `StepCard`, `AgentCard`, `LedgerPanel`, `StatBand`, `ConnectorMarquee`, `FeatureTabs`, `ProductFrame`. |
| `components/app/` | `AppButton`, `AppBadge`, `AppInput`, `AppSwitch`, `AppCard`, `StatusPill`, `PriorityChip`, `ActorAvatar`, `SidebarNav`, `IssueRow`, `BoardCard`, `BoardColumn`, `RunTimeline`, `StepRail`, `OptionCard`, `ConnectorTile`, `AgentTile`. |
| `guidelines/` | 20 specimen cards: colour ramps, both type ramps, spacing, plates, rules, radii, motion. |
| `templates/marketing-page/` | **Starting template** — the full marketing page as a directly editable design component. |
| `templates/console-screen/` | **Starting template** — the console shell and issue board, directly editable. |
| `ui_kits/website/` | Marketing site kit (home + pantheon register, click-through) + its README. |
| `ui_kits/console/` | Console kit (board, issue record, agents, runtimes) + its README. |
| `assets/logo/` | Helm mark (currentColor, cobalt, cream) and the repo's light/dark logos. |
| `assets/icons/botinc-icons.svg` | The 13-glyph engraved sprite. |
| `assets/pantheon/` | Seven engraved portraits + five motion loops + the film poster. |
| `assets/product/` | Product screenshots for mounted figures. |
| `assets/brand/` | Banner, OG image, and the pantheon page reference capture. |
| `SKILL.md` | Agent-skill entry point. |
| `github.md` | Source-repo association and sync record. |

