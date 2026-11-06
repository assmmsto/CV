"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  CVData,
  CVState,
  Lang,
  emptyCV,
  uid,
  ExperienceItem,
  EducationItem,
  SkillItem,
  LanguageItem,
  CertificationItem,
  ProjectItem,
  CustomSectionItem,
} from "./types";
import { sampleCV } from "./sample";

interface Actions {
  setUiLang: (l: Lang) => void;
  setCvLang: (l: Lang) => void;
  setTemplate: (id: string) => void;
  setAccent: (hex: string) => void;
  setShowPhoto: (v: boolean) => void;
  setFontChoice: (v: "modern" | "classic" | "mixed") => void;

  updatePersonal: (patch: Partial<CVData["personal"]>) => void;

  addExperience: () => void;
  updateExperience: (id: string, patch: Partial<ExperienceItem>) => void;
  removeExperience: (id: string) => void;
  duplicateExperience: (id: string) => void;
  moveExperience: (id: string, dir: -1 | 1) => void;

  addEducation: () => void;
  updateEducation: (id: string, patch: Partial<EducationItem>) => void;
  removeEducation: (id: string) => void;
  duplicateEducation: (id: string) => void;
  moveEducation: (id: string, dir: -1 | 1) => void;

  addSkill: () => void;
  updateSkill: (id: string, patch: Partial<SkillItem>) => void;
  removeSkill: (id: string) => void;

  addLanguage: () => void;
  updateLanguage: (id: string, patch: Partial<LanguageItem>) => void;
  removeLanguage: (id: string) => void;

  addCertification: () => void;
  updateCertification: (id: string, patch: Partial<CertificationItem>) => void;
  removeCertification: (id: string) => void;

  addProject: () => void;
  updateProject: (id: string, patch: Partial<ProjectItem>) => void;
  removeProject: (id: string) => void;

  addCustomSection: () => void;
  updateCustomSection: (id: string, patch: Partial<CustomSectionItem>) => void;
  removeCustomSection: (id: string) => void;

  applyImported: (data: Partial<CVData>) => void;
  loadSample: () => void;
  clearAll: () => void;
  importState: (state: Partial<CVState>) => void;
}

export type CVStore = CVState & Actions;

const blankExperience = (): ExperienceItem => ({
  id: uid(),
  company: { ar: "", en: "" },
  position: { ar: "", en: "" },
  city: { ar: "", en: "" },
  startDate: "",
  endDate: "",
  current: false,
  description: { ar: "", en: "" },
});

const blankEducation = (): EducationItem => ({
  id: uid(),
  institution: { ar: "", en: "" },
  degree: { ar: "", en: "" },
  field: { ar: "", en: "" },
  startDate: "",
  endDate: "",
  current: false,
  grade: { ar: "", en: "" },
});

const blankSkill = (): SkillItem => ({ id: uid(), name: { ar: "", en: "" }, level: 4 });
const blankLanguage = (): LanguageItem => ({
  id: uid(),
  name: { ar: "", en: "" },
  level: "fluent",
});
const blankCert = (): CertificationItem => ({
  id: uid(),
  name: { ar: "", en: "" },
  issuer: { ar: "", en: "" },
  date: "",
  url: "",
});
const blankProject = (): ProjectItem => ({
  id: uid(),
  name: { ar: "", en: "" },
  description: { ar: "", en: "" },
  url: "",
  technologies: { ar: "", en: "" },
});
const blankCustom = (): CustomSectionItem => ({
  id: uid(),
  title: { ar: "", en: "" },
  content: { ar: "", en: "" },
});

const listHelpers = <T extends { id: string }>(list: T[], id: string, dir: -1 | 1): T[] => {
  const idx = list.findIndex((x) => x.id === id);
  const target = idx + dir;
  if (idx < 0 || target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[idx], copy[target]] = [copy[target], copy[idx]];
  return copy;
};

export const useCVStore = create<CVStore>()(
  persist(
    (set) => ({
      data: emptyCV(),
      uiLang: "ar",
      cvLang: "ar",
      templateId: "ats-classic",
      accent: "#0f172a",
      showPhoto: false,
      fontChoice: "modern",

      setUiLang: (uiLang) => set({ uiLang }),
      setCvLang: (cvLang) => set({ cvLang }),
      setTemplate: (templateId) => set({ templateId }),
      setAccent: (accent) => set({ accent }),
      setShowPhoto: (showPhoto) => set({ showPhoto }),
      setFontChoice: (fontChoice) => set({ fontChoice }),

      updatePersonal: (patch) =>
        set((s) => ({ data: { ...s.data, personal: { ...s.data.personal, ...patch } } })),

      addExperience: () =>
        set((s) => ({ data: { ...s.data, experience: [...s.data.experience, blankExperience()] } })),
      updateExperience: (id, patch) =>
        set((s) => ({
          data: {
            ...s.data,
            experience: s.data.experience.map((x) => (x.id === id ? { ...x, ...patch } : x)),
          },
        })),
      removeExperience: (id) =>
        set((s) => ({ data: { ...s.data, experience: s.data.experience.filter((x) => x.id !== id) } })),
      duplicateExperience: (id) =>
        set((s) => {
          const idx = s.data.experience.findIndex((x) => x.id === id);
          if (idx < 0) return s;
          const copy = [...s.data.experience];
          copy.splice(idx + 1, 0, { ...copy[idx], id: uid() });
          return { data: { ...s.data, experience: copy } };
        }),
      moveExperience: (id, dir) =>
        set((s) => ({ data: { ...s.data, experience: listHelpers(s.data.experience, id, dir) } })),

      addEducation: () =>
        set((s) => ({ data: { ...s.data, education: [...s.data.education, blankEducation()] } })),
      updateEducation: (id, patch) =>
        set((s) => ({
          data: {
            ...s.data,
            education: s.data.education.map((x) => (x.id === id ? { ...x, ...patch } : x)),
          },
        })),
      removeEducation: (id) =>
        set((s) => ({ data: { ...s.data, education: s.data.education.filter((x) => x.id !== id) } })),
      duplicateEducation: (id) =>
        set((s) => {
          const idx = s.data.education.findIndex((x) => x.id === id);
          if (idx < 0) return s;
          const copy = [...s.data.education];
          copy.splice(idx + 1, 0, { ...copy[idx], id: uid() });
          return { data: { ...s.data, education: copy } };
        }),
      moveEducation: (id, dir) =>
        set((s) => ({ data: { ...s.data, education: listHelpers(s.data.education, id, dir) } })),

      addSkill: () => set((s) => ({ data: { ...s.data, skills: [...s.data.skills, blankSkill()] } })),
      updateSkill: (id, patch) =>
        set((s) => ({
          data: { ...s.data, skills: s.data.skills.map((x) => (x.id === id ? { ...x, ...patch } : x)) },
        })),
      removeSkill: (id) =>
        set((s) => ({ data: { ...s.data, skills: s.data.skills.filter((x) => x.id !== id) } })),

      addLanguage: () =>
        set((s) => ({ data: { ...s.data, languages: [...s.data.languages, blankLanguage()] } })),
      updateLanguage: (id, patch) =>
        set((s) => ({
          data: { ...s.data, languages: s.data.languages.map((x) => (x.id === id ? { ...x, ...patch } : x)) },
        })),
      removeLanguage: (id) =>
        set((s) => ({ data: { ...s.data, languages: s.data.languages.filter((x) => x.id !== id) } })),

      addCertification: () =>
        set((s) => ({ data: { ...s.data, certifications: [...s.data.certifications, blankCert()] } })),
      updateCertification: (id, patch) =>
        set((s) => ({
          data: {
            ...s.data,
            certifications: s.data.certifications.map((x) => (x.id === id ? { ...x, ...patch } : x)),
          },
        })),
      removeCertification: (id) =>
        set((s) => ({
          data: { ...s.data, certifications: s.data.certifications.filter((x) => x.id !== id) },
        })),

      addProject: () =>
        set((s) => ({ data: { ...s.data, projects: [...s.data.projects, blankProject()] } })),
      updateProject: (id, patch) =>
        set((s) => ({
          data: { ...s.data, projects: s.data.projects.map((x) => (x.id === id ? { ...x, ...patch } : x)) },
        })),
      removeProject: (id) =>
        set((s) => ({ data: { ...s.data, projects: s.data.projects.filter((x) => x.id !== id) } })),

      addCustomSection: () =>
        set((s) => ({ data: { ...s.data, customSections: [...s.data.customSections, blankCustom()] } })),
      updateCustomSection: (id, patch) =>
        set((s) => ({
          data: {
            ...s.data,
            customSections: s.data.customSections.map((x) => (x.id === id ? { ...x, ...patch } : x)),
          },
        })),
      removeCustomSection: (id) =>
        set((s) => ({ data: { ...s.data, customSections: s.data.customSections.filter((x) => x.id !== id) } })),

      applyImported: (imported) =>
        set((s) => ({
          data: {
            ...emptyCV(),
            ...s.data,
            ...imported,
            personal: {
              ...s.data.personal,
              ...(imported.personal ?? {}),
            },
          },
        })),
      loadSample: () => set(() => ({ data: sampleCV() })),
      clearAll: () => set(() => ({ data: emptyCV() })),
      importState: (state) =>
        set((s) => ({
          ...(state.templateId ? { templateId: state.templateId } : {}),
          ...(state.accent ? { accent: state.accent } : {}),
          ...(state.fontChoice ? { fontChoice: state.fontChoice } : {}),
          ...(state.cvLang ? { cvLang: state.cvLang } : {}),
          data: state.data ? { ...emptyCV(), ...state.data } : s.data,
        })),
    }),
    {
      name: "cv-studio-data-v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

/** Completeness meter (0-100). */
export function completeness(data: CVData): number {
  let score = 0;
  const p = data.personal;
  if (p.fullName.ar || p.fullName.en) score += 10;
  if (p.jobTitle.ar || p.jobTitle.en) score += 8;
  if (p.email) score += 8;
  if (p.phone) score += 8;
  if (p.city.ar || p.city.en) score += 4;
  if (p.summary.ar || p.summary.en) score += 15;
  if (data.experience.length > 0) score += 20;
  if (data.education.length > 0) score += 15;
  if (data.skills.length > 0) score += 7;
  if (data.languages.length > 0) score += 5;
  return Math.min(100, score);
}
