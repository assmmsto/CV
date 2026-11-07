/**
 * POST /api/export/pdf
 *
 * Body: { data: CVData, lang: "ar"|"en", templates: string[] | "all",
 *         accent?: string, showPhoto?: boolean, font?: "modern"|"classic"|"mixed" }
 *
 * - One template  → returns a single PDF (attachment).
 * - Many / "all"  → returns a ZIP with all generated versions.
 *
 * Rendering is done by a standalone bun worker (scripts/pdf-worker.ts) that
 * reuses the app's template components with Chromium + embedded Arabic fonts,
 * producing ATS-parseable PDFs with selectable text.
 */

import { NextRequest, NextResponse } from "next/server";
import { runExport, filesToZip, ExportError } from "@/lib/cv/export-runner";
import { exportBaseName } from "@/lib/cv/export-names";
import { TEMPLATES } from "@/components/cv/templates/registry";
import type { CVData, Lang } from "@/lib/cv/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const VALID_IDS = TEMPLATES.map((t) => t.id);

interface Body {
  data?: CVData;
  lang?: Lang;
  templates?: string[] | "all";
  accent?: string;
  showPhoto?: boolean;
  font?: "modern" | "classic" | "mixed";
}

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return bad("invalid-json");
  }

  const data = body.data;
  if (!data || !data.personal) return bad("missing-cv-data");
  const lang: Lang = body.lang === "en" ? "en" : "ar";

  let ids: string[];
  if (body.templates === "all") {
    ids = VALID_IDS;
  } else if (Array.isArray(body.templates) && body.templates.length > 0) {
    ids = VALID_IDS.filter((id) => body.templates!.includes(id));
  } else {
    return bad("no-templates-selected");
  }
  if (ids.length === 0) return bad("no-valid-template");

  const opts = { ...body, data, lang, templates: ids };

  try {
    const files = await runExport(opts);

    if (files.length === 1) {
      const pdf = files[0];
      return new NextResponse(new Uint8Array(pdf.buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="cv.pdf"; filename*=UTF-8''${encodeURIComponent(pdf.fileName)}`,
          "Cache-Control": "no-store",
        },
      });
    }

    const zip = await filesToZip(files, opts);
    const zipName = `${exportBaseName(data, lang)} - CV ${files.length} Versions.zip`;
    return new NextResponse(new Uint8Array(zip), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="cv-versions.zip"; filename*=UTF-8''${encodeURIComponent(zipName)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof ExportError) {
      const status = err.code === "chromium-not-found" || err.code === "worker-spawn-failed" ? 503 : 500;
      console.error("[export] failed:", err.code, err.message);
      return NextResponse.json({ error: err.code, message: err.message }, { status });
    }
    const msg = err instanceof Error ? err.message : "export-failed";
    console.error("[export] failed:", msg);
    return NextResponse.json({ error: "export-failed", message: msg }, { status: 500 });
  }
}
