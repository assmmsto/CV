/** Focused debug: import flow */
import { chromium } from "playwright-core";

const BASE = `http://localhost:8077`;
const browser = await chromium.launch({
  executablePath: "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
  args: ["--no-sandbox"],
});
const page = await (await browser.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
page.on("pageerror", (e) => console.log("[pageexception]", String(e).slice(0, 300)));
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.log("[console]", m.text().slice(0, 200)); });

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
await page.locator('[role="tab"]', { hasText: "استيراد" }).click();
await page.waitForTimeout(500);

await page.setInputFiles('input[type="file"][accept=".pdf,.docx,.txt,.md"]', "/home/z/my-project/scripts/fixtures/sample-cv.pdf");
await page.waitForTimeout(5000);

const state = await page.evaluate(() => ({
  hasResult: !!document.querySelector(".space-y-4 details"),
  badges: Array.from(document.querySelectorAll("[data-slot=badge], .rounded-full, .inline-flex")).map((e) => e.textContent?.trim()).filter((t) => t && t.length < 40).slice(0, 15),
  bodySnippet: document.body.innerText.slice(0, 400),
}));
console.log("badges:", JSON.stringify(state.badges));
console.log("body:", state.bodySnippet.replace(/\n+/g, " | ").slice(0, 380));
await page.screenshot({ path: "/tmp/pdfcheck/import-debug.png", fullPage: false });
await browser.close();
