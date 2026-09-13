# Visual proof

Every screen is compared against a render of the design itself, at the same
size and theme, and a screen is done when the pixel delta is zero.

## How to run it

```sh
pnpm --filter @botinc/web build
pnpm --filter @botinc/web start          # serves on :3100
node apps/web/scripts/shot-ws.mjs http://localhost:3100/w <prefix> <screen> 1440 light
node scripts/pixdiff.mjs <reference.png> apps/web/proof/<prefix>-light-1440.png /tmp/diff.png
```

`scripts/screens.mjs` is the list of screens and how each one is reached.
Reference renders come from the live Claude Design preview through
`design-ref/shoot-ws.sh`.

## Three ways this measurement lies, and what stops each

**A wrong view name diffs to zero.** Driving the workspace to a view that does
not exist renders the same broken screen on both sides, and the diff is 0.000%.
That looks like a pass and proves nothing. The view names in
`scripts/screens.mjs` are the real ones taken from the logic, and `shot-ws.mjs`
asserts that the view actually changed before it saves a frame. It was this
trap that first produced a clean sweep across eleven screens that were all
rendering an empty page.

**An animation makes every capture differ.** The landing's hero demo runs a
seventeen-step loop, so two screenshots taken a second apart disagree by around
3% and none of it is a porting defect. `?demo=<idx>,<wf>,<rt>` freezes the loop
at one frame; the references are captured with the matching `freeze=`.

**A capture taken too early freezes a transition mid-flight.** A screen opened
inside the shooter's `probe` hook is photographed milliseconds after
navigation, before its scroll shade settles, which showed up as a stable
0.035% delta that looked exactly like a real defect. Screens that need a
subject are opened with `pre=`, which runs before the settle wait.

None of these is caught by a number. Look at the images.

## Current result

Workspace v19, thirteen screens, light and dark at 1440 and light at 390:
every one 0.000%. Landing v4 and the five onboarding steps, light and dark at
1440: every one 0.000%, except the deviation below.

## Deliberate deviation

`Landing v4` declares `apiCls` twice in one object literal:

```js
apiCls: 'switch' + (s.apiFallback ? '' : ' off'),
...
apiCls: 'small-button' + (s.method === 'api' ? ' primary' : ''),
```

The second wins, so the "When every subscription is out" control on the models
step renders as an unstyled button. It is invisible on white and invisible on
ink, while still carrying `role="switch"` and `aria-label="API fallback"`.

This port keeps the two bindings apart, so the switch renders and works. The
deviation is 164 pixels on `ob-models` in dark, and it is the only place this
build does not match the design render. The design file should be corrected;
until it is, this is intentional and this note is the record of it.
