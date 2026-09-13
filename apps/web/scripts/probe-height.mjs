import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.goto(process.argv[2], { waitUntil: "commit", timeout: 120000 });
const out = [];
for (let i = 0; i < 20; i++) {
  await page.waitForTimeout(150);
  out.push(await page.evaluate(() => { const t = document.querySelector(".t9-scroll"); const log = document.querySelector(".conversation-log13"); return t ? [Math.round(performance.now()), t.scrollHeight, t.scrollTop, log?.offsetHeight, document.querySelectorAll(".t9-scroll img").length, [...document.querySelectorAll(".t9-scroll img")].filter(i=>!i.complete).length] : null; }));
}
console.log(JSON.stringify(out));
await browser.close();
