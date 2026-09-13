import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
await ctx.addInitScript(() => {
  window.__log=[]; const t0=performance.now();
  const siv=Element.prototype.scrollIntoView; Element.prototype.scrollIntoView=function(o){ const sc=this.closest('.t9-scroll'); window.__log.push(['siv', Math.round(performance.now()-t0), this.className.toString().slice(0,40), JSON.stringify(o), sc?.scrollHeight, this.offsetTop, sc?.scrollTop]); const r=siv.call(this,o); window.__log.push(['after', sc?.scrollTop]); return r; };
});
const page = await ctx.newPage();
await page.goto(process.argv[2], { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(2500);
console.log(JSON.stringify(await page.evaluate(() => ({ log: window.__log.slice(0, 30), top: document.querySelector(".t9-scroll")?.scrollTop, logs: document.querySelectorAll(".conversation-log13").length }))));
await browser.close();
