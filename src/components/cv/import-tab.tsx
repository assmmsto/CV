"use client";

import { useCVStore } from "@/lib/cv/store";
import { dict } from "@/lib/cv/i18n";
import { extractAnyText, parseCVText, ParseResult } from "@/lib/cv/parse";
import { Card, CardContent, CardHeader, CardTitle, Button, Textarea, Badge, Separator } from "@/components/ui";
import { FileUp, FileText, CheckCircle2, ClipboardPaste, Download, Upload, RotateCcw, AlertTriangle } from "lucide-react";
import { useRef, useState, DragEvent } from "react";
import { toast } from "@/hooks/use-toast";
import type { Lang, CVData } from "@/lib/cv/types";

export function ImportTab({ lang }: { lang: Lang }) {
  const applyImported = useCVStore((s) => s.applyImported);
  const importState = useCVStore((s) => s.importState);
  const setUiTab = useCVStore((s) => s.setUiTab);
  const data = useCVStore((s) => s.data);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [rawText, setRawText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [pasted, setPasted] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const jsonRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File | undefined | null) => {
    if (!f) return;
    setBusy(true);
    setResult(null);
    try {
      const text = await extractAnyText(f);
      // scanned/image-only files yield (almost) no text — fail loudly, not silently
      if (text.replace(/\s/g, "").length < 20) {
        toast({
          title:
            lang === "ar"
              ? "الملف لا يحتوي نصاً قابلاً للاستخراج — غالباً صورة ممسوحة ضوئياً. أدخل بياناتك يدوياً أو احفظ سيرتك كـ PDF نصي أو DOCX."
              : "No selectable text found — the file is probably a scanned image. Enter your data manually or save your CV as text-based PDF/DOCX.",
          variant: "destructive",
        });
        return;
      }
      setRawText(text.slice(0, 20000));
      const parsed = parseCVText(text);
      setResult(parsed);
      toast({ title: dict.importDone[lang] });
    } catch (e) {
      console.error("CV import error:", e);
      const msg = e instanceof Error && e.message === "doc-unsupported"
        ? (lang === "ar" ? "صيغة DOC القديمة غير مدعومة — حوّل الملف إلى PDF أو DOCX." : "Legacy .doc is not supported — save as PDF or DOCX.")
        : (lang === "ar" ? "تعذر قراءة الملف. جرّب PDF أو DOCX أو TXT." : "Could not read the file. Try PDF, DOCX or TXT.");
      toast({ title: msg, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const apply = () => {
    if (!result) return;
    applyImported(result.data as Partial<CVData>);
    toast({ title: dict.applied[lang] });
    setResult(null);
    setRawText("");
    setPasted("");
    // The 10 versions are generated from the imported data — jump to the export hub.
    setUiTab("export");
  };

  const extractPasted = () => {
    if (!pasted.trim()) return;
    const parsed = parseCVText(pasted);
    setResult(parsed);
    setRawText(pasted);
    toast({ title: dict.importDone[lang] });
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ app: "cv-studio", version: 1, data }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `cv-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast({ title: dict.exported[lang] });
  };

  const importJson = (f: File | undefined | null) => {
    if (!f) return;
    f.text().then((t) => {
      try {
        const json = JSON.parse(t);
        const payload = json?.data ?? json;
        if (!payload?.personal) throw new Error("bad");
        importState({ data: { ...payload, experience: payload.experience ?? [], education: payload.education ?? [], skills: payload.skills ?? [], languages: payload.languages ?? [], certifications: payload.certifications ?? [], projects: payload.projects ?? [], customSections: payload.customSections ?? [] } });
        toast({ title: dict.imported[lang] });
        setUiTab("export");
      } catch {
        toast({ title: dict.importFailed[lang], variant: "destructive" });
      }
    });
  };

  const rec = result?.recognized ?? [];

  return (
    <div className="grid gap-5 lg:grid-cols-2 items-start">
      {/* upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><FileUp className="h-4 w-4 text-amber-600" />{dict.importTitle[lang]}</CardTitle>
          <p className="text-sm text-muted-foreground">{dict.importHint[lang]}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            role="button" tabIndex={0}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${dragOver ? "border-amber-500 bg-amber-50" : "border-border hover:border-amber-400 hover:bg-accent/30"}`}
          >
            <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            {busy ? (
              <div className="flex flex-col items-center gap-2 text-sm">
                <div className="h-8 w-8 rounded-full border-3 border-amber-600 border-t-transparent animate-spin" style={{ borderWidth: 3 }} />
                {dict.parsing[lang]}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-9 w-9 text-amber-600" />
                <span className="text-sm font-medium">{dict.chooseFile[lang]}</span>
                <span className="text-xs text-muted-foreground">PDF · DOCX · TXT</span>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-2 text-sm font-semibold"><ClipboardPaste className="h-4 w-4 text-amber-600" />{dict.pasteText[lang]}</div>
            <Textarea value={pasted} onChange={(e) => setPasted(e.target.value)} rows={5} className="text-sm" placeholder={lang === "ar" ? "الصق نص سيرتك الذاتية هنا…" : "Paste your CV text here…"} />
            <Button size="sm" className="mt-2" onClick={extractPasted} disabled={!pasted.trim()}>{dict.extractFromText[lang]}</Button>
          </div>
        </CardContent>
      </Card>

      {/* results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4 text-amber-600" />{dict.importTitle[lang]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result && <p className="text-sm text-muted-foreground text-center py-6">{dict.emptyCv[lang]}</p>}

          {result && (
            <>
              <div className="flex flex-wrap gap-1.5">
                {rec.map((r) => (
                  <Badge key={r} variant="secondary" className="gap-1 bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />{r}
                  </Badge>
                ))}
                {rec.length === 0 && (
                  <div className="flex items-center gap-2 text-amber-700 text-sm">
                    <AlertTriangle className="h-4 w-4" />{dict.importNotFound[lang]}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={apply} className="gap-2"><CheckCircle2 className="h-4 w-4" />{dict.applyData[lang]}</Button>
                <Button variant="outline" onClick={() => setResult(null)}><RotateCcw className="h-4 w-4" /></Button>
              </div>

              <details className="rounded-lg border p-3">
                <summary className="text-sm font-semibold cursor-pointer">{dict.extractedText[lang]}</summary>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">{rawText || "—"}</pre>
              </details>
            </>
          )}

          <Separator />

          {/* backup */}
          <div className="space-y-2">
            <div className="text-sm font-semibold">{dict.exportJson[lang]} / {dict.importJson[lang]}</div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={exportJson} className="gap-2"><Download className="h-4 w-4" />{dict.exportJson[lang]}</Button>
              <label className="inline-flex">
                <input ref={jsonRef} type="file" accept=".json" className="hidden" onChange={(e) => importJson(e.target.files?.[0])} />
                <Button variant="outline" size="sm" className="gap-2" onClick={() => jsonRef.current?.click()}><Upload className="h-4 w-4" />{dict.importJson[lang]}</Button>
              </label>
            </div>
            <p className="text-xs text-muted-foreground">{dict.footerNote[lang]}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
