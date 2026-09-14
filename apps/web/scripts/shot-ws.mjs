// Screenshot the workspace at one screen, driving the same logic seam the
// design shooter drives, so a diff compares like with like.
// usage: node scripts/shot-ws.mjs <url> <out-prefix> <screen-name> [widths] [themes]
import { chromium } from "playwright";
import fs from "node:fs";
import { WORKSPACE_SCREENS } from "../../../scripts/screens.mjs";

const [, , url, prefix, screenName, widthsArg = "1440", themesArg = "light"] = process.argv;
const screen = WORKSPACE_SCREENS.find((s) => s.name === screenName);
if (!screen) {
  console.error(`unknown screen ${screenName}; known: ${WORKSPACE_SCREENS.map((s) => s.name).join(", ")}`);
  process.exit(1);
}
fs.mkdirSync("proof", { recursive: true });
const browser = await chromium.launch({ channel: process.env.CHROME_CHANNEL || "chrome" });
let failed = false;
for (const w of widthsArg.split(",").map(Number)) {
  for (const theme of themesArg.split(",")) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: w < 500 ? 844 : 900 },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push(String(e)));
    page.on("console", (m) => {
      if (m.type() === "error" && !/favicon|ERR_BLOCKED/.test(m.text())) errs.push(m.text());
    });
    await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
    // The logic mounts behind the webfont gate; wait for it rather than a timer.
    await page.waitForFunction(() => Boolean(window.__dcLogic), null, { timeout: 60000 });
    await page.evaluate((t) => window.__dcLogic.setState({ theme: t }), theme);
    if (screen.go) {
      await page.evaluate((g) => window.__dcLogic.go(g), screen.go);
    } else if (screen.open) {
      await page.evaluate(([fn, arg]) => window.__dcLogic[fn](arg), screen.open);
    }
    await page.waitForTimeout(1500);
    // A screen that did not actually change view is not proof of anything.
    const view = await page.evaluate(() => window.__dcLogic.state.view);
    if (screen.go && view !== screen.go) {
      console.error(`${screenName}: expected view ${screen.go}, got ${view}`);
      failed = true;
    }
    const out = `proof/${prefix}-${theme}-${w}.png`;
    await page.screenshot({ path: out, fullPage: false });
    console.log(out, JSON.stringify({ view }), errs.length ? "errors: " + errs.slice(0, 3).join(" | ") : "");
    await ctx.close();
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
