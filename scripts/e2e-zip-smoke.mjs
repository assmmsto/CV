/** Smoke test v2: intercept the ZIP blob inside the page and verify its contents. */
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";

const STATE = JSON.parse(readFileSync("/tmp/e2e-state.json", "utf8"));

const run = async () => {
  const browser = await chromium.launch({
    executablePath: "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 300));
  });

  await page.goto("http://localhost:8077", { waitUntil: "networkidle" });
  await page.evaluate((s) => localStorage.setItem("cv-studio-data-v1", JSON.stringify(s)), STATE);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // capture every blob handed to an <a download> click
  await page.evaluate(() => {
    window.__captured = [];
    const origCreate = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      window.__captured.push(blob);
      return origCreate(blob);
    };
  });

  // switch to export tab
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll("button")).find((x) =>
      x.textContent.includes("النسخ الجاهزة")
    );
    if (b) b.click();
  });
  await page.waitForTimeout(400);

  // press "download all 10 (ZIP)"
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll("button")).find((x) =>
      x.textContent.includes("تحميل النسخ العشر")
    );
    if (!b) throw new Error("zip button not found");
    b.click();
  });

  // poll until a zip blob is captured (10 templates × ~0.5s)
  let got = null;
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(1000);
    got = await page.evaluate(() => {
      const z = (window.__captured || []).find((b) => b && b.size > 10000);
      if (!z) return null;
      return { size: z.size, type: z.type };
    });
    if (got) break;
  }
  console.log("captured blob:", got);

  if (got) {
    // export the last captured zip blob as base64
    const b64 = await page.evaluate(async () => {
      const z = (window.__captured || []).find((b) => b && b.size > 10000);
      const buf = await z.arrayBuffer();
      let bin = "";
      const bytes = new Uint8Array(buf);
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      return btoa(bin);
    });
    writeFileSync("/tmp/test-all.zip", Buffer.from(b64, "base64"));
    console.log("zip saved, b64 KB:", Math.round(b64.length / 1024));
  }

  console.log("page errors:", errors.length ? errors.slice(0, 5) : "none");
  await browser.close();
};

run().catch((e) => {
  console.error("SMOKE FAILED:", e);
  process.exit(1);
});
