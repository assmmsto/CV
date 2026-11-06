"use client";

import { useCVStore, completeness } from "@/lib/cv/store";
import { dict } from "@/lib/cv/i18n";
import { CvSheet } from "./cv-sheet";
import { Button, Progress, Badge } from "@/components/ui";
import { Download, ZoomIn, ZoomOut, Printer, ShieldCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { getTemplate } from "./templates/registry";
import { toast } from "@/hooks/use-toast";
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

  /** Real server-side PDF generation; falls back to browser print. */
  const downloadPdf = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          lang: cvLang,
          templates: [templateId],
          accent,
          showPhoto,
          font: fontChoice,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = meta.name.en
        ? `${data.personal.fullName.en || data.personal.fullName.ar || "CV"} - ${meta.name.en}.pdf`
        : "CV.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast({ title: dict.generatedOne[lang] });
    } catch {
      toast({ title: dict.exportFailed[lang], variant: "destructive" });
      // Offline / API unavailable — the print pipeline still produces a clean PDF.
      window.print();
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
