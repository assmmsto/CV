import { chromium } from "playwright-core";
const browser = await chromium.launch({
  executablePath: "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
  args: ["--no-sandbox"],
});
const page = await (await browser.newContext()).newPage();
const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text().slice(0, 200)}`));
page.on("pageerror", (e) => logs.push("[PAGEERROR] " + String(e).slice(0, 300)));
await page.goto("http://localhost:8099/app/", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3000);
const hook = await page.evaluate(() => typeof window.__cvExportPdf);
console.log("hook:", hook);
console.log("logs:\n" + logs.join("\n"));
await browser.close();
