/** Debug import: check pdfjs worker serving + capture the exact failure */
import { chromium } from "playwright-core";

const BASE = `http://localhost:8077`;
const browser = await chromium.launch({
  executablePath: "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
  args: ["--no-sandbox"],
});
const page = await (await browser.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
page.on("pageerror", (e) => console.log("[pageexception]", String(e).slice(0, 300)));
page.on("console", (m) => console.log("[console." + m.type() + "]", m.text().slice(0, 250)));
page.on("response", (r) => { if (r.url().includes("pdf.worker")) console.log("[resp]", r.status(), r.url(), r.headers()["content-type"]); });
page.on("requestfailed", (r) => { if (r.url().includes("pdf.worker")) console.log("[reqfail]", r.url(), r.failure()?.errorText); });

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

// probe worker availability + pdfjs import inside the page
const probe = await page.evaluate(async () => {
  try {
    const res = await fetch("/pdf.worker.min.mjs");
    return { status: res.status, ct: res.headers.get("content-type"), size: (await res.text()).length };
  } catch (e) { return { fetchErr: String(e) }; }
});
console.log("worker probe:", JSON.stringify(probe));

await page.locator('[role="tab"]', { hasText: "استيراد" }).click();
await page.waitForTimeout(400);
await page.setInputFiles('input[type="file"][accept=".pdf,.docx,.txt,.md"]', "/home/z/my-project/scripts/fixtures/sample-cv.pdf");

// poll for result or toast for up to 15s
let info = null;
for (let i = 0; i < 15; i++) {
  await page.waitForTimeout(1000);
  info = await page.evaluate(() => ({
    toasts: Array.from(document.querySelectorAll("[data-sonner-toast], li[role=status]")).map((t) => t.textContent?.trim()).filter(Boolean),
    hasDetails: !!document.querySelector("details"),
    busy: document.body.innerText.includes("جارٍ التحليل"),
  }));
  if (info.toasts.length || info.hasDetails) break;
}
console.log("after import:", JSON.stringify(info));
await browser.close();
