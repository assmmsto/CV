"use client";

import { useEffect, useState } from "react";
import { TEMPLATES } from "./templates/registry";
import { TemplateRenderer } from "./templates/registry";
import { useCVStore, completeness } from "@/lib/cv/store";
import { dict } from "@/lib/cv/i18n";
import { Button, Badge, Card, CardContent } from "@/components/ui";
import { toast } from "@/hooks/use-toast";
import { FileDown, FolderArchive, ShieldCheck, Sparkles, Loader2, AlertTriangle, FileCheck2, Printer } from "lucide-react";
import type { Lang } from "@/lib/cv/types";

type Body = {
  data: unknown;
  lang: Lang;
  templates: string[] | "all";
  accent: string;
  showPhoto: boolean;
  font: "modern" | "classic" | "mixed";
};

/** Map export error codes to clear bilingual messages. */
function exportErrorMessage(code: string, lang: Lang): string {
  switch (code) {
    case "no-runner":
    case "worker-spawn-failed":
      return dict.exportErrorNoRunner[lang];
    case "chromium-not-found":
      return dict.exportErrorChromium[lang];
    case "export-timeout":
      return dict.exportErrorTimeout[lang];
    default:
      return dict.exportErrorGeneric[lang];
  }
}

/* ------------------------------------------------------------------ */
/* Browser print fallback — works with zero server dependencies        */
/* (templates use inline styles, so serialized markup is self-styled)  */
/* ------------------------------------------------------------------ */

const PRINT_CSS = `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #ffffff; }
body {
  font-family: 'Noto Sans Arabic', 'Segoe UI', Tahoma, Arial, sans-serif;
  color: #1a1a1a;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.cv-sheet {
  width: 210mm;
  min-height: 297mm;
  background: #ffffff;
  margin: 0 auto;
  position: relative;
  page-break-after: always;
  break-after: page;
}
.cv-sheet:last-child { page-break-after: auto; break-after: auto; }
.cv-sheet li { break-inside: avoid; page-break-inside: avoid; }
.cv-sheet h1, .cv-sheet h2, .cv-sheet h3 { break-after: avoid; page-break-after: avoid; }
`;

function printViaBrowser(sheetsHTML: string, lang: Lang) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:1px;height:1px;opacity:0;border:0;";
  document.body.appendChild(frame);
  const doc = frame.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(
    `<!doctype html><html lang="${lang}" dir="${dir}"><head><meta charset="utf-8"/>` +
      `<title>CV</title><style>${PRINT_CSS}</style></head><body>${sheetsHTML}</body></html>`
  );
  doc.close();
  const win = frame.contentWindow!;
  setTimeout(() => {
    try {
      win.focus();
      win.print();
    } catch {
      /* ignore */
    }
    setTimeout(() => frame.remove(), 60_000);
  }, 700);
}

async function postExport(body: Body): Promise<{ blob: Blob; disposition: string }> {
  const res = await fetch("/api/export/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let code = "export-failed";
    try {
      const j = await res.json();
      code = j?.error ?? code;
    } catch {
      /* ignore */
    }
    throw new Error(code);
  }
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const blob = await res.blob();
  return { blob, disposition };
}

/** Extract filename* (RFC 5987) or filename from Content-Disposition. */
function fileNameFrom(disposition: string): string | null {
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (utf8) {
    try {
      return decodeURIComponent(utf8[1]);
    } catch {
      /* fallthrough */
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(disposition);
  return plain ? plain[1] : null;
}

function saveBlob(blob: Blob, fallbackName: string, disposition: string) {
  const name = fileNameFrom(disposition) ?? fallbackName;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function ExportTab({ lang }: { lang: Lang }) {
  const data = useCVStore((s) => s.data);
  const cvLang = useCVStore((s) => s.cvLang);
  const setCvLang = useCVStore((s) => s.setCvLang);
  const accent = useCVStore((s) => s.accent);
  const showPhoto = useCVStore((s) => s.showPhoto);
  const fontChoice = useCVStore((s) => s.fontChoice);
  const loadSample = useCVStore((s) => s.loadSample);

  const [busyAll, setBusyAll] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [engineReady, setEngineReady] = useState<boolean | null>(null);
  const [printTarget, setPrintTarget] = useState<{ mode: "one" | "all"; tid?: string } | null>(null);

  /* engine diagnostics (once) — drives the amber banner */
  useEffect(() => {
    let alive = true;
    fetch("/api/export/diag")
      .then((r) => r.json())
      .then((j) => {
        if (alive) setEngineReady(Boolean(j?.engineReady));
      })
      .catch(() => {
        if (alive) setEngineReady(true); // assume ok if diag unreachable
      });
    return () => {
      alive = false;
    };
  }, []);

  /* print fallback: wait for the offscreen render, then print */
  useEffect(() => {
    if (!printTarget) return;
    const t = setTimeout(() => {
      const stage = document.getElementById("cv-print-stage");
      const sheets = stage ? Array.from(stage.querySelectorAll<HTMLElement>(":scope > .cv-print-sheet")) : [];
      const inner = sheets.map((s) => `<div class="cv-sheet">${s.innerHTML}</div>`).join("\n");
      if (inner) {
        printViaBrowser(inner, cvLang);
        toast({ title: dict.exportFallbackTitle[lang], description: dict.exportFallbackHint[lang] });
      } else {
        toast({ title: dict.exportErrorGeneric[lang], variant: "destructive" });
      }
      setPrintTarget(null);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printTarget]);

  const pct = completeness(data);
  const hasData = (data.personal.fullName.ar || data.personal.fullName.en) && pct >= 25;

  const bodyBase: Omit<Body, "templates"> = {
    data,
    lang: cvLang,
    accent,
    showPhoto,
    font: fontChoice,
  };

  const downloadAll = async () => {
    if (busyAll || busyId) return;
    setBusyAll(true);
    toast({ title: dict.generatingAll[lang], description: dict.exportAutoNote[lang] });
    try {
      const { blob, disposition } = await postExport({ ...bodyBase, templates: "all" });
      saveBlob(blob, "cv-10-versions.zip", disposition);
      toast({ title: dict.generatedAll[lang] });
    } catch (e) {
      console.error("export all failed:", e);
      toast({ title: dict.exportFailed[lang], description: exportErrorMessage((e as Error).message, lang), variant: "destructive" });
      setPrintTarget({ mode: "all" }); // browser print fallback
    } finally {
      setBusyAll(false);
    }
  };

  const downloadOne = async (tid: string) => {
    if (busyAll || busyId) return;
    setBusyId(tid);
    try {
      const { blob, disposition } = await postExport({ ...bodyBase, templates: [tid] });
      const meta = TEMPLATES.find((t) => t.id === tid);
      saveBlob(blob, `CV - ${meta?.name.en ?? tid}.pdf`, disposition);
      toast({ title: dict.generatedOne[lang], description: meta?.name[lang] });
    } catch (e) {
      console.error("export one failed:", e);
      toast({ title: dict.exportFailed[lang], description: exportErrorMessage((e as Error).message, lang), variant: "destructive" });
      setPrintTarget({ mode: "one", tid }); // browser print fallback
    } finally {
      setBusyId(null);
    }
  };

  /* ---------- empty state ---------- */
  if (!hasData) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <AlertTriangle className="h-7 w-7" />
          </span>
          <p className="max-w-md text-sm text-muted-foreground leading-relaxed">{dict.exportEmpty[lang]}</p>
          <Button onClick={loadSample} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
            <Sparkles className="h-4 w-4" />
            {dict.exportEmptyCta[lang]}
          </Button>
        </CardContent>
      </Card>
    );
  }

  /* ---------- export hub ---------- */
  return (
    <div className="space-y-4">
      {/* engine warning (only when the native PDF engine is missing) */}
      {engineReady === false && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-[13px] leading-relaxed text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {dict.exportErrorNoRunner[lang]} {dict.exportEngineHint[lang]}
          </span>
        </div>
      )}

      {/* offscreen print stage for the browser fallback */}
      {printTarget && (
        <div id="cv-print-stage" aria-hidden className="hidden">
          {(printTarget.mode === "all" ? TEMPLATES.map((t) => t.id) : [printTarget.tid!]).map((id) => (
            <div key={id} className="cv-print-sheet" dir={cvLang === "ar" ? "rtl" : "ltr"}>
              <TemplateRenderer
                templateId={id}
                data={data}
                lang={cvLang}
                accent={accent}
                showPhoto={showPhoto}
                font={fontChoice}
              />
            </div>
          ))}
        </div>
      )}

      {/* action bar */}
      <div className="rounded-2xl border bg-gradient-to-br from-stone-900 to-stone-800 dark:from-card dark:to-card text-white dark:text-card-foreground p-4 sm:p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-xl">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <FileCheck2 className="h-5 w-5 text-amber-400" />
              {dict.exportTitle[lang]}
              <Badge className="bg-amber-500 text-stone-900 hover:bg-amber-500">10 {dict.versionsCount[lang]}</Badge>
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-stone-300 dark:text-muted-foreground">
              {dict.exportIntro[lang]}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-300 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              {dict.exportAutoNote[lang]}
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-2">
            <button
              onClick={downloadAll}
              disabled={busyAll || busyId !== null}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-extrabold text-stone-900 shadow-lg transition hover:bg-amber-400 disabled:opacity-60"
            >
              {busyAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderArchive className="h-5 w-5" />}
              {busyAll ? dict.generatingAll[lang] : dict.downloadAllZip[lang]}
            </button>
            <button
              onClick={() => setPrintTarget({ mode: "all" })}
              disabled={busyAll || busyId !== null}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2 text-xs font-bold text-white transition hover:bg-white/20 disabled:opacity-60 dark:border-border dark:bg-muted/50 dark:text-card-foreground"
            >
              <Printer className="h-4 w-4" />
              {lang === "ar" ? "طباعة احتياطية (كل النسخ)" : "Print fallback (all versions)"}
            </button>

            {/* CV language */}
            <div className="flex items-center justify-between gap-2 rounded-xl border border-white/20 dark:border-border bg-white/10 dark:bg-muted/50 px-2 py-1.5">
              <span className="text-[11px] font-bold text-stone-200 dark:text-muted-foreground">{dict.cvLanguage[lang]}</span>
              <div className="flex gap-1">
                {(["ar", "en"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setCvLang(l)}
                    className={`rounded-md px-3 py-1 text-xs font-bold transition ${cvLang === l ? "bg-amber-500 text-stone-900" : "text-stone-200 hover:bg-white/10 dark:text-foreground"}`}
                  >
                    {l === "ar" ? "عربي" : "English"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 10 version cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {TEMPLATES.map((t, i) => (
          <div key={t.id} className="rounded-2xl border bg-card overflow-hidden flex flex-col transition-shadow hover:shadow-md">
            <div className="relative h-44 overflow-hidden border-b bg-white flex items-start justify-center">
              <div className="pointer-events-none w-[210mm] origin-top" style={{ zoom: 0.17 }}>
                <div style={{ height: "297mm", overflow: "hidden" }} dir={cvLang === "ar" ? "rtl" : "ltr"}>
                  <TemplateRenderer
                    templateId={t.id}
                    data={data}
                    lang={cvLang}
                    accent={accent}
                    showPhoto={showPhoto}
                    font={fontChoice}
                  />
                </div>
              </div>
              <span className="absolute top-2 start-2 h-6 min-w-6 rounded-full bg-stone-900/80 px-1.5 text-[11px] font-bold text-amber-400 flex items-center justify-center">
                {i + 1}/10
              </span>
              <Badge
                className="absolute top-2 end-2 bg-emerald-600/95 text-white hover:bg-emerald-600"
                title={dict.exportAutoNote[lang]}
              >
                ATS {t.ats}%
              </Badge>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 p-3">
              <div className="font-bold text-sm leading-snug">{t.name[lang]}</div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{t.desc[lang]}</p>
              <p className="text-[11px] text-muted-foreground mt-auto pt-1">
                <span className="font-semibold">{dict.bestFor[lang]}: </span>
                {t.bestFor[lang]}
              </p>
              <Button
                size="sm"
                onClick={() => downloadOne(t.id)}
                disabled={busyAll || busyId !== null}
                className="mt-1.5 w-full gap-2"
              >
                {busyId === t.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {dict.generatingOne[lang]}
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4" />
                    {dict.downloadOne[lang]}
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
