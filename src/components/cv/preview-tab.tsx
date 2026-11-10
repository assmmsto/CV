"use client";

import { useCVStore, completeness } from "@/lib/cv/store";
import { dict } from "@/lib/cv/i18n";
import { CvSheet } from "./cv-sheet";
import { Button, Progress, Badge } from "@/components/ui";
import { Download, ZoomIn, ZoomOut, Printer, ShieldCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { getTemplate } from "./templates/registry";
import { toast } from "@/hooks/use-toast";
import {
  generateTemplatePdf,
  saveBlobEverywhere,
} from "@/lib/cv/client-pdf";
import { exportBaseName, safeFileName } from "@/lib/cv/export-names";
import type { Lang } from "@/lib/cv/types";

export function PreviewTab({ lang }: { lang: Lang }) {
  const [zoom, setZoom] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 640 ? 0.45 : 0.85
  );
  const [busy, setBusy] = useState(false);
  const data = useCVStore((s) => s.data);
  const templateId = useCVStore((s) => s.templateId);
  const cvLang = useCVStore((s) => s.cvLang);
  const setCvLang = useCVStore((s) => s.setCvLang);
  const accent = useCVStore((s) => s.accent);
  const showPhoto = useCVStore((s) => s.showPhoto);
  const fontChoice = useCVStore((s) => s.fontChoice);
  const pct = completeness(data);
  const meta = getTemplate(templateId);

  /** 100% client-side PDF — instant download, works offline (Pages & APK). */
  const downloadPdf = async () => {
    if (busy) return;
    setBusy(true);
    try {
      let blob: Blob;
      try {
        blob = await generateTemplatePdf({
          templateId,
          data,
          lang: cvLang,
          accent,
          showPhoto,
          font: fontChoice,
        });
      } catch {
        // one automatic retry at lower resolution — never a print window
        blob = await generateTemplatePdf({
          templateId,
          data,
          lang: cvLang,
          accent,
          showPhoto,
          font: fontChoice,
          scale: 1,
        });
      }
      const base = exportBaseName(data, cvLang);
      const name = `${base}-CV-${safeFileName(meta.name.en || templateId)}.pdf`;
      const via = await saveBlobEverywhere(blob, name, "application/pdf");
      if (via === "bridge") toast({ title: dict.savedApk[lang] });
      toast({ title: dict.generatedOne[lang], description: meta.name[lang] });
    } catch (e) {
      console.error("preview client pdf failed:", e);
      toast({ title: dict.exportFailed[lang], variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-3 justify-between sticky top-0 z-20 bg-background/90 backdrop-blur rounded-xl border p-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))} aria-label={dict.zoom[lang]}><ZoomOut className="h-4 w-4" /></Button>
          <span className="text-sm tabular-nums w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))} aria-label={dict.zoom[lang]}><ZoomIn className="h-4 w-4" /></Button>
        </div>

        <div className="flex items-center gap-1 rounded-lg border p-1">
          {(["ar", "en"] as const).map((l) => (
            <button key={l} onClick={() => setCvLang(l)}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${cvLang === l ? "bg-amber-500 text-white" : "hover:bg-accent"}`}>
              {l === "ar" ? "عربي" : "English"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="hidden sm:inline-flex">{meta.name[lang]} · ATS {meta.ats}%</Badge>
          <Button onClick={downloadPdf} disabled={busy} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {busy ? dict.generatingOne[lang] : dict.downloadPdf[lang]}
          </Button>
        </div>
      </div>

      {/* completeness */}
      <div className="flex items-center gap-3 rounded-xl border p-3">
        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium">{dict.completion[lang]}</span>
            <span className="tabular-nums text-muted-foreground">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
        <Button variant="outline" size="sm" onClick={downloadPdf} disabled={busy} className="gap-1.5 hidden sm:inline-flex">
          <Download className="h-3.5 w-3.5" />PDF
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 hidden md:inline-flex" aria-label={lang === "ar" ? "طباعة" : "Print"}>
          <Printer className="h-3.5 w-3.5" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Download className="h-3 w-3" />{dict.pdfHint[lang]}
      </p>

      {/* sheet */}
      <div className="cv-preview-stage rounded-xl border bg-muted/40 p-4 sm:p-6 overflow-auto">
        <CvSheet zoom={zoom} />
      </div>
    </div>
  );
}
