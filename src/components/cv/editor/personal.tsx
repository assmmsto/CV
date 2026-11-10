"use client";

import { useCVStore } from "@/lib/cv/store";
import { dict } from "@/lib/cv/i18n";
import { resizeImageFile } from "@/lib/cv/image";
import { BiField, PlainField } from "./fields";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { User, Wand2, Loader2, Camera, Trash2, ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import { BiText, PersonalInfo, Lang } from "@/lib/cv/types";
import { toast } from "@/hooks/use-toast";

interface TranslateAPIResponse {
  ok: boolean;
  translations?: Record<string, string>;
}

/** Bilingual fields of the personal section. */
const PAIRS: Array<{ key: string; label: string }> = [
  { key: "full", label: "fullName" },
  { key: "title", label: "jobTitle" },
  { key: "city", label: "city" },
  { key: "country", label: "country" },
  { key: "summary", label: "summary" },
];

export function PersonalSection({ lang }: { lang: Lang }) {
  const personal = useCVStore((s) => s.data.personal);
  const updatePersonal = useCVStore((s) => s.updatePersonal);
  const setShowPhoto = useCVStore((s) => s.setShowPhoto);
  const [translating, setTranslating] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const photoRef = useRef<HTMLInputElement | null>(null);

  const onPhotoPicked = async (f: File | undefined) => {
    if (!f) return;
    setPhotoBusy(true);
    try {
      const dataUrl = await resizeImageFile(f);
      updatePersonal({ photo: dataUrl });
      setShowPhoto(true); // make the photo actually appear in the CV
    } catch {
      /* keep UI stable */
    } finally {
      setPhotoBusy(false);
    }
  };

  const collect = (from: "ar" | "en", to: "ar" | "en") => {
    const items: { key: string; text: string }[] = [];
    for (const { key, label } of PAIRS) {
      const bi = personal[label as keyof PersonalInfo] as BiText;
      if (!bi[to]?.trim() && bi[from]?.trim()) items.push({ key, text: bi[from] });
    }
    return items;
  };

  const callTranslate = async (items: { key: string; text: string }[], target: "ar" | "en") => {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, target }),
    });
    const json = (await res.json()) as TranslateAPIResponse;
    if (!json.ok || !json.translations) throw new Error("translate");
    return json.translations;
  };

  const autoTranslate = async () => {
    setTranslating(true);
    try {
      // Fill Arabic from English, and English from Arabic
      const toAr = collect("en", "ar");
      const toEn = collect("ar", "en");
      const [trAr, trEn] = await Promise.all([
        toAr.length ? callTranslate(toAr, "ar") : Promise.resolve({}),
        toEn.length ? callTranslate(toEn, "en") : Promise.resolve({}),
      ]);
      const merge = (tr: Record<string, string>, to: "ar" | "en") => {
        const next = { ...personal };
        for (const { key, label } of PAIRS) {
          const bi = next[label as keyof PersonalInfo] as BiText;
          const v = tr[key];
          if (typeof v === "string" && v.trim() && !bi[to]?.trim()) {
            next[label as keyof PersonalInfo] = { ...bi, [to]: v.trim() } as BiText;
          }
        }
        return next;
      };
      let merged = merge(trAr, "ar");
      const nextEn = { ...merged };
      for (const { key, label } of PAIRS) {
        const bi = nextEn[label as keyof PersonalInfo] as BiText;
        const v = trEn[key];
        if (typeof v === "string" && v.trim() && !bi.en?.trim()) {
          nextEn[label as keyof PersonalInfo] = { ...bi, en: v.trim() } as BiText;
        }
      }
      updatePersonal(nextEn);
    } catch {
      // visible feedback instead of a silent dead button (no /api on Pages/APK)
      toast({ title: dict.translateFailed[lang], variant: "destructive" });
    } finally {
      setTranslating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4 text-amber-600" />
          {dict.secPersonal[lang]}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* photo upload — works with camera & gallery on mobile */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-muted/30 p-3">
          {personal.photo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={personal.photo} alt="" className="h-16 w-16 rounded-full border-2 border-amber-500/60 object-cover" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full border bg-card text-muted-foreground">
              <ImageIcon className="h-6 w-6" />
            </span>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-sm font-bold">{dict.photo[lang]}</span>
            <span className="text-[11px] leading-snug text-muted-foreground">{dict.photoHint[lang]}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={photoRef}
              onChange={(e) => {
                onPhotoPicked(e.target.files?.[0]);
                e.currentTarget.value = "";
              }}
            />
            <Button type="button" size="sm" variant="outline" className="gap-1.5" disabled={photoBusy} onClick={() => photoRef.current?.click()}>
              {photoBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              {dict.uploadPhoto[lang]}
            </Button>
            {personal.photo && (
              <Button type="button" size="sm" variant="ghost" className="h-8 gap-1.5 text-destructive" onClick={() => updatePersonal({ photo: undefined })}>
                <Trash2 className="h-4 w-4" />
                {dict.removePhoto[lang]}
              </Button>
            )}
          </div>
        </div>
        <BiField label={dict.fullName[lang]} value={personal.fullName} onChange={(v) => updatePersonal({ fullName: v })} />
        <BiField label={dict.jobTitle[lang]} value={personal.jobTitle} onChange={(v) => updatePersonal({ jobTitle: v })} />
        <div className="grid gap-4 md:grid-cols-2">
          <PlainField label={dict.email[lang]} type="email" value={personal.email} onChange={(v) => updatePersonal({ email: v })} placeholder="name@example.com" />
          <PlainField label={dict.phone[lang]} type="tel" value={personal.phone} onChange={(v) => updatePersonal({ phone: v })} placeholder="+963 9XX XXX XXX" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <BiField label={dict.city[lang]} value={personal.city} onChange={(v) => updatePersonal({ city: v })} compact />
          <BiField label={dict.country[lang]} value={personal.country} onChange={(v) => updatePersonal({ country: v })} compact />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <PlainField label={dict.website[lang]} type="url" value={personal.website} onChange={(v) => updatePersonal({ website: v })} placeholder="https://…" />
          <PlainField label={dict.linkedin[lang]} type="url" value={personal.linkedin} onChange={(v) => updatePersonal({ linkedin: v })} placeholder="linkedin.com/in/…" />
          <PlainField label={dict.github[lang]} type="url" value={personal.github} onChange={(v) => updatePersonal({ github: v })} placeholder="github.com/…" />
        </div>
        <BiField label={dict.secSummary[lang]} value={personal.summary} onChange={(v) => updatePersonal({ summary: v })} textarea rows={5} hint={dict.summaryHint[lang]} />

        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={autoTranslate} disabled={translating} className="gap-2">
            {translating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {translating ? dict.translating[lang] : dict.translateAll[lang]}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
