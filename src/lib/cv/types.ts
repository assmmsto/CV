/**
 * Bilingual CV data model.
 * Every user-facing text field stores BOTH Arabic and English values,
 * so the user enters data once and can render the CV in either language.
 */

export type Lang = "ar" | "en";

/** A single bilingual text value. */
export interface BiText {
  ar: string;
  en: string;
}

export const emptyBi = (): BiText => ({ ar: "", en: "" });

export interface PersonalInfo {
  fullName: BiText;
  jobTitle: BiText;
  email: string;
  phone: string;
  city: BiText;
  country: BiText;
  website: string;
  linkedin: string;
  github: string;
  /** data URL of uploaded photo (optional, not used by ATS templates) */
  photo?: string;
  summary: BiText;
}

export interface ExperienceItem {
  id: string;
  company: BiText;
  position: BiText;
  city: BiText;
  startDate: string; // "MM/YYYY"
  endDate: string; // "MM/YYYY" or "" when current
  current: boolean;
  description: BiText;
}

export interface EducationItem {
  id: string;
  institution: BiText;
  degree: BiText;
  field: BiText;
  startDate: string;
  endDate: string;
  current: boolean;
  grade: BiText;
}

export interface SkillItem {
  id: string;
  name: BiText;
  level: 1 | 2 | 3 | 4 | 5;
}

export type Level = "native" | "fluent" | "advanced" | "intermediate" | "basic";

export interface LanguageItem {
  id: string;
  name: BiText;
  level: Level;
}

export interface CertificationItem {
  id: string;
  name: BiText;
  issuer: BiText;
  date: string;
  url: string;
}

export interface ProjectItem {
  id: string;
  name: BiText;
  description: BiText;
  url: string;
  technologies: BiText;
}

export interface CustomSectionItem {
  id: string;
  title: BiText;
  content: BiText;
}

export interface CVData {
  personal: PersonalInfo;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  certifications: CertificationItem[];
  projects: ProjectItem[];
  customSections: CustomSectionItem[];
}

export interface CVState {
  data: CVData;
  uiLang: Lang;
  cvLang: Lang;
  templateId: string;
  accent: string; // hex accent color for templates that support it
  showPhoto: boolean;
  fontChoice: "modern" | "classic" | "mixed";
}

export const emptyCV = (): CVData => ({
  personal: {
    fullName: emptyBi(),
    jobTitle: emptyBi(),
    email: "",
    phone: "",
    city: emptyBi(),
    country: emptyBi(),
    website: "",
    linkedin: "",
    github: "",
    summary: emptyBi(),
  },
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  projects: [],
  customSections: [],
});

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
