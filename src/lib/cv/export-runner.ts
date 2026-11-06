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
import { runnerCandidates, type RunnerInfo } from "./engine-detect";
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

const WORKER_TIMEOUT_MS = 180_000;

/**
 * The standalone Next server (`.next/standalone/server.js`) chdirs into the
 * standalone folder, where the traced `node_modules` lacks `react-dom/server.js`
 * (the PDF worker imports it but is not part of the server bundle graph).
 * Therefore always spawn the worker from the REAL project root — detected by
 * walking up from cwd until a directory has the worker + templates + a full
 * react-dom install.
 */
function findProjectRoot(): string {
  const starts = [process.env.CV_PROJECT_ROOT, process.cwd()].filter(Boolean) as string[];
  let relaxed: string | null = null;
  for (const start of starts) {
    let dir = path.resolve(start);
    for (let i = 0; i < 6; i++) {
      const hasWorker = existsSync(path.join(dir, "scripts", "pdf-worker.ts"));
      const hasSrc = existsSync(path.join(dir, "src", "lib", "cv", "export-html.ts"));
      const hasPkg = existsSync(path.join(dir, "package.json"));
      const hasReactDom = existsSync(path.join(dir, "node_modules", "react-dom", "server.js"));
      if (hasWorker && hasSrc && hasPkg && hasReactDom) return dir;
      if (!relaxed && hasWorker && hasSrc && hasPkg) relaxed = dir;
      const up = path.dirname(dir);
      if (up === dir) break;
      dir = up;
    }
  }
  return relaxed ?? process.cwd();
}

const PROJECT_ROOT = findProjectRoot();
const WORKER = path.join(PROJECT_ROOT, "scripts", "pdf-worker.ts");

/** Spawn the worker once with a given runner. Rejects with .missing=true when the runner binary is not usable. */
function spawnWorkerOnce(
  runner: RunnerInfo,
  payloadPath: string,
  outDir: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const q = (s: string) => (runner.useShell && /\s/.test(s) ? `"${s}"` : s);
    const args = [...runner.argsPrefix, WORKER, payloadPath, outDir].map(q);
    const child = spawn(runner.bin, args, {
      cwd: PROJECT_ROOT,
      shell: runner.useShell,
      stdio: ["ignore", "ignore", "pipe"],
      env: { ...process.env, NODE_ENV: process.env.NODE_ENV },
    });
    let stderr = "";
    const started = Date.now();
    child.stderr?.on("data", (d) => (stderr += String(d)));
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new ExportError("export-timeout", `worker exceeded ${WORKER_TIMEOUT_MS / 1000}s`));
    }, WORKER_TIMEOUT_MS);
    child.on("error", (err) => {
      clearTimeout(timer);
      // ENOENT / bad command → runner missing, try the next candidate.
      (err as Error & { missing?: boolean }).missing = true;
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) return resolve();
      // Fast, silent, non-zero exit → likely a missing shim (Windows .cmd etc.)
      if (!stderr && Date.now() - started < 2000 && (code === 1 || code === 127 || code === 9009)) {
        const e = new Error(`runner exited ${code} immediately`);
        (e as Error & { missing?: boolean }).missing = true;
        return reject(e);
      }
      reject(new ExportError("worker-failed", stderr.slice(-800) || `exit ${code}`));
    });
  });
}

/** Run the PDF worker (bun first, then tsx) and return the generated files. */
export async function runExport(opts: RunOptions): Promise<GeneratedFile[]> {
  const ids = opts.templates === "all" ? ALL_IDS : ALL_IDS.filter((id) => opts.templates.includes(id));
  if (ids.length === 0) throw new ExportError("no-valid-template");

  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "cv-export-"));
  try {
    const payloadPath = path.join(tmpDir, "payload.json");
    await writeFile(payloadPath, JSON.stringify({ ...opts, templates: ids }), "utf8");
    const outDir = path.join(tmpDir, "out");
    await (await import("fs/promises")).mkdir(outDir, { recursive: true });

    const candidates = runnerCandidates();
    let lastRunnerMsg = "";
    let spawned = false;
    for (const runner of candidates) {
      // skip candidates whose binary path does not exist (bare PATH commands always try)
      const isBare = !runner.bin.includes("/") && !runner.bin.includes("\\");
      if (!isBare && !existsSync(runner.bin)) {
        lastRunnerMsg = `${runner.kind}:${runner.bin} not found`;
        continue;
      }
      try {
        await spawnWorkerOnce(runner, payloadPath, outDir);
        spawned = true;
        break;
      } catch (err) {
        if ((err as { missing?: boolean }).missing) {
          lastRunnerMsg = `${runner.kind}:${runner.bin} unusable (${(err as Error).message})`;
          continue;
        }
        throw err;
      }
    }
    if (!spawned) {
      const hint = candidates[0]?.hint ?? "install bun or tsx";
      throw new ExportError(
        "no-runner",
        `لم يتم العثور على محرك تشغيل (Bun/tsx). ${lastRunnerMsg}. الحل: ${hint}`
      );
    }

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
