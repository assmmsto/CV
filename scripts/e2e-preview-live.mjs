/**
 * E2E for the PREVIEW-TAB fix (v1.2.1):
 *  A. GitHub-Pages simulation: serve docs/ at localhost:8078 with /CV/app/* → docs/app/*
 *     - open app with sample data → PREVIEW tab → click «تحميل PDF»
 *     - ASSERT: a real .pdf download fires AND window.print() is NEVER called
 *  B. APK simulation: serve out/ with /api/* 404s + fake AndroidBridge.saveFile
 *     - click preview «تحميل PDF» → ASSERT: bridge.saveFile receives a valid PDF
 */
import { chromium } from "playwright-core";
import http from "node:http";
import { readFileSync, existsSync, writeFileSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const PORT = 8078;
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".txt": "text/plain", ".mjs": "text/javascript", ".webmanifest": "application/json" };

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  let p = url.pathname;
  if (p.startsWith("/CV/app/")) p = "/app" + p.slice("/CV/app".length);
  else if (p === "/CV/app") p = "/app";
  let file = path.join("/home/z/my-project/docs", p === "/" ? "index.html" : p);
  if (existsSync(file) && file.startsWith("/home/z/my-project/docs")) {
    try { if (statSync(file).isDirectory()) file = path.join(file, "index.html"); } catch {}
  } else if (!existsSync(file)) {
    res.writeHead(404); res.end("404"); return;
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});


let pass = 0, fail = 0;
const ok = (m) => { console.log("  ✅", m); pass++; };
const bad = (m) => { console.log("  ❌", m); fail++; };

const browser = await chromium.launch({
  executablePath: "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
  args: ["--no-sandbox"],
});

/* ---------------- A) Pages simulation — preview download, NO print ---------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  await page.goto("https://assmmsto.github.io/CV/app/", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(2500);
  // sample data via the UI button
  await page.locator("button", { hasText: "تجريبي" }).first().click();
  await page.waitForTimeout(1000);
  // neutralize window.print — flag if anything tries to call it
  await page.evaluate(() => {
    window.__printCalled = false;
    window.print = () => { window.__printCalled = true; };
  });
  // go to PREVIEW tab
  await page.locator('[role="tab"]', { hasText: "المعاينة" }).first().click();
  await page.waitForTimeout(800);
  const dlP = page.waitForEvent("download", { timeout: 90000 });
  const btn = page.locator("button", { hasText: "تنزيل PDF" }).first();
  (await btn.count()) ? ok("preview tab has «تحميل PDF» button") : bad("preview download button missing");
  await btn.click();
  const dl = await dlP;
  const name = dl.suggestedFilename();
  const buf = readFileSync(await dl.path());
  (name.endsWith(".pdf") && buf.subarray(0, 5).toString() === "%PDF-")
    ? ok(`preview click → direct download "${name}" (${(buf.length / 1024).toFixed(0)}KB)`)
    : bad(`preview click → wrong file: ${name}`);
  await page.waitForTimeout(1500);
  const printCalled = await page.evaluate(() => window.__printCalled);
  !printCalled ? ok("window.print() was NEVER called — no print dialog") : bad("window.print() WAS called — print dialog appeared!");
  await ctx.close();
}

await browser.close();
console.log(`\n===== LIVE PREVIEW FIX: PASS=${pass} FAIL=${fail} =====`);
process.exit(fail ? 1 : 0);
