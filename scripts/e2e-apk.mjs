/**
 * E2E test simulating the APK environment:
 *  - serves out/ statically
 *  - /api/* returns 404 JSON exactly like the APK WebView interceptor
 *  - injects a fake window.AndroidBridge before page scripts run
 *  - loads the sample data, opens the export tab, clicks "download all"
 *  - asserts AndroidBridge.printHtml received a full 10-sheet document
 *
 * Usage: node scripts/e2e-apk.mjs
 */
import http from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { chromium } from "playwright-core";

const ROOT = "/home/z/my-project/out";
const PORT = 4173;

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".woff2": "font/woff2", ".webmanifest": "application/json", ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname.startsWith("/api/")) {
    // exactly what MainActivity returns for api paths
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "offline", message: "PDF engine API is not available offline" }));
    return;
  }
  let p = url.pathname === "/" ? "/index.html" : url.pathname;
  const file = path.join(ROOT, p);
  if (!existsSync(file) || !file.startsWith(ROOT)) {
    res.writeHead(404); res.end("not found"); return;
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});

function findChrome() {
  return execSync("find /home/z/.cache/ms-playwright -name 'chrome-headless-shell' -type f | head -1").toString().trim();
}

async function main() {
  await new Promise((r) => server.listen(PORT, r));
  console.log("static server on :" + PORT);

  const browser = await chromium.launch({
    executablePath: findChrome(),
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const ctx = await browser.newContext();
  // seed the persisted zustand store (complete sample CVData) BEFORE page load
  const sampleData = JSON.parse(readFileSync("/tmp/cv-payload.json", "utf8")).data;
  const seed = JSON.stringify({
    state: { data: sampleData, uiLang: "ar", cvLang: "ar", templateId: "ats-classic", uiTab: "export" },
    version: 1,
  });
  await ctx.addInitScript(
    `localStorage.setItem("cv-studio-data-v1", ${JSON.stringify(seed)});`
  );
  await ctx.addInitScript(() => {
    window.__bridgeCalls = [];
    window.AndroidBridge = {
      printHtml(html) { window.__bridgeCalls.push(String(html)); },
    };
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });

  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2000);

  // 1) the store seeds uiTab:"export" — the export hub should be visible already

  // 2) click "download all" (ZIP button) — in APK mode this must go native
  const allBtn = page.getByText("تحميل النسخ العشر").first();
  await allBtn.waitFor({ state: "visible", timeout: 30000 });
  await allBtn.click();
  console.log("download-all clicked");

  // 3) wait for the bridge call
  await page.waitForFunction(() => (window.__bridgeCalls || []).length > 0, { timeout: 15000 });
  const calls = await page.evaluate(() => window.__bridgeCalls);
  const doc = calls[0];

  const sheets = (doc.match(/class="cv-sheet"/g) || []).length;
  const hasPageCSS = doc.includes("@page");
  const hasArabic = /[\u0600-\u06FF]/.test(doc);

  console.log("--- assertions ---");
  console.log("bridge calls:", calls.length);
  console.log("doc length:", doc.length);
  console.log("cv-sheet count:", sheets, "(expect 10)");
  console.log("has @page css:", hasPageCSS);
  console.log("has arabic text:", hasArabic);
  const fatalErrors = errors.filter((e) => !e.includes("favicon") && !e.includes("/api/"));
  console.log("page errors (excl. api 404s):", fatalErrors.length ? fatalErrors.slice(0, 5) : "none");

  const ok = calls.length === 1 && sheets === 10 && hasPageCSS && hasArabic && doc.length > 10000;
  await browser.close();
  server.close();
  if (ok) { console.log("E2E-APK PASS"); process.exit(0); }
  console.log("E2E-APK FAIL"); process.exit(1);
}

main().catch((e) => { console.error("E2E error:", e); process.exit(1); });
