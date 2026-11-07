/**
 * Server-side HTML builder for professional PDF CV export.
 *
 * Renders one of the 10 CV templates to a standalone, self-contained HTML
 * document (Arabic fonts embedded as base64 woff2) that Chromium converts to
 * a real, ATS-parseable PDF with selectable text and perfect RTL shaping.
 */

import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { readFileSync } from "fs";
import path from "path";
import { TemplateRenderer, getTemplate } from "@/components/cv/templates/registry";
import { pick } from "@/components/cv/templates/shared";
import { safeFileName, exportBaseName } from "./export-names";
import type { CVData, Lang } from "./types";

/* ------------------------------------------------------------------ */
/* Embedded Arabic fonts (fontsource woff2, arabic subset)             */
/* ------------------------------------------------------------------ */

const FONTS_DIR = path.join(process.cwd(), "node_modules", "@fontsource");

const ARABIC_RANGE =
  "U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, " +
  "U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, " +
  "U+FE70-FE74, U+FE76-FEFC";

type Face = { family: string; weight: number; file: string };

const FACES: Face[] = [
  ...[400, 600, 700, 800].map((w) => ({
    family: "Noto Sans Arabic",
    weight: w,
    file: `noto-sans-arabic/files/noto-sans-arabic-arabic-${w}-normal.woff2`,
  })),
  ...[400, 600, 700].map((w) => ({
    family: "Noto Naskh Arabic",
    weight: w,
    file: `noto-naskh-arabic/files/noto-naskh-arabic-arabic-${w}-normal.woff2`,
  })),
];

function fontFaceCSS(): string {
  const rules: string[] = [];
  for (const f of FACES) {
    try {
      const buf = readFileSync(path.join(FONTS_DIR, f.file));
      const b64 = buf.toString("base64");
      rules.push(
        `@font-face{font-family:'${f.family}';font-style:normal;font-weight:${f.weight};` +
          `src:url(data:font/woff2;base64,${b64}) format('woff2');` +
          `unicode-range:${ARABIC_RANGE};}`
      );
    } catch {
      // Font file missing — the generic fallback still renders text.
    }
  }
  return rules.join("\n");
}

/* ------------------------------------------------------------------ */
/* Standalone document                                                 */
/* ------------------------------------------------------------------ */

export interface ExportOptions {
  data: CVData;
  lang: Lang;
  templateId: string;
  accent?: string;
  showPhoto?: boolean;
  font?: "modern" | "classic" | "mixed";
}

/** Build the complete standalone HTML for one template. */
export function renderTemplateHTML(opts: ExportOptions): { html: string; fileName: string } {
  const { data, lang, templateId } = opts;
  const meta = getTemplate(templateId);
  const accent = opts.accent || "#0f172a";
  const showPhoto = opts.showPhoto ?? false;
  const font = opts.font || "modern";

  const markup = renderToStaticMarkup(
    createElement(TemplateRenderer, {
      templateId,
      data,
      lang,
      accent,
      showPhoto,
      font,
    })
  );

  const dir = lang === "ar" ? "rtl" : "ltr";
  const personName = pick(data.personal.fullName, lang) || (lang === "ar" ? "سيرة ذاتية" : "Curriculum Vitae");
  const title = `${personName} — ${meta.name[lang]}`;
  const fileName = `${exportBaseName(data, lang)} - ${safeFileName(meta.name.en)} [${meta.ats}% ATS].pdf`;

  const html = `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8"/>
<title>${escapeHTML(title)}</title>
<meta name="author" content="${escapeHTML(personName)}"/>
<meta name="description" content="${escapeHTML(`${personName} — ${meta.name.en} (ATS ${meta.ats}%)`)}"/>
<meta name="generator" content="CV Studio PWA"/>
<style>
${fontFaceCSS()}
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #ffffff; }
body {
  font-family: 'Noto Sans Arabic', Arial, Helvetica, sans-serif;
  color: #1a1a1a;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  text-rendering: optimizeLegibility;
}
.cv-sheet {
  width: 210mm;
  min-height: 297mm;
  background: #ffffff;
  color: #1a1a1a;
  margin: 0 auto;
  position: relative;
  box-shadow: none;
}
.cv-sheet img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
/* avoid awkward splits on multi-page CVs */
.cv-sheet li { break-inside: avoid; page-break-inside: avoid; }
.cv-sheet h1, .cv-sheet h2, .cv-sheet h3 { break-after: avoid; page-break-after: avoid; }
</style>
</head>
<body>
<div class="cv-sheet" dir="${dir}">${markup}</div>
</body>
</html>`;

  return { html, fileName };
}

function escapeHTML(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
