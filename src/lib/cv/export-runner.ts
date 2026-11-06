/**
 * Export runner — Next-side orchestrator.
 *
 * Next.js forbids importing react-dom/server in route handlers, so the actual
 * rendering happens in a standalone bun worker (scripts/pdf-worker.ts) which
 * reuses the exact same template components. This module spawns the worker,
 * collects the generated files and (for multi-template exports) zips them.
 */

import { spawn } from "child_process";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import os from "os";
import JSZip from "jszip";
import { exportBaseName } from "./export-names";
import { TEMPLATES } from "@/components/cv/templates/registry";
import type { CVData, Lang } from "./types";

const ALL_IDS = TEMPLATES.map((t) => t.id);

export class ExportError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export interface RunOptions {
  data: CVData;
  lang: Lang;
  templates: string[] | "all";
  accent?: string;
  showPhoto?: boolean;
  font?: "modern" | "classic" | "mixed";
}

export interface GeneratedFile {
  templateId: string;
  fileName: string;
  buffer: Buffer;
}

interface ManifestEntry {
  templateId: string;
  fileName: string;
  file: string;
}

const BUN_BIN = process.env.BUN_BIN || "/usr/local/bin/bun";
const WORKER = path.join(process.cwd(), "scripts", "pdf-worker.ts");

/** Run the bun PDF worker and return the generated files in memory. */
export async function runExport(opts: RunOptions): Promise<GeneratedFile[]> {
  const ids = opts.templates === "all" ? ALL_IDS : ALL_IDS.filter((id) => opts.templates.includes(id));
  if (ids.length === 0) throw new ExportError("no-valid-template");

  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "cv-export-"));
  try {
    const payloadPath = path.join(tmpDir, "payload.json");
    await writeFile(payloadPath, JSON.stringify({ ...opts, templates: ids }), "utf8");
    const outDir = path.join(tmpDir, "out");
    await (await import("fs/promises")).mkdir(outDir, { recursive: true });

    await new Promise<void>((resolve, reject) => {
      const child = spawn(BUN_BIN, [WORKER, payloadPath, outDir], {
        cwd: process.cwd(),
        stdio: ["ignore", "ignore", "pipe"],
        env: { ...process.env, NODE_ENV: process.env.NODE_ENV },
      });
      let stderr = "";
      child.stderr?.on("data", (d) => (stderr += String(d)));
      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        reject(new ExportError("export-timeout", "worker exceeded 120s"));
      }, 120_000);
      child.on("error", (err) => {
        clearTimeout(timer);
        reject(new ExportError("worker-spawn-failed", err.message));
      });
      child.on("close", (code) => {
        clearTimeout(timer);
        if (code === 0) resolve();
        else reject(new ExportError("worker-failed", stderr.slice(-500) || `exit ${code}`));
      });
    });

    const manifestRaw = await readFile(path.join(outDir, "manifest.json"), "utf8");
    const manifest: ManifestEntry[] = JSON.parse(manifestRaw);
    const files: GeneratedFile[] = [];
    for (const m of manifest) {
      const p = path.join(outDir, m.file);
      if (!existsSync(p)) continue;
      files.push({ templateId: m.templateId, fileName: m.fileName, buffer: await readFile(p) });
    }
    if (files.length === 0) throw new ExportError("worker-no-output");
    return files;
  } finally {
    rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

/** Bundle generated files into a ZIP. */
export async function filesToZip(files: GeneratedFile[], opts: RunOptions): Promise<Buffer> {
  const zip = new JSZip();
  const base = exportBaseName(opts.data, opts.lang);
  const folder = zip.folder(`${base} - CV ${files.length} Versions`) ?? zip;
  files.forEach((f, i) => folder.file(`${String(i + 1).padStart(2, "0")} - ${f.fileName}`, f.buffer));
  return (await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })) as Buffer;
}
