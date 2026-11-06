"use client";

import { TEMPLATES, getTemplate } from "./templates/registry";
import { useCVStore } from "@/lib/cv/store";
import { dict } from "@/lib/cv/i18n";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Label, Switch } from "@/components/ui";
import { Check, Palette, Type, ImageIcon } from "lucide-react";
import { CvSheet } from "./cv-sheet";
import { useRef, useState } from "react";
import type { Lang } from "@/lib/cv/types";

const ACCENTS = ["#0f766e", "#7c2d12", "#6d28d9", "#b91c1c", "#0f172a", "#c9a227", "#155e63", "#9d174d"];

export function DesignTab({ lang }: { lang: Lang }) {
  const templateId = useCVStore((s) => s.templateId);
  const setTemplate = useCVStore((s) => s.setTemplate);
  const accent = useCVStore((s) => s.accent);
  const setAccent = useCVStore((s) => s.setAccent);
  const fontChoice = useCVStore((s) => s.fontChoice);
  const setFontChoice = useCVStore((s) => s.setFontChoice);
  const showPhoto = useCVStore((s) => s.showPhoto);
  const setShowPhoto = useCVStore((s) => s.setShowPhoto);
  const data = useCVStore((s) => s.data);
  const updatePersonal = useCVStore((s) => s.updatePersonal);
  const fileRef = useRef<HTMLInputElement>(null);
  const [thumbZoom] = useState(0.16);

  const onPhoto = (f: File | undefined) => {
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => updatePersonal({ photo: String(reader.result) });
    reader.readAsDataURL(f);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px] items-start">
      <div className="grid gap-3 md:grid-cols-2">
        {TEMPLATES.map((t) => {
          const active = t.id === templateId;
          return (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`text-start rounded-2xl border-2 p-3 transition-all hover:shadow-md ${active ? "border-amber-500 bg-amber-50/50 shadow-md" : "border-border bg-card"}`}
              aria-pressed={active}
            >
              {/* live mini preview */}
              <div className="relative h-40 overflow-hidden rounded-lg border bg-white mb-3 flex items-start justify-center">
                <div className="pointer-events-none w-[210mm] origin-top" style={{ zoom: thumbZoom }}>
                  <MiniPreview tid={t.id} />
                </div>
                {active && (
                  <span className="absolute top-2 end-2 h-6 w-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm">{t.name[lang]}</span>
                <Badge variant={t.ats >= 95 ? "default" : "secondary"} className={t.ats >= 95 ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : ""}>
                  ATS {t.ats}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.desc[lang]}</p>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                <span className="font-semibold">{dict.bestFor[lang]}: </span>{t.bestFor[lang]}
              </p>
            </button>
          );
        })}
      </div>

      {/* settings rail */}
      <div className="space-y-4 xl:sticky xl:top-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Palette className="h-4 w-4 text-amber-600" />{dict.accentColor[lang]}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map((c) => (
                <button key={c} onClick={() => setAccent(c)} aria-label={c}
                  className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${accent === c ? "border-foreground ring-2 ring-offset-2 ring-amber-500" : "border-transparent"}`}
                  style={{ background: c }} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{getTemplate(templateId).supportsAccent ? "" : lang === "ar" ? "القالب الحالي لا يستخدم لون التمييز." : "Current template does not use the accent."}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Type className="h-4 w-4 text-amber-600" />{dict.fontStyle[lang]}</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {(["modern", "classic", "mixed"] as const).map((f) => (
              <button key={f} onClick={() => setFontChoice(f)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${fontChoice === f ? "border-amber-500 bg-amber-50" : "hover:bg-accent/50"}`}>
                <span style={{ fontFamily: f === "modern" ? "Arial, sans-serif" : f === "classic" ? "'Times New Roman', serif" : "Georgia, serif" }}>
                  {dict[`font${f === "modern" ? "Modern" : f === "classic" ? "Classic" : "Mixed"}` as keyof typeof dict][lang]}
                </span>
                {fontChoice === f && <Check className="h-4 w-4 text-amber-600" />}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><ImageIcon className="h-4 w-4 text-amber-600" />{dict.photo[lang]}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              {data.personal.photo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={data.personal.photo} alt="" className="h-14 w-14 rounded-full object-cover border" />
              ) : (
                <div className="h-14 w-14 rounded-full border bg-muted flex items-center justify-center text-muted-foreground"><ImageIcon className="h-5 w-5" /></div>
              )}
              <div className="flex flex-col gap-1.5">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
                <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>{dict.uploadPhoto[lang]}</Button>
                {data.personal.photo && (
                  <Button size="sm" variant="ghost" className="text-destructive h-7" onClick={() => updatePersonal({ photo: undefined })}>{dict.removePhoto[lang]}</Button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">{dict.showPhoto[lang]}</Label>
              <Switch checked={showPhoto} onCheckedChange={setShowPhoto} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** Renders the chosen template with live user data for the thumbnail. */
function MiniPreview({ tid }: { tid: string }) {
  const data = useCVStore((s) => s.data);
  const accent = useCVStore((s) => s.accent);
  const showPhoto = useCVStore((s) => s.showPhoto);
  const fontChoice = useCVStore((s) => s.fontChoice);
  const cvLang = useCVStore((s) => s.cvLang);
  const meta = getTemplate(tid);
  const Comp = meta.component;
  return (
    <div style={{ height: "297mm", overflow: "hidden" }} dir={cvLang === "ar" ? "rtl" : "ltr"}>
      <Comp data={data} lang={cvLang} accent={accent} showPhoto={showPhoto} font={fontChoice} />
    </div>
  );
}
