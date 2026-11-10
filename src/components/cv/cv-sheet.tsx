"use client";

import { useCVStore } from "@/lib/cv/store";
import { TemplateRenderer } from "./templates/registry";
import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

/** The A4 sheet. Templates own their internal padding. */
export function CvSheet({ zoom = 1 }: { zoom?: number }) {
  const data = useCVStore((s) => s.data);
  const cvLang = useCVStore((s) => s.cvLang);
  const templateId = useCVStore((s) => s.templateId);
  const accent = useCVStore((s) => s.accent);
  const showPhoto = useCVStore((s) => s.showPhoto);
  const fontChoice = useCVStore((s) => s.fontChoice);

  return (
    <div
      className="cv-sheet"
      style={{ zoom }}
      dir={cvLang === "ar" ? "rtl" : "ltr"}
      /* links are real <a> so PDFs get clickable annotations; in the on-screen
         preview, open them in a new tab instead of navigating the app away */
      onClickCapture={(e) => {
        const a = (e.target as HTMLElement).closest?.("a");
        if (!a) return;
        const href = a.getAttribute("href") || "";
        if (!href || href.startsWith("#")) return;
        e.preventDefault();
        e.stopPropagation();
        window.open(href, "_blank", "noopener");
      }}
    >
      <TemplateRenderer
        templateId={templateId}
        data={data}
        lang={cvLang}
        accent={accent}
        showPhoto={showPhoto}
        font={fontChoice}
      />
    </div>
  );
}

/**
 * A hidden body-level copy of the CV used exclusively for printing/exporting PDF.
 * Screen: display none. Print: the app root is hidden and this is shown.
 */
export function PrintPortal() {
  const mounted = useMounted();
  if (!mounted) return null;
  return createPortal(
    <div className="print-root" aria-hidden>
      <CvSheet />
    </div>,
    document.body
  );
}
