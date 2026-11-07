/** Focused debug: photo upload flow */
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";

const BASE = `http://localhost:8077`;
const browser = await chromium.launch({
  executablePath: "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
  args: ["--no-sandbox"],
});
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("[pageexception]", String(e).slice(0, 300)));
page.on("console", (m) => console.log("[console." + m.type() + "]", m.text().slice(0, 250)));

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

const tabs = await page.locator('[role="tab"]').allInnerTexts();
console.log("tabs:", JSON.stringify(tabs));

await page.locator('[role="tab"]', { hasText: "البيانات" }).click();
await page.waitForTimeout(500);

const inputCount = await page.locator('input[type="file"][accept="image/*"]').count();
console.log("photo inputs:", inputCount);

await page.setInputFiles('input[type="file"][accept="image/*"]', "/home/z/my-project/scripts/fixtures/photo.jpg");
await page.waitForTimeout(2000);

const st = await page.evaluate(() => {
  const raw = localStorage.getItem("cv-studio-data-v1");
  if (!raw) return { exists: false };
  const s = JSON.parse(raw);
  return {
    exists: true,
    photo: (s.state?.data?.personal?.photo || "").slice(0, 40),
    showPhoto: s.state?.showPhoto,
    keys: Object.keys(s.state || {}),
  };
});
console.log("store:", JSON.stringify(st, null, 1));
await browser.close();
