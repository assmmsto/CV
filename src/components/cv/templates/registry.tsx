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

/**
 * Every template embodies a REAL-WORLD documented standard that companies and
 * job platforms actually accept — see TEMPLATE-RESEARCH.md for the sources
 * (Harvard FAS/HBS, Jobscan Fortune-500 ATS report, Indeed, Europass EU,
 * Google Docs templates, Zety/Novoresume hybrid, resume.io student format).
 * IDs are frozen (stored in users' localStorage + export filenames).
 */
export const TEMPLATES: TemplateMeta[] = [
  {
    id: "ats-classic",
    name: { ar: "هارفارد الرسمي", en: "Harvard Format" },
    desc: {
      ar: "نموذج جامعة هارفارد الرسمي: ترويسة مركزية سيريف، سطر تواصل منقّط، تواريخ لليمين، بلا صور أو ألوان.",
      en: "The official Harvard College/HBS format: centered serif header, dotted contact line, right dates — no color, no photo.",
    },
    bestFor: { ar: "الشركات الكبرى والبنوك والمنح الدراسية", en: "Large firms, banks & academia" },
    ats: 100,
    supportsAccent: false,
    component: AtsClassic,
    chip: ["#f8f6f2", "#1a1a1a"],
  },
  {
    id: "ats-modern",
    name: { ar: "متوافق الفرز الآلي", en: "ATS-Proof (Workday)" },
    desc: {
      ar: "مبني على تقرير أنظمة الفرز لدى شركات Fortune 500 (Workday أولًا): عمود واحد، مهارات نص عادي، صفر رسوم — أعلى قراءة آلية.",
      en: "Built on the Fortune-500 ATS report (Workday-first): one column, plain-text skills, zero graphics — maximum machine parsing.",
    },
    bestFor: { ar: "التقديم عبر منصات التوظيف الآلية (Workday وبيّانس ولينكدإن)", en: "Workday, Bayt & LinkedIn portals" },
    ats: 100,
    supportsAccent: false,
    component: AtsModern,
    chip: ["#f4f6f8", "#111111"],
  },
  {
    id: "corporate",
    name: { ar: "إنديد الرسمي", en: "Indeed Professional" },
    desc: {
      ar: "تنسيق Indeed العالمي: شريط ترويسة ملون يجمع الاسم والتواصل، ثم ترتيب Indeed المعتمد (ملخص ← خبرة ← مهارات ← تعليم).",
      en: "Indeed's global format: colored header band with full contact, then Indeed's trusted order (summary → experience → skills → education).",
    },
    bestFor: { ar: "التقديم عبر إنديد والمؤسسات المالية والهندسية", en: "Indeed applications & finance/engineering" },
    ats: 95,
    supportsAccent: true,
    component: Corporate,
    chip: ["#1c6dbe", "#ffffff"],
  },
  {
    id: "minimal-pro",
    name: { ar: "جوجل البسيط", en: "Google Simple" },
    desc: {
      ar: "أسلوب قوالب Google Docs الرسمية: بساطة قصوى، عناوين رمادية هادئة، مساحات بيضاء واسعة — المفضل في الشركات التقنية.",
      en: "Modeled on official Google Docs templates: maximal simplicity, calm gray headings, generous whitespace — tech-firm favorite.",
    },
    bestFor: { ar: "الشركات التقنية والعمل عن بُعد", en: "Tech firms & remote roles" },
    ats: 95,
    supportsAccent: true,
    component: MinimalPro,
    chip: ["#fafafa", "#333333"],
  },
  {
    id: "modern-sidebar",
    name: { ar: "الشريط الحديث", en: "Modern Sidebar" },
    desc: {
      ar: "النمط الهجين الشائع على Zety وNovoresume: شريط جانبي داكن للصورة والتواصل والمهارات، وعمود رئيسي للخبرة والتعليم.",
      en: "The Zety/Novoresume hybrid: dark sidebar for photo, contact and skills; main column for experience and education.",
    },
    bestFor: { ar: "الشركات الناشئة والمحترفين الشباب", en: "Startups & young professionals" },
    ats: 85,
    supportsAccent: true,
    component: ModernSidebar,
    chip: ["#1e293b", "#e2e8f0"],
  },
  {
    id: "timeline",
    name: { ar: "المسار المهني", en: "Career Timeline" },
    desc: {
      ar: "نمط التدرج الوظيفي (Combination): خط زمني بنقاط يبرز ترقّي المناصب والإنجازات المقيسة بالأرقام.",
      en: "Combination/progression style: a dotted vertical timeline that highlights promotions and quantified achievements.",
    },
    bestFor: { ar: "ذوي المسار الوظيفي المتصاعد والترقيات", en: "Progressive careers & promotions" },
    ats: 85,
    supportsAccent: true,
    component: TimelinePro,
    chip: ["#f5f7fb", "#24303f"],
  },
  {
    id: "elegant-dark",
    name: { ar: "يوروباس المعتمد", en: "Europass Standard" },
    desc: {
      ar: "نموذج الاتحاد الأوروبي الرسمي Europass: ترويسة شبكية، أشرطة عناوين كحلية، جدول لغات بمرجعية CEFR، وصورة مربعة.",
      en: "The official EU Europass format: grid header, navy title bars, CEFR language table and a square photo box.",
    },
    bestFor: { ar: "المنح الأوروبية والوظائف الدولية والمنظمات", en: "EU scholarships, intl. jobs & NGOs" },
    ats: 90,
    supportsAccent: false,
    component: ElegantDark,
    chip: ["#1f4e79", "#ffffff"],
  },
  {
    id: "compact-pro",
    name: { ar: "الخريج الجديد", en: "Fresh Graduate" },
    desc: {
      ar: "نموذج الطالب/الخريج (resume.io وHarvard College): التعليم أولًا، ثم التدريبات، ثم المشاريع والمهارات المجمّعة — صفحة واحدة.",
      en: "Student/graduate format (resume.io & Harvard College): education first, then internships, projects and grouped skills — one page.",
    },
    bestFor: { ar: "الخريجين والطلاب وأصحاب الخبرة القليلة", en: "Graduates, students & juniors" },
    ats: 90,
    supportsAccent: true,
    component: CompactPro,
    chip: ["#f4f9f6", "#14532d"],
  },
  {
    id: "contemporary",
    name: { ar: "الإبداعي", en: "Creative Professional" },
    desc: {
      ar: "النمط الإبداعي المقبول في مجالات التسويق والتصميم والإعلام (بأسلوب Canva): ترويسة متدرجة وشارات مهارات بمستويات.",
      en: "The creative style accepted in marketing, design & media (Canva-like): gradient header and leveled skill chips.",
    },
    bestFor: { ar: "التسويق والتصميم والإعلام وصناعة المحتوى", en: "Marketing, design & media" },
    ats: 85,
    supportsAccent: true,
    component: Contemporary,
    chip: ["#6d28d9", "#ffffff"],
  },
  {
    id: "executive",
    name: { ar: "التنفيذي (HBS)", en: "Executive (HBS)" },
    desc: {
      ar: "دليل خريجي Harvard Business School: ملخص فقري، كتلة كفاءات أساسية بعمودين، سيريف صغير الحروف الكبيرة وتواريخ مائلة.",
      en: "HBS Alumni guide: paragraph summary, two-column Core Competencies block, small-caps serif and italic dates.",
    },
    bestFor: { ar: "المناصب الإدارية العليا والاستشارات", en: "Senior management & consulting" },
    ats: 95,
    supportsAccent: false,
    component: Executive,
    chip: ["#f7f7f5", "#1a1a1a"],
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
