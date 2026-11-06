"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useCVStore, completeness } from "@/lib/cv/store";
import { dict } from "@/lib/cv/i18n";
import { PersonalSection } from "@/components/cv/editor/personal";
import { ExperienceSection, EducationSection, SkillsSection, LanguagesSection, CertificationsSection, ProjectsSection, CustomSectionsEditor } from "@/components/cv/editor/sections";
import { DesignTab } from "@/components/cv/design-tab";
import { PreviewTab } from "@/components/cv/preview-tab";
import { ImportTab } from "@/components/cv/import-tab";
import { CvSheet, PrintPortal } from "@/components/cv/cv-sheet";
import { PwaRegister, InstallButton, OfflineBadge } from "@/components/cv/pwa";
import { Tabs, TabsContent, TabsList, TabsTrigger, Button, Progress, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui";
import { FileText, Palette, Eye, FileUp, FileCheck2, Sparkles, Trash2, ScrollText } from "lucide-react";
import type { Lang } from "@/lib/cv/types";

const emptySubscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

export default function Home() {
  const uiLang = useCVStore((s) => s.uiLang);
  const cvLang = useCVStore((s) => s.cvLang);
  const setUiLang = useCVStore((s) => s.setUiLang);
  const setCvLang = useCVStore((s) => s.setCvLang);
  const data = useCVStore((s) => s.data);
  const loadSample = useCVStore((s) => s.loadSample);
  const clearAll = useCVStore((s) => s.clearAll);
  const mounted = useMounted();
  const lang: Lang = uiLang;
  const pct = completeness(data);

  useEffect(() => {
    document.documentElement.lang = uiLang;
    document.documentElement.dir = uiLang === "ar" ? "rtl" : "ltr";
  }, [uiLang]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-full border-4 border-amber-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div id="root-app" className="min-h-screen flex flex-col bg-gradient-to-b from-stone-50 to-stone-100 dark:from-background dark:to-background">
      <PwaRegister />
      <PrintPortal />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-white/85 dark:bg-card/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 py-2.5 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-stone-900 to-stone-700 text-amber-400 shadow">
              <ScrollText className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <div className="font-extrabold text-[15px]">{dict.appName[lang]}</div>
              <div className="text-[11px] text-muted-foreground hidden sm:block">{dict.appTagline[lang]}</div>
            </div>
          </div>

          <div className="flex-1" />

          {/* CV language */}
          <div className="flex items-center gap-1 rounded-lg border p-0.5 bg-muted/50">
            <span className="px-1.5 text-[10px] font-bold text-muted-foreground hidden md:block">{dict.cvLanguage[lang]}</span>
            {(["ar", "en"] as const).map((l) => (
              <button key={`cv-${l}`} onClick={() => setCvLang(l)}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${cvLang === l ? "bg-stone-900 text-amber-400" : "hover:bg-accent"}`}>
                {l === "ar" ? "عربي" : "EN"}
              </button>
            ))}
          </div>

          {/* UI language */}
          <div className="flex items-center gap-1 rounded-lg border p-0.5 bg-muted/50">
            {(["ar", "en"] as const).map((l) => (
              <button key={`ui-${l}`} onClick={() => setUiLang(l)}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${uiLang === l ? "bg-amber-600 text-white" : "hover:bg-accent"}`}>
                {l === "ar" ? "العربية" : "English"}
              </button>
            ))}
          </div>

          <InstallButton lang={lang} />
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 sm:px-4 py-4">
        <Tabs defaultValue="data" dir={lang === "ar" ? "rtl" : "ltr"}>
          <TabsList className="w-full justify-start overflow-x-auto h-auto flex-nowrap gap-1 bg-card border mb-4">
            <TabsTrigger value="data" className="gap-1.5 text-sm"><FileText className="h-4 w-4" /><span className="hidden xs:inline">{dict.tabEdit[lang]}</span></TabsTrigger>
            <TabsTrigger value="design" className="gap-1.5 text-sm"><Palette className="h-4 w-4" />{dict.tabDesign[lang]}</TabsTrigger>
            <TabsTrigger value="preview" className="gap-1.5 text-sm"><Eye className="h-4 w-4" />{dict.tabPreview[lang]}</TabsTrigger>
            <TabsTrigger value="import" className="gap-1.5 text-sm"><FileUp className="h-4 w-4" />{dict.tabImport[lang]}</TabsTrigger>
          </TabsList>

          {/* ---- DATA ---- */}
          <TabsContent value="data" className="mt-0">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px] items-start">
              <div className="space-y-4 min-w-0">
                {/* quick actions */}
                <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
                  <div className="flex-1 min-w-[180px]">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold">{dict.completion[lang]}</span>
                      <span className="tabular-nums text-muted-foreground">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={loadSample}>
                    <Sparkles className="h-4 w-4" />{dict.sampleData[lang]}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />{dict.clearAll[lang]}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent dir={lang === "ar" ? "rtl" : "ltr"}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{dict.clearAll[lang]}</AlertDialogTitle>
                        <AlertDialogDescription>{dict.confirmClear[lang]}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{lang === "ar" ? "إلغاء" : "Cancel"}</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={clearAll}>{dict.delete[lang]}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <PersonalSection lang={lang} />
                <ExperienceSection lang={lang} />
                <EducationSection lang={lang} />
                <SkillsSection lang={lang} />
                <LanguagesSection lang={lang} />
                <CertificationsSection lang={lang} />
                <ProjectsSection lang={lang} />
                <CustomSectionsEditor lang={lang} />
              </div>

              {/* live preview rail */}
              <aside className="hidden lg:block sticky top-[64px]">
                <div className="rounded-2xl border bg-card p-3">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                      <FileCheck2 className="h-3.5 w-3.5" />{dict.tabPreview[lang]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{dict.savedTo[lang]}</span>
                  </div>
                  <div className="max-h-[calc(100vh-160px)] overflow-y-auto rounded-lg bg-muted/50 p-3 cv-scroll">
                    <CvSheet zoom={0.44} />
                  </div>
                </div>
              </aside>
            </div>
          </TabsContent>

          {/* ---- DESIGN ---- */}
          <TabsContent value="design" className="mt-0">
            <DesignTab lang={lang} />
          </TabsContent>

          {/* ---- PREVIEW ---- */}
          <TabsContent value="preview" className="mt-0">
            <PreviewTab lang={lang} />
          </TabsContent>

          {/* ---- IMPORT ---- */}
          <TabsContent value="import" className="mt-0">
            <ImportTab lang={lang} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-white/80 dark:bg-card/80">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {dict.savedTo[lang]} · {dict.footerNote[lang]}
          </span>
          <OfflineBadge lang={lang} />
        </div>
      </footer>
    </div>
  );
}
