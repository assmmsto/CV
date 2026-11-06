/**
 * Cross-platform PDF engine detection (Windows / macOS / Linux).
 *
 * Used by:
 *  - scripts/pdf-worker.ts  (bun / tsx worker) to locate a Chromium binary
 *  - src/lib/cv/export-runner.ts to locate a TS runner (bun or tsx)
 *  - /api/export/diag to report engine status to the UI
 *
 * Detection order for the browser binary:
 *   CHROME_PATH env → PLAYWRIGHT_BROWSERS_PATH env → per-OS playwright cache
 *   → per-OS system Chrome / Edge / Chromium / Brave installs.
 */

import { existsSync, readdirSync } from "fs";
import path from "path";
import os from "os";

/* ------------------------------------------------------------------ */
/* Chromium / Chrome discovery                                         */
/* ------------------------------------------------------------------ */

function playwrightCacheDirs(): string[] {
  const dirs: string[] = [];
  const envPath = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (envPath) dirs.push(path.resolve(envPath));
  const home = os.homedir();
  switch (process.platform) {
    case "win32":
      dirs.push(path.join(home, "AppData", "Local", "ms-playwright"));
      break;
    case "darwin":
      dirs.push(path.join(home, "Library", "Caches", "ms-playwright"));
      break;
    default:
      dirs.push(path.join(home, ".cache", "ms-playwright"));
  }
  return dirs.filter((d) => existsSync(d));
}

function executablesInsideCacheDir(dir: string): string[] {
  const out: string[] = [];
  const isWin = process.platform === "win32";
  const isMac = process.platform === "darwin";
  let subdirs: string[] = [];
  try {
    subdirs = readdirSync(dir).filter((d) => /^chromium|chromium_headless_shell/i.test(d));
  } catch {
    return out;
  }
  for (const sub of subdirs) {
    const base = path.join(dir, sub);
    if (isMac) {
      out.push(path.join(base, "chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium"));
      out.push(path.join(base, "chrome-mac-arm64", "Chromium.app", "Contents", "MacOS", "Chromium"));
      out.push(
        path.join(base, "chrome-headless-shell-mac-arm64", "chrome-headless-shell")
      );
    } else if (isWin) {
      out.push(path.join(base, "chrome-win", "chrome.exe"));
      out.push(path.join(base, "chrome-win64", "chrome.exe"));
      out.push(path.join(base, "chrome-headless-shell-win64", "chrome-headless-shell.exe"));
      out.push(path.join(base, "chrome-headless-shell-win", "chrome-headless-shell.exe"));
    } else {
      out.push(path.join(base, "chrome-linux64", "chrome"));
      out.push(path.join(base, "chrome-linux", "chrome"));
      out.push(path.join(base, "chrome-headless-shell-linux64", "chrome-headless-shell"));
      out.push(path.join(base, "chrome-headless-shell-linux", "chrome-headless-shell"));
    }
  }
  return out;
}

function systemBrowserCandidates(): string[] {
  const out: string[] = [];
  if (process.platform === "win32") {
    const progFiles = [
      process.env["ProgramFiles"] ?? "C:\\Program Files",
      process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)",
      process.env["LocalAppData"] ?? path.join(os.homedir(), "AppData", "Local"),
    ];
    for (const pf of progFiles) {
      out.push(path.join(pf, "Google", "Chrome", "Application", "chrome.exe"));
      out.push(path.join(pf, "Microsoft", "Edge", "Application", "msedge.exe"));
      out.push(path.join(pf, "Chromium", "Application", "chrome.exe"));
      out.push(path.join(pf, "BraveSoftware", "Brave-Browser", "Application", "brave.exe"));
    }
  } else if (process.platform === "darwin") {
    out.push("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");
    out.push("/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge");
    out.push("/Applications/Chromium.app/Contents/MacOS/Chromium");
    out.push("/Applications/Brave Browser.app/Contents/MacOS/Brave Browser");
  } else {
    for (const bin of [
      "/usr/local/bin/chrome",
      "/usr/local/bin/chromium",
      "/usr/local/bin/chromium-browser",
      "/usr/bin/google-chrome-stable",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
      "/usr/bin/microsoft-edge",
      "/usr/bin/microsoft-edge-stable",
      "/usr/bin/brave-browser",
      "/snap/bin/chromium",
      "/opt/google/chrome/chrome",
    ])
      out.push(bin);
  }
  return out;
}

export interface ChromiumReport {
  found: boolean;
  path: string | null;
  checkedDirs: string[];
  hint: string;
}

/** Locate a usable Chromium/Chrome binary. Never throws. */
export function findChromium(): ChromiumReport {
  const checked: string[] = [];
  const candidates: string[] = [];

  if (process.env.CHROME_PATH) candidates.push(path.resolve(process.env.CHROME_PATH));
  for (const dir of playwrightCacheDirs()) {
    checked.push(dir);
    candidates.push(...executablesInsideCacheDir(dir));
  }
  candidates.push(...systemBrowserCandidates());

  for (const c of candidates) {
    if (existsSync(c)) return { found: true, path: c, checkedDirs: checked, hint: "" };
  }

  const hint =
    process.platform === "win32"
      ? "ثبّت متصفح Chrome أو Edge (موجود مسبقاً في ويندوز) أو شغّل: npx playwright-core install chromium"
      : "Run: npx playwright-core install chromium  (or install Google Chrome)";
  return { found: false, path: null, checkedDirs: checked, hint };
}

/* ------------------------------------------------------------------ */
/* TS runner discovery (bun first, then tsx)                           */
/* ------------------------------------------------------------------ */

export interface RunnerInfo {
  kind: "bun" | "tsx" | "none";
  bin: string;
  /** arguments placed before the worker script path */
  argsPrefix: string[];
  /** spawn with shell (needed for .cmd shims on Windows) */
  useShell: boolean;
  /** false → do not even try (nothing installed) */
  available: boolean;
  hint: string;
}

/**
 * Ordered list of TS runners to try. The export runner walks this list:
 * bun (env / PATH) → bun (~/.bun) → local tsx → npx tsx.
 */
export function runnerCandidates(): RunnerInfo[] {
  const isWin = process.platform === "win32";
  const home = os.homedir();
  const hint =
    'ثبّت Bun:  powershell -c "irm bun.sh/install.ps1|iex"   أو استخدم tsx:  npm i -D tsx';

  const list: RunnerInfo[] = [
    { kind: "bun", bin: "bun", argsPrefix: [], useShell: false, available: true, hint },
    { kind: "bun", bin: path.join(home, ".bun", "bin", isWin ? "bun.exe" : "bun"), argsPrefix: [], useShell: false, available: true, hint },
    { kind: "bun", bin: path.join(home, ".bun", "bin", "bun"), argsPrefix: [], useShell: false, available: true, hint },
    { kind: "tsx", bin: path.join("node_modules", ".bin", isWin ? "tsx.cmd" : "tsx"), argsPrefix: [], useShell: isWin, available: true, hint },
    { kind: "tsx", bin: "npx", argsPrefix: ["tsx"], useShell: isWin, available: true, hint },
  ];

  // honor explicit BUN_BIN first
  if (process.env.BUN_BIN) {
    list.unshift({ kind: "bun", bin: path.resolve(process.env.BUN_BIN), argsPrefix: [], useShell: false, available: true, hint });
  }
  return list;
}

/** First usable runner (for diagnostics UI). */
export function findRunner(): RunnerInfo {
  const list = runnerCandidates();
  for (const c of list) {
    const isBare = !c.bin.includes("/") && !c.bin.includes("\\");
    if (isBare || existsSync(c.bin)) return c;
  }
  return { kind: "none", bin: "", argsPrefix: [], useShell: false, available: false, hint: list[0].hint };
}
