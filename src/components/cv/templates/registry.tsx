"use client";

import { TemplateProps, hasSection } from "./shared";
import { AtsClassic, AtsModern, Executive, MinimalPro } from "./single-col";
import { ModernSidebar, CompactPro } from "./sidebar";
import { Corporate, ElegantDark, TimelinePro, Contemporary } from "./banded";
import type { CVData, Lang } from "@/lib/cv/types";

export interface TemplateMeta {
  id: string;
  name: { ar: string; en: string };
  desc: { ar: string; en: string };
  bestFor: { ar: string; en: string };
  ats: number;
  supportsAccent: boolean;
  component: (props: TemplateProps) => React.ReactNode;
  /** light/dark preview chip colors */
  chip: [string, string];
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "ats-classic",
    name: { ar: "الكلاسيكي المعتمد", en: "ATS Classic" },
    desc: { ar: "عمود واحد بخط سيريف تقليدي — الأكثر توافقاً مع أنظمة الفرز الآلي.", en: "Single column, serif type — the safest choice for ATS parsing." },
    bestFor: { ar: "الشركات الكبرى وأنظمة التوظيف الآلية", en: "Large companies & ATS platforms" },
    ats: 100,
    supportsAccent: false,
    component: AtsClassic,
    chip: ["#f8f6f2", "#1a1a1a"],
  },
  {
    id: "ats-modern",
    name: { ar: "العصري المعتمد", en: "ATS Modern" },
    desc: { ar: "عمود واحد بخط Arial واضح وعناوين مميزة — قراءة مثالية من الروبوتات.", en: "Clean Arial layout with clear section rules — ideal robot parsing." },
    bestFor: { ar: "منصات لينكدإن وبيّانس ومنصات التوظيف", en: "LinkedIn, Bayt & job portals" },
    ats: 100,
    supportsAccent: false,
    component: AtsModern,
    chip: ["#f4f6f8", "#111111"],
  },
  {
    id: "executive",
    name: { ar: "التنفيذي", en: "Executive" },
    desc: { ar: "ترويسة مركزية أنيقة بخط جورجيا — طابع رسمي للمناصب العليا.", en: "Centered Georgia header — a formal tone for senior roles." },
    bestFor: { ar: "المناصب الإدارية والاستشارات", en: "Management & consulting" },
    ats: 95,
    supportsAccent: false,
    component: Executive,
    chip: ["#f7f7f5", "#1a1a1a"],
  },
  {
    id: "minimal-pro",
    name: { ar: "المينيمال", en: "Minimal Pro" },
    desc: { ar: "مساحات بيضاء واسعة وخطوط رفيعة — عصري وهادئ.", en: "Generous whitespace and hairline rules — calm and modern." },
    bestFor: { ar: "الشركات التقنية والوكالات الإبداعية", en: "Tech firms & creative agencies" },
    ats: 95,
    supportsAccent: true,
    component: MinimalPro,
    chip: ["#fafafa", "#212121"],
  },
  {
    id: "modern-sidebar",
    name: { ar: "الشريط الجانبي", en: "Modern Sidebar" },
    desc: { ar: "شريط جانبي داكن للمهارات والتواصل — يحافظ على تدفق نصي واضح.", en: "Dark sidebar for skills & contact — still linear text." },
    bestFor: { ar: "الشركات الناشئة والمحترفين الشباب", en: "Startups & young professionals" },
    ats: 85,
    supportsAccent: true,
    component: ModernSidebar,
    chip: ["#1e293b", "#e2e8f0"],
  },
  {
    id: "corporate",
    name: { ar: "الشركات الرسمي", en: "Corporate" },
    desc: { ar: "ترويسة بلون واحد وحقول منظمة — مظهر مؤسسي متوازن.", en: "Solid header band and tidy blocks — balanced corporate look." },
    bestFor: { ar: "المؤسسات المالية والهندسية", en: "Finance & engineering firms" },
    ats: 90,
    supportsAccent: true,
    component: Corporate,
    chip: ["#0f766e", "#ffffff"],
  },
  {
    id: "timeline",
    name: { ar: "المسار الزمني", en: "Timeline Pro" },
    desc: { ar: "خط زمني بنقاط واضحة يبرز تطور مسارك الوظيفي.", en: "Dotted vertical timeline that highlights career growth." },
    bestFor: { ar: "ذوي المسار الوظيفي المتصاعد", en: "Progressive career paths" },
    ats: 85,
    supportsAccent: true,
    component: TimelinePro,
    chip: ["#f5f7fb", "#24303f"],
  },
  {
    id: "elegant-dark",
    name: { ar: "الداكن الفخم", en: "Elegant Dark" },
    desc: { ar: "ترويسة كحلية داكنة بلمسات ذهبية — فخامة وسمعة راسخة.", en: "Navy header with gold accents — luxury and authority." },
    bestFor: { ar: "الاستشارات والعلامات الفاخرة", en: "Consulting & premium brands" },
    ats: 90,
    supportsAccent: false,
    component: ElegantDark,
    chip: ["#101826", "#c9a227"],
  },
  {
    id: "compact-pro",
    name: { ar: "المدمج المحترف", en: "Compact Pro" },
    desc: { ar: "عمودان مكثفان يختزان أقصى محتوى في أقل مساحة.", en: "Two dense columns packing maximum content per page." },
    bestFor: { ar: "خبرة 10+ سنوات وسِيَر طويلة", en: "10+ years & long careers" },
    ats: 90,
    supportsAccent: true,
    component: CompactPro,
    chip: ["#f4f4f5", "#18181b"],
  },
  {
    id: "contemporary",
    name: { ar: "المعاصر", en: "Contemporary" },
    desc: { ar: "ترويسة متدرجة اللون وشارات مهارات حديثة — جرأة مدروسة.", en: "Gradient header and skill chips — bold but measured." },
    bestFor: { ar: "التسويق والتصميم والإعلام", en: "Marketing, design & media" },
    ats: 85,
    supportsAccent: true,
    component: Contemporary,
    chip: ["#6d28d9", "#ffffff"],
  },
];

export const getTemplate = (id: string): TemplateMeta =>
  TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];

export function TemplateRenderer({ templateId, ...props }: TemplateProps & { templateId: string }) {
  const meta = getTemplate(templateId);
  return <>{meta.component(props)}</>;
}

/** Count of non-empty sections — used for preview hints. */
export function filledSectionsCount(data: CVData): number {
  return (["summary", "experience", "education", "skills", "languages", "certifications", "projects"] as const)
    .filter((k) => hasSection(data, k)).length;
}

export type { Lang };
