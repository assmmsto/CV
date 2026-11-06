/**
 * Standalone PDF worker — executed by bun (outside the Next.js bundler).
 *
 * Usage:  bun scripts/pdf-worker.ts <payload.json> <outputDir>
 *
 * payload.json:
 *   { data: CVData, lang: "ar"|"en", templates: string[] | "all",
 *     accent?: string, showPhoto?: boolean, font?: "modern"|"classic"|"mixed" }
 *
 * Writes one PDF per template into <outputDir> plus a manifest.json:
 *   [{ templateId, fileName, file }]
 */

import { exit } from "node:process";
import { writeFileSync, readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import os from "node:os";

// --- resolve imports relative to project root (bun handles TS/TSX natively) ---
import { renderTemplateHTML } from "../src/lib/cv/export-html";
import { exportBaseName } from "../src/lib/cv/export-names";
import { getTemplate, TEMPLATES } from "../src/components/cv/templates/registry";
import type { CVData, Lang } from "../src/lib/cv/types";

interface Payload {
  data: CVData;
  lang: Lang;
  templates: string[] | "all";
  accent?: string;
  showPhoto?: boolean;
  font?: "modern" | "classic" | "mixed";
}

/* ---------------- chromium discovery ---------------- */

function findChromium(): string | null {
  const candidates: string[] = [];
  if (process.env.CHROME_PATH) candidates.push(process.env.CHROME_PATH);
  const root = path.join(os.homedir(), ".cache", "ms-playwright");
  if (existsSync(root)) {
    try {
      for (const dir of readdirSync(root)) {
        if (/^chromium(-\d+)?$/.test(dir)) {
          candidates.push(path.join(root, dir, "chrome-linux64", "chrome"));
          candidates.push(path.join(root, dir, "chrome-linux", "chrome"));
        }
        if (/^chromium_headless_shell(-\d+)?$/.test(dir)) {
          candidates.push(
            path.join(root, dir, "chrome-headless-shell-linux64", "chrome-headless-shell")
          );
        }
      }
    } catch {
      /* ignore */
    }
  }
  return candidates.find((c) => existsSync(c)) ?? null;
}

/* ---------------- main ---------------- */

async function main() {
  const [, , payloadPath, outDir] = process.argv;
  if (!payloadPath || !outDir) {
    console.error("usage: bun scripts/pdf-worker.ts <payload.json> <outDir>");
    exit(2);
  }

  const payload: Payload = JSON.parse(readFileSync(payloadPath, "utf8"));
  const ids =
    payload.templates === "all"
      ? TEMPLATES.map((t) => t.id)
      : TEMPLATES.map((t) => t.id).filter((id) => payload.templates.includes(id));
  if (ids.length === 0) throw new Error("no-valid-template");

  const executablePath = findChromium();
  if (!executablePath) throw new Error("chromium-not-found");

  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--font-render-hinting=none",
    ],
  });

  const manifest: { templateId: string; fileName: string; file: string }[] = [];
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    let i = 0;
    for (const id of ids) {
      i += 1;
      const meta = getTemplate(id);
      const { html } = renderTemplateHTML({
        data: payload.data,
        lang: payload.lang,
        templateId: id,
        accent: payload.accent,
        showPhoto: payload.showPhoto,
        font: payload.font,
      });
      await page.setContent(html, { waitUntil: "load", timeout: 60_000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(100);
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: false,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
      });
      const file = `${String(i).padStart(2, "0")}.pdf`;
      const fileName = `${exportBaseName(payload.data, payload.lang)} - ${meta.name.en} [${meta.ats}% ATS].pdf`;
      writeFileSync(path.join(outDir, file), Buffer.from(pdf));
      manifest.push({ templateId: id, fileName, file });
    }
    await context.close();
  } finally {
    await browser.close().catch(() => {});
  }

  writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
}

main()
  .then(() => exit(0))
  .catch((err) => {
    console.error("PDF-WORKER-ERROR:", err?.message ?? err);
    exit(1);
  });
