/** Probe Pages build under /CV/app/ */
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
  args: ["--no-sandbox"],
});
const page = await (await browser.newContext()).newPage();
page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 300)));
page.on("console", (m) => { if (m.type() === "error") console.log("[console]", m.text().slice(0, 300)); });
page.on("requestfailed", (r) => console.log("[reqfail]", r.url().slice(0, 120), r.failure()?.errorText));
page.on("response", (r) => { if (r.status() >= 400) console.log("[http" + r.status() + "]", r.url().slice(0, 140)); });

await page.goto("http://localhost:8078/CV/app/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const title = await page.title();
const hook = await page.evaluate(() => typeof window.__cvExportPdf);
const bodyStart = await page.evaluate(() => document.body.innerText.slice(0, 120).replace(/\n+/g, "|"));
console.log("title:", title, "| hook:", hook, "| body:", bodyStart);
await browser.close();
