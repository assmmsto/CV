/**
 * GET /api/export/diag — PDF engine diagnostics for the UI.
 *
 * Reports whether a TS runner (bun/tsx) and a Chromium binary are available
 * on the current machine, so the export tab can show precise guidance and
 * fall back to browser printing when the native engine is missing.
 */

import { NextResponse } from "next/server";
import { findChromium, findRunner } from "@/lib/cv/engine-detect";
import { TEMPLATES } from "@/components/cv/templates/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const runner = findRunner();
  const chrome = findChromium();
  return NextResponse.json(
    {
      platform: process.platform,
      templates: TEMPLATES.length,
      runner: { kind: runner.kind, bin: runner.bin, available: runner.available, hint: runner.hint },
      chromium: { found: chrome.found, path: chrome.path, hint: chrome.hint },
      engineReady: runner.available && chrome.found,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
