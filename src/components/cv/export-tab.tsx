"use client";

import { useState } from "react";
import { TEMPLATES } from "./templates/registry";
import { TemplateRenderer } from "./templates/registry";
import { useCVStore, completeness } from "@/lib/cv/store";
import { dict } from "@/lib/cv/i18n";
import { Button, Badge, Card, CardContent } from "@/components/ui";
import { toast } from "@/hooks/use-toast";
import { FileDown, FolderArchive, ShieldCheck, Sparkles, Loader2, AlertTriangle, FileCheck2 } from "lucide-react";
import type { Lang } from "@/lib/cv/types";

type Body = {
  data: unknown;
  lang: Lang;
  templates: string[] | "all";
  accent: string;
  showPhoto: boolean;
  font: "modern" | "classic" | "mixed";
};

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
      toast({ title: dict.exportFailed[lang], variant: "destructive" });
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
      toast({ title: dict.exportFailed[lang], variant: "destructive" });
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
