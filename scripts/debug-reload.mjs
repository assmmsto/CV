/** Replicate e2e opening sequence: goto → set localStorage → reload → hook? */
import { chromium } from "playwright-core";

const BASE = process.argv[2] || "http://localhost:8077";
const browser = await chromium.launch({
  executablePath: "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
  args: ["--no-sandbox"],
});
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 300)));
page.on("console", (m) => { if (m.type() === "error") console.log("[console]", m.text().slice(0, 250)); });
page.on("response", (r) => { if (r.status() >= 400) console.log("[http" + r.status() + "]", r.url().slice(0, 130)); });

console.log("--- first load");
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
console.log("hook after load:", await page.evaluate(() => typeof window.__cvExportPdf));

console.log("--- inject state + reload");
await page.evaluate((s) => localStorage.setItem("cv-studio-data-v1", JSON.stringify(s)), { state: { data: { personal: { fullName: { ar: "اختبار", en: "Test" } } } }, version: 1 });
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1500);
console.log("hook after reload:", await page.evaluate(() => typeof window.__cvExportPdf));
console.log("body:", (await page.evaluate(() => document.body.innerText.slice(0, 100))).replace(/\n+/g, "|"));
await browser.close();
