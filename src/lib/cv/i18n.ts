import type { Lang } from "./types";

/** Full bilingual UI dictionary. */
export const dict = {
  appName: { ar: "منشئ السيرة الذاتية", en: "CV Studio" },
  appTagline: {
    ar: "سيرة ذاتية احترافية بلغتين — تُدخلها مرة واحدة",
    en: "Professional bilingual CV — enter data once",
  },
  save: { ar: "حفظ", en: "Save" },
  saved: { ar: "تم الحفظ تلقائياً", en: "Auto-saved" },
  savedTo: { ar: "محفوظ تلقائياً على جهازك", en: "Auto-saved on your device" },
  language: { ar: "اللغة", en: "Language" },
  uiLanguage: { ar: "لغة الواجهة", en: "Interface language" },
  cvLanguage: { ar: "لغة السيرة الذاتية", en: "CV language" },

  // Tabs
  tabEdit: { ar: "البيانات", en: "Data" },
  tabDesign: { ar: "القوالب", en: "Design" },
  tabPreview: { ar: "المعاينة", en: "Preview" },
  tabImport: { ar: "استيراد", en: "Import" },

  // Sections
  secPersonal: { ar: "المعلومات الشخصية", en: "Personal Information" },
  secSummary: { ar: "الملخص المهني", en: "Professional Summary" },
  secExperience: { ar: "الخبرات العملية", en: "Work Experience" },
  secEducation: { ar: "التعليم", en: "Education" },
  secSkills: { ar: "المهارات", en: "Skills" },
  secLanguages: { ar: "اللغات", en: "Languages" },
  secCertifications: { ar: "الشهادات والدورات", en: "Certifications" },
  secProjects: { ar: "المشاريع", en: "Projects" },
  secCustom: { ar: "أقسام إضافية", en: "Custom Sections" },

  // Fields
  fullName: { ar: "الاسم الكامل", en: "Full name" },
  jobTitle: { ar: "المسمى الوظيفي", en: "Job title" },
  email: { ar: "البريد الإلكتروني", en: "Email" },
  phone: { ar: "رقم الهاتف / واتساب", en: "Phone / WhatsApp" },
  city: { ar: "المدينة", en: "City" },
  country: { ar: "الدولة", en: "Country" },
  website: { ar: "الموقع الشخصي / معرض الأعمال", en: "Website / Portfolio" },
  linkedin: { ar: "لينكدإن", en: "LinkedIn" },
  github: { ar: "جيت هاب", en: "GitHub" },
  photo: { ar: "الصورة الشخصية", en: "Photo" },
  uploadPhoto: { ar: "رفع صورة", en: "Upload photo" },
  removePhoto: { ar: "إزالة الصورة", en: "Remove photo" },
  showPhoto: { ar: "إظهار الصورة في القوالب الحديثة", en: "Show photo in modern templates" },
  summaryHint: {
    ar: "3-4 أسطر تختصر خبرتك وأهم إنجازاتك وما تسعى إليه.",
    en: "3-4 lines summarizing your experience, key achievements and goals.",
  },
  company: { ar: "الشركة / جهة العمل", en: "Company / Employer" },
  position: { ar: "المنصب", en: "Position" },
  startDate: { ar: "من", en: "From" },
  endDate: { ar: "إلى", en: "To" },
  currentJob: { ar: "أعمل هنا حالياً", en: "I currently work here" },
  currently: { ar: "حتى الآن", en: "Present" },
  description: { ar: "الوصف والمهام", en: "Description & duties" },
  achievementsHint: {
    ar: "اكتب كل مهمة أو إنجاز في سطر مستقل، ويفضّل مع أرقام (مثال: زدت المبيعات 30%).",
    en: "One duty/achievement per line, ideally with numbers (e.g., increased sales by 30%).",
  },
  institution: { ar: "الجامعة / المعهد", en: "Institution" },
  degree: { ar: "الدرجة العلمية", en: "Degree" },
  field: { ar: "التخصص", en: "Field of study" },
  grade: { ar: "المعدل / التقدير", en: "GPA / Grade" },
  skillName: { ar: "المهارة", en: "Skill" },
  level: { ar: "المستوى", en: "Level" },
  langName: { ar: "اللغة", en: "Language" },
  certName: { ar: "اسم الشهادة", en: "Certificate name" },
  issuer: { ar: "الجهة المانحة", en: "Issuer" },
  date: { ar: "التاريخ", en: "Date" },
  url: { ar: "الرابط (اختياري)", en: "Link (optional)" },
  projectName: { ar: "اسم المشروع", en: "Project name" },
  technologies: { ar: "التقنيات / الأدوات", en: "Technologies / tools" },
  customTitle: { ar: "عنوان القسم", en: "Section title" },
  customContent: { ar: "المحتوى", en: "Content" },

  levels: {
    native: { ar: "لغة أم", en: "Native" },
    fluent: { ar: "طلاقة تامة", en: "Fluent" },
    advanced: { ar: "متقدم", en: "Advanced" },
    intermediate: { ar: "متوسط", en: "Intermediate" },
    basic: { ar: "مبتدئ", en: "Basic" },
  },

  // Actions
  addItem: { ar: "إضافة عنصر", en: "Add item" },
  addExperience: { ar: "إضافة خبرة", en: "Add experience" },
  addEducation: { ar: "إضافة تعليم", en: "Add education" },
  addSkill: { ar: "إضافة مهارة", en: "Add skill" },
  addLanguage: { ar: "إضافة لغة", en: "Add language" },
  addCertification: { ar: "إضافة شهادة", en: "Add certification" },
  addProject: { ar: "إضافة مشروع", en: "Add project" },
  addSection: { ar: "إضافة قسم", en: "Add section" },
  delete: { ar: "حذف", en: "Delete" },
  duplicate: { ar: "تكرار", en: "Duplicate" },
  moveUp: { ar: "تحريك للأعلى", en: "Move up" },
  moveDown: { ar: "تحريك للأسفل", en: "Move down" },
  collapse: { ar: "طي", en: "Collapse" },
  expand: { ar: "توسيع", en: "Expand" },
  clearAll: { ar: "مسح كل البيانات", en: "Clear all data" },
  confirmClear: {
    ar: "هل تريد مسح جميع البيانات؟ لا يمكن التراجع.",
    en: "Delete all data? This cannot be undone.",
  },
  sampleData: { ar: "تعبئة ببيانات تجريبية", en: "Fill with sample data" },

  // Bilingual helpers
  arabicField: { ar: "عربي", en: "Arabic" },
  englishField: { ar: "إنجليزي", en: "English" },
  autoTranslate: { ar: "ترجمة تلقائية", en: "Auto-translate" },
  translating: { ar: "جارٍ الترجمة…", en: "Translating…" },
  translateAll: { ar: "ترجمة كل الحقول الفارغة تلقائياً", en: "Auto-translate all empty fields" },
  translateDone: { ar: "اكتملت الترجمة التلقائية", en: "Auto-translation complete" },
  translateFailed: { ar: "فشلت الترجمة، حاول مجدداً", en: "Translation failed, try again" },

  // Templates
  chooseTemplate: { ar: "اختر القالب", en: "Choose template" },
  atsScore: { ar: "توافق ATS", en: "ATS score" },
  bestFor: { ar: "الأنسب لـ", en: "Best for" },
  accentColor: { ar: "لون التمييز", en: "Accent color" },
  fontStyle: { ar: "نمط الخط", en: "Font style" },
  fontModern: { ar: "حديث (Arial)", en: "Modern (Arial)" },
  fontClassic: { ar: "كلاسيكي (Times)", en: "Classic (Times)" },
  fontMixed: { ar: "مختلط (Georgia)", en: "Mixed (Georgia)" },
  atsPerfect: { ar: "متوافق 100% مع أنظمة التتبع", en: "100% ATS-parseable" },
  useTemplate: { ar: "استخدام", en: "Use" },
  active: { ar: "مستخدَم", en: "Active" },

  // Preview & export
  downloadPdf: { ar: "تنزيل PDF", en: "Download PDF" },
  pdfHint: {
    ar: "في نافذة الطباعة اختر «حفظ كملف PDF» وألغِ خيار الرؤوس والتذييلات.",
    en: "In the print dialog choose 'Save as PDF' and disable headers/footers.",
  },
  zoom: { ar: "تكبير", en: "Zoom" },
  exportJson: { ar: "نسخة احتياطية (JSON)", en: "Backup (JSON)" },
  importJson: { ar: "استعادة نسخة احتياطية", en: "Restore backup" },
  exported: { ar: "تم تنزيل النسخة الاحتياطية", en: "Backup downloaded" },
  imported: { ar: "تمت الاستعادة بنجاح", en: "Backup restored" },
  importFailed: { ar: "الملف غير صالح", en: "Invalid file" },

  // Import CV
  importTitle: { ar: "استيراد سيرة ذاتية جاهزة", en: "Import existing CV" },
  importHint: {
    ar: "ارفع ملف PDF أو DOCX وسنستخرج بياناتك تلقائياً وتعبئة النماذج. راجع البيانات بعد الاستيراد.",
    en: "Upload a PDF or DOCX and we extract your data automatically. Review it afterwards.",
  },
  chooseFile: { ar: "اختر ملفاً أو اسحبه هنا", en: "Choose a file or drag it here" },
  parsing: { ar: "جارٍ تحليل الملف…", en: "Parsing file…" },
  importDone: { ar: "تم الاستخراج — راجع البيانات", en: "Extracted — please review" },
  importNotFound: {
    ar: "لم نتعرف على حقول كثيرة؛ عبّئ النموذج يدوياً أو الصق النص في الملخص.",
    en: "Few fields recognized; fill manually or paste text into the summary.",
  },
  extractedText: { ar: "النص المستخرج (للمراجعة)", en: "Extracted text (for review)" },
  pasteText: { ar: "أو الصق نص سيرتك هنا واستخرج منه", en: "Or paste your CV text and extract from it" },
  extractFromText: { ar: "استخراج من النص", en: "Extract from text" },
  applyData: { ar: "تطبيق على بياناتي", en: "Apply to my data" },
  applied: { ar: "طُبّقت البيانات المستخرجة", en: "Extracted data applied" },

  // PWA
  installApp: { ar: "تثبيت التطبيق", en: "Install app" },
  installed: { ar: "تم تثبيت التطبيق", en: "App installed" },
  offlineReady: { ar: "يعمل بدون إنترنت", en: "Works offline" },

  // Footer
  footerNote: {
    ar: "بياناتك محفوظة على جهازك فقط — لا تُرسل لأي خادم.",
    en: "Your data stays on your device — never sent to any server.",
  },

  // Empty states
  emptyCv: {
    ar: "ابدأ بتعبئة بياناتك أو استورد سيرة جاهزة.",
    en: "Start by filling your data or import an existing CV.",
  },
  completion: { ar: "اكتمال السيرة", en: "CV completeness" },
} as const;

export type DictKey = keyof typeof dict;

export function t(key: DictKey, lang: Lang): string {
  const entry = dict[key] as Record<Lang, string> | undefined;
  if (!entry) return key;
  return entry[lang];
}

/** Section-heading dictionary used inside CV templates. */
export const sectionLabels = {
  summary: { ar: "الملخص المهني", en: "Professional Summary", shortAr: "نبذة", shortEn: "SUMMARY" },
  experience: { ar: "الخبرات العملية", en: "Work Experience", shortAr: "الخبرات", shortEn: "EXPERIENCE" },
  education: { ar: "التعليم", en: "Education", shortAr: "التعليم", shortEn: "EDUCATION" },
  skills: { ar: "المهارات", en: "Skills", shortAr: "المهارات", shortEn: "SKILLS" },
  languages: { ar: "اللغات", en: "Languages", shortAr: "اللغات", shortEn: "LANGUAGES" },
  certifications: { ar: "الشهادات", en: "Certifications", shortAr: "الشهادات", shortEn: "CERTIFICATIONS" },
  projects: { ar: "المشاريع", en: "Projects", shortAr: "المشاريع", shortEn: "PROJECTS" },
  contact: { ar: "التواصل", en: "Contact", shortAr: "التواصل", shortEn: "CONTACT" },
  references: { ar: "المراجع", en: "References", shortAr: "المراجع", shortEn: "REFERENCES" },
} as const;

export type SectionKey = keyof typeof sectionLabels;

export function slabel(key: SectionKey, lang: Lang, short = false): string {
  const s = sectionLabels[key];
  if (short) return lang === "ar" ? s.shortAr : s.shortEn;
  return s[lang];
}

export const levelLabel = (level: string, lang: Lang) => {
  const k = level as keyof typeof dict.levels;
  return dict.levels[k][lang];
};
