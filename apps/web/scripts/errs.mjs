import { chromium } from "playwright";
const browser = await chromium.launch({ channel: process.env.CHROME_CHANNEL || "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (e) => console.log("PAGEERROR", e.stack?.split("\n").slice(0, 6).join("\n")));
page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE", m.text().slice(0, 600)); });
await page.goto(process.argv[2], { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(2500);
await browser.close();
