/**
 * Filename helpers for CV exports (no react-dom dependency — safe to import
 * from both the Next route bundle and the standalone bun PDF worker).
 */

import { pick } from "@/components/cv/templates/shared";
import type { CVData, Lang } from "./types";

export function safeFileName(s: string): string {
  return (
    s
      .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "CV"
  );
}

export function exportBaseName(data: CVData, lang: Lang): string {
  const name = pick(data.personal.fullName, lang) || pick(data.personal.fullName, "en") || "CV";
  return safeFileName(name);
}
