# Design reference

Frozen snapshot of the Claude Design sources this build implements.

- Project: `3409ba65-04b6-44b3-af90-d9eac984e5ec` (Botinc Design). Files: `Landing v4.dc.html` + `Landing v4.css`, `Workspace v19.dc.html` + the `Workspace v6..v19.css` chain, `ThreadShell.dc.html`.
- `notes/` - the designer's notes per version (V14 product contracts, V16 thread design, V17 routing, V18, V19 motion, onboarding).
- `shots/` - reference renders captured from the live preview with `shoot.mjs` (state frozen with `freeze=13,6,70` so the demo loops sit on one frame). These are the pixel targets; `scripts/pixdiff.mjs` compares a local render against them.
- `fetch.py` - pulls files from the project through `botinc design call read_file` (256 KiB windows, entity-decoded).
- `shoot.mjs` - renders a project file through the preview URL in-process (the temporary URL never leaves memory) and screenshots it at 1440 and 390, light and dark.

The verbatim CSS lives in `packages/brand/styles/`; the markup is ported by `scripts/dc2jsx.py` and regenerated with `scripts/regen-landing.sh`.
