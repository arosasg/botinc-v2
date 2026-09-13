// Screenshot a local URL at the proof sizes. usage: node scripts/shot.mjs <url> <out-prefix> [widths=1440,390] [full=1] [eval=js] [wait=ms]
import { chromium } from "playwright";
import fs from "node:fs";
const [, , url, prefix, ...rest] = process.argv;
const o = Object.fromEntries(rest.map((s) => { const i = s.indexOf("="); return [s.slice(0, i), s.slice(i + 1)]; }));
fs.mkdirSync("proof", { recursive: true });
const browser = await chromium.launch();
for (const w of (o.widths || "1440,390").split(",").map(Number)) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 500 ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
  if (o.eval) { await page.evaluate(o.eval); await page.waitForTimeout(600); }
  await page.waitForTimeout(o.wait ? Number(o.wait) : 1500);
  if (o.probe) { console.log('probe:', JSON.stringify(await page.evaluate(o.probe))); }
  const out = `proof/${prefix}-${w}.png`;
  await page.screenshot({ path: out, fullPage: o.full !== "0" });
  const dims = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight }));
  console.log(out, JSON.stringify(dims), errs.length ? "errors: " + errs.slice(0, 5).join(" | ") : "");
  await ctx.close();
}
await browser.close();
