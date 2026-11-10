"use client";

/**
 * Fully client-side PDF generation — no server, no Chromium, no Bun.
 * Works offline inside the Android APK WebView and in any desktop/mobile
 * browser (including GitHub Pages hosting).
 *
 * Flow: render the chosen template offscreen at exact A4 width → capture it
 * with html2canvas-pro (understands modern CSS colors) → slice the canvas
 * into A4-sized pages → assemble a real, downloadable PDF with jsPDF.
 */

import { createRoot, Root } from "react-dom/client";
import { TemplateRenderer } from "@/components/cv/templates/registry";
import { normalizeHref } from "@/components/cv/templates/shared";
import { useCVStore } from "./store";
import type { CVData, Lang } from "./types";

/* ---------------- Android bridge (declared once app-wide) ---------------- */

declare global {
  interface Window {
    AndroidBridge?: {
      printHtml: (html: string) => void;
      /** saves base64 payload into the device Downloads folder */
      saveFile?: (name: string, mime: string, base64: string) => void;
    };
  }
}

/* ------------------------------- helpers -------------------------------- */

const A4_W_MM = 210;
const A4_H_MM = 297;

export interface PdfJob {
  templateId: string;
  data: CVData;
  lang: Lang;
  accent: string;
  showPhoto: boolean;
  font: "modern" | "classic" | "mixed";
  /** canvas resolution multiplier — 2 ≈ 192 dpi (crisp print quality) */
  scale?: number;
}

/** Resolve once every <img> inside the sheet has finished decoding. */
function waitForImages(scope: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const imgs = Array.from(scope.querySelectorAll("img"));
    if (!imgs.length) return resolve();
    let left = imgs.length;
    const done = () => {
      if (--left <= 0) resolve();
    };
    for (const img of imgs) {
      if (img.complete) done();
      else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }
    }
    // hard cap — never hang the export on a broken image
    setTimeout(resolve, 3000);
  });
}

const ARABIC_CHAR = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * Safety net for Arabic shaping: html2canvas-pro falls back to glyph-by-glyph
 * drawing whenever a text element has letter-spacing ≠ 0, which renders
 * disconnected (isolated-form) Arabic letters in the PDF. Any element whose
 * own text contains Arabic is forced back to `letter-spacing: normal` before
 * the canvas capture (tracking() in the templates already does this at the
 * source; this guards future templates / inline styles).
 */
function neutralizeArabicLetterSpacing(scope: HTMLElement) {
  const els: Element[] = [scope, ...Array.from(scope.querySelectorAll("*"))];
  for (const el of els) {
    if (!(el instanceof HTMLElement)) continue;
    let ownHasArabic = false;
    for (const n of Array.from(el.childNodes)) {
      if (n.nodeType === Node.TEXT_NODE && ARABIC_CHAR.test(n.textContent ?? "")) {
        ownHasArabic = true;
        break;
      }
    }
    if (!ownHasArabic) continue;
    const ls = getComputedStyle(el).letterSpacing;
    if (ls && ls !== "0px" && ls !== "normal") el.style.letterSpacing = "normal";
  }
}

/**
 * Render one template offscreen at true A4 proportions and return a PDF Blob.
 * Throws on failure so callers can fall back to the print dialog.
 */
export async function generateTemplatePdf(job: PdfJob): Promise<Blob> {
  const { templateId, data, lang, accent, showPhoto, font, scale = 2 } = job;
  if (typeof document === "undefined") throw new Error("client-only");

  const [{ jsPDF }, html2canvasMod] = await Promise.all([
    import("jspdf"),
    import("html2canvas-pro"),
  ]);
  const html2canvas = html2canvasMod.default;

  /* ---- offscreen render stage (exact A4 width, white background) ---- */
  const holder = document.createElement("div");
  holder.setAttribute("aria-hidden", "true");
  holder.style.cssText =
    "position:fixed;top:0;left:-30000px;width:210mm;z-index:-1;pointer-events:none;";
  const sheet = document.createElement("div");
  sheet.style.cssText =
    "width:210mm;background:#ffffff;position:relative;overflow:visible;";
  sheet.dir = lang === "ar" ? "rtl" : "ltr";
  holder.appendChild(sheet);
  document.body.appendChild(holder);

  let root: Root | null = null;
  try {
    root = createRoot(sheet);
    root.render(
      <TemplateRenderer
        templateId={templateId}
        data={data}
        lang={lang}
        accent={accent}
        showPhoto={showPhoto}
        font={font}
      />
    );
    // let React commit + layout settle, then wait for fonts & images
    await new Promise((r) => setTimeout(r, 200));
    try {
      await document.fonts.ready;
    } catch {
      /* older engines */
    }
    await waitForImages(sheet);
    neutralizeArabicLetterSpacing(sheet);

    const canvas = await html2canvas(sheet, {
      scale,
      backgroundColor: "#ffffff",
      logging: false,
      useCORS: true,
    });
    if (!canvas.width || !canvas.height) throw new Error("empty-canvas");

    /* ---- slice geometry: A4 pages over the tall canvas ---- */
    const pxPerMm = canvas.width / A4_W_MM;
    const pageHpx = Math.max(1, Math.round(A4_H_MM * pxPerMm));
    let pageCount = Math.max(1, Math.ceil(canvas.height / pageHpx));
    // drop a trailing page that only holds a rounding sliver of white
    while (
      pageCount > 1 &&
      canvas.height - (pageCount - 1) * pageHpx < pageHpx * 0.02
    ) {
      pageCount--;
    }

    /* ---- clickable links: collect <a href> boxes before slicing ---- */
    const sheetRect = sheet.getBoundingClientRect();
    const cssScale = canvas.width / sheetRect.width; // canvas px per CSS px
    const mmPerCss = A4_W_MM / sheetRect.width; // mm per CSS px
    const cssPageH = pageHpx / cssScale; // page height in CSS px
    type AnchorBox = { url: string; x: number; y: number; w: number; h: number };
    const anchors: AnchorBox[] = [];
    for (const a of Array.from(sheet.querySelectorAll("a[href]"))) {
      const href = normalizeHref(a.getAttribute("href") || "");
      if (!href || href.startsWith("#")) continue;
      const r = a.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) continue;
      anchors.push({
        url: href,
        x: r.left - sheetRect.left,
        y: r.top - sheetRect.top,
        w: r.width,
        h: r.height,
      });
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    for (let i = 0; i < pageCount; i++) {
      const srcY = i * pageHpx;
      const sliceH = Math.min(pageHpx, canvas.height - srcY);
      const page = document.createElement("canvas");
      page.width = canvas.width;
      page.height = pageHpx;
      const ctx = page.getContext("2d");
      if (!ctx) throw new Error("canvas-2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, page.width, page.height);
      ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      const img = page.toDataURL("image/jpeg", 0.92);
      if (i > 0) pdf.addPage();
      pdf.addImage(img, "JPEG", 0, 0, A4_W_MM, A4_H_MM, undefined, "FAST");

      /* add clickable link annotations for anchors intersecting this page */
      const bandTop = i * cssPageH;
      const bandBottom = bandTop + cssPageH;
      for (const a of anchors) {
        const top = Math.max(a.y, bandTop);
        const bottom = Math.min(a.y + a.h, bandBottom);
        if (bottom - top <= 0.5) continue;
        pdf.link(
          a.x * mmPerCss,
          (top - bandTop) * mmPerCss,
          a.w * mmPerCss,
          (bottom - top) * mmPerCss,
          { url: a.url }
        );
      }
    }
    return pdf.output("blob");
  } finally {
    try {
      root?.unmount();
    } catch {
      /* ignore */
    }
    holder.remove();
  }
}

/* --------------------------------- ZIP ---------------------------------- */

export interface PdfEntry {
  name: string;
  blob: Blob;
}

/** Bundle generated PDFs into one archive — every template stays its own file. */
export async function zipPdfBlobs(
  entries: PdfEntry[],
  onProgress?: (pct: number) => void
): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const e of entries) zip.file(e.name, e.blob);
  return zip.generateAsync(
    { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
    (meta) => onProgress?.(Math.round(meta.percent))
  );
}

/* ------------------------------ downloading ------------------------------ */

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("read-failed"));
    fr.onload = () => {
      const s = String(fr.result || "");
      resolve(s.slice(s.indexOf(",") + 1));
    };
    fr.readAsDataURL(blob);
  });
}

/**
 * Save a generated file:
 *  - inside the APK → AndroidBridge.saveFile → device Downloads folder
 *  - in a normal browser → hidden <a download> click
 */
export async function saveBlobEverywhere(
  blob: Blob,
  name: string,
  mime: string
): Promise<"bridge" | "anchor"> {
  if (typeof window !== "undefined" && window.AndroidBridge?.saveFile) {
    const b64 = await blobToBase64(blob);
    window.AndroidBridge.saveFile(name, mime, b64);
    return "bridge";
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 8000);
  return "anchor";
}

/* ------------------------- E2E / diagnostics hook ------------------------ */

if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__cvExportPdf = async (
    templateId: string,
    lang?: Lang
  ): Promise<string> => {
    const s = useCVStore.getState();
    const blob = await generateTemplatePdf({
      templateId,
      data: s.data,
      lang: lang ?? s.cvLang,
      accent: s.accent,
      showPhoto: s.showPhoto,
      font: s.fontChoice,
    });
    return blobToBase64(blob);
  };
}
