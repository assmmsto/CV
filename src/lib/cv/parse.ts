/**
 * Client-side CV file parsing: extract text from PDF / DOCX,
 * then apply bilingual heuristics to map raw lines onto the CV model.
 */
import type { CVData } from "./types";
import { uid } from "./types";

/* ---------------- text extraction ---------------- */

export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = (await import("pdfjs-dist")) as typeof import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: buffer });
  const doc = await loadingTask.promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // Re-construct lines using Y positions
    type Row = { y: number; parts: { x: number; s: string }[] };
    const rows: Row[] = [];
    for (const item of content.items as Array<{ str?: string; transform?: number[]; hasEOL?: boolean }>) {
      if (!item.str || !item.transform) continue;
      const x = item.transform[4];
      const y = item.transform[5];
      let row = rows.find((r) => Math.abs(r.y - y) < 3);
      if (!row) {
        row = { y, parts: [] };
        rows.push(row);
      }
      row.parts.push({ x, s: item.str });
    }
    rows.sort((a, b) => b.y - a.y);
    for (const row of rows) {
      row.parts.sort((a, b) => a.x - b.x);
      text += row.parts.map((p) => p.s).join(" ") + "\n";
    }
    text += "\n";
  }
  await loadingTask.destroy();
  return text;
}

export async function extractDocxText(file: File): Promise<string> {
  const mammoth = (await import("mammoth/mammoth.browser")) as unknown as {
    extractRawText: (opts: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
  };
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

export async function extractAnyText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return extractPdfText(file);
  if (name.endsWith(".docx")) return extractDocxText(file);
  if (name.endsWith(".txt") || name.endsWith(".md")) return file.text();
  if (name.endsWith(".doc")) {
    throw new Error("doc-unsupported");
  }
  throw new Error("format-unsupported");
}

/* ---------------- helpers ---------------- */

const hasArabic = (s: string) => /[\u0600-\u06FF]/.test(s);

const splitBi = (s: string): { ar: string; en: string } => {
  const clean = s.trim();
  if (hasArabic(clean)) return { ar: clean, en: "" };
  return { ar: "", en: clean };
};

const normalizeDigits = (s: string) =>
  s
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]{2,}/;
const PHONE_RE = /(\+?\d[\d\s\-()]{7,}\d)/;
const URL_RE = /(https?:\/\/[^\s]+|(?:www\.)[\w-]+\.[^\s]{2,})/i;

const SECTION_KEYS: Array<{ key: string; words: RegExp }> = [
  { key: "summary", words: /^(?:professional\s+)?(?:summary|profile|objective|about(?:\s+me)?|الملخص\s*المهني|النبذة|الملخص|نبذة\s*عني|الهدف|من\s*أنا)\b/i },
  { key: "experience", words: /^(?:work\s+|professional\s+|employment|)?(?:experience|work\s+history|employment\s+history|career\s+history|الخبرات?\s*العملية|الخبرات|الخبرة|سجل\s*الوظائف|الوظائف)\b/i },
  { key: "education", words: /^(?:education(?:al)?\s*(?:background|qualifications)?|academic\s+background|التعليم|المؤهل(?:ات)?\s*الدراسية|الدراسة|التعليم\s*والتدريب)\b/i },
  { key: "skills", words: /^(?:technical\s+)?(?:skills|competencies|core\s+competencies|expertise|المهارات|القدرات|التخصصات)\b/i },
  { key: "languages", words: /^(?:languages|اللغات)\b/i },
  { key: "certifications", words: /^(?:certifications?|certificates|licenses?|courses|trainings?|الشهادات|الدورات|التدريبات|الشهادة)\b/i },
  { key: "projects", words: /^(?:projects?|selected\s+projects|المشاريع|أعمال\s*مختارة)\b/i },
];

function detectSection(line: string): string | null {
  const clean = line.replace(/[::•\-–—*\u2022\s]+$/, "").trim();
  if (!clean || clean.length > 60) return null;
  for (const { key, words } of SECTION_KEYS) {
    if (words.test(clean)) return key;
  }
  return null;
}

const RANGE_RE =
  /((?:0?[1-9]|1[0-2])\/\d{4}|\d{4})\s*(?:[-–—]\s*((?:0?[1-9]|1[0-2])\/\d{4}|\d{4}|present|current|now|حتى\s*الآن|حتى|الآن))?\s*$/i;

const isBullet = (line: string) => /^[\u2022\-*·▪◦–—]|^\d+[.)]\s+/.test(line.trim());

/* ---------------- main parser ---------------- */

export interface ParseResult {
  data: Partial<CVData>;
  recognized: string[];
}

export function parseCVText(raw: string): ParseResult {
  const text = normalizeDigits(raw.replace(/\r/g, ""));
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const recognized: string[] = [];

  const data: Partial<CVData> = {};
  let fullName: { ar: string; en: string } = { ar: "", en: "" };
  let jobTitle: { ar: string; en: string } = { ar: "", en: "" };
  let email = "";
  let phone = "";
  let linkedin = "";
  let github = "";
  let website = "";
  let summary: { ar: string; en: string } = { ar: "", en: "" };

  const experience: Array<{
    company: { ar: string; en: string };
    position: { ar: string; en: string };
    startDate: string;
    endDate: string;
    current: boolean;
    description: { ar: string; en: string };
    city: { ar: string; en: string };
  }> = [];
  const education: Array<{
    institution: { ar: string; en: string };
    degree: { ar: string; en: string };
    field: { ar: string; en: string };
    startDate: string;
    endDate: string;
    current: boolean;
    grade: { ar: string; en: string };
  }> = [];
  const skills: Array<{ name: { ar: string; en: string }; level: 4 }> = [];
  const certifications: Array<{ name: { ar: string; en: string }; issuer: { ar: string; en: string }; date: string; url: string }> = [];
  const projects: Array<{ name: { ar: string; en: string }; description: { ar: string; en: string }; url: string; technologies: { ar: string; en: string } }> = [];

  // 1) contact info from anywhere
  for (const line of lines.slice(0, 40)) {
    if (!email) {
      const m = line.match(EMAIL_RE);
      if (m) email = m[0];
    }
    if (!phone) {
      const m = line.match(PHONE_RE);
      if (m && !/\d{4}\/\d{4}/.test(m[1])) phone = m[1].trim();
    }
    if (!linkedin && /linkedin\.com/i.test(line)) {
      const m = line.match(/((?:www\.)?linkedin\.com\/[^\s,;]+)/i);
      if (m) linkedin = m[1];
    }
    if (!github && /github\.com/i.test(line)) {
      const m = line.match(/((?:www\.)?github\.com\/[^\s,;]+)/i);
      if (m) github = m[1];
    }
    if (!website && !linkedin && !github) {
      const m = line.match(URL_RE);
      if (m && !/linkedin|github/i.test(m[0])) website = m[0];
    }
  }

  // 2) walk sections
  let section: string | null = null;
  const headerCount = Math.min(6, lines.length);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // name & title from the first lines
    if (i < headerCount && !emailIn(line) && !phoneIn(line) && !URL_RE.test(line) && !detectSection(line)) {
      const looksTitle = /(engineer|developer|designer|manager|accountant|teacher|doctor|consultant|architect|marketer|مصمم|مهندس|مدير|محاسب|مطور|معلّم|معلم|طبيب|استشاري|مسؤول|مختص|أخصائي|اخصائي)/i.test(line);
      if (!looksTitle && !fullName.ar && !fullName.en && line.split(/\s+/).length <= 6 && !/^[A-Z\s\p{P}]{3,}$/u.test(line)) {
        fullName = splitBi(line);
        continue;
      }
      if (looksTitle && !jobTitle.ar && !jobTitle.en) {
        jobTitle = splitBi(line);
        continue;
      }
    }

    const sec = detectSection(line);
    if (sec) {
      section = sec;
      continue;
    }
    if (!section) continue;

    if (section === "summary") {
      if (hasArabic(line)) summary.ar = (summary.ar ? summary.ar + " " : "") + line;
      else summary.en = (summary.en ? summary.en + " " : "") + line;
    } else if (section === "skills") {
      const parts = line.split(/[,،;•·|]+/).map((p) => p.trim()).filter(Boolean);
      for (const p of parts) {
        if (p.length <= 40) skills.push({ name: splitBi(p), level: 4 });
      }
    } else if (section === "experience" || section === "projects") {
      const range = line.match(RANGE_RE);
      if (range && section === "experience") {
        // header line of a new experience entry
        let head = line.replace(RANGE_RE, "").replace(/[|,،]/g, " | ").trim();
        const parts = head.split(/\s*\|\s*|\s+at\s+|\s+—\s+|\s+-\s+/).filter(Boolean);
        const position = splitBi(parts[0] ?? "");
        const company = splitBi(parts[1] ?? "");
        const city = parts[2] ? splitBi(parts[2]) : { ar: "", en: "" };
        const current = /present|current|now|حتى\s*الآن|حتى|الآن/i.test(range[2] ?? "");
        experience.push({
          position,
          company,
          city,
          startDate: normDate(range[1]),
          endDate: current ? "" : normDate(range[2] ?? ""),
          current,
          description: { ar: "", en: "" },
        });
      } else if (section === "experience" && experience.length > 0) {
        const last = experience[experience.length - 1];
        const key = hasArabic(line) ? "ar" : "en";
        last.description[key] = (last.description[key] ? last.description[key] + "\n" : "") + line.replace(/^[\u2022\-*·▪◦]\s*/, "");
      } else if (section === "projects") {
        if (isBullet(line) || projects.length === 0) {
          projects.push({
            name: splitBi(line.replace(/^[\u2022\-*·▪◦]\s*/, "")),
            description: { ar: "", en: "" },
            url: "",
            technologies: { ar: "", en: "" },
          });
        } else if (projects.length > 0) {
          const last = projects[projects.length - 1];
          const key = hasArabic(line) ? "ar" : "en";
          last.description[key] = (last.description[key] ? last.description[key] + " " : "") + line;
        }
      }
    } else if (section === "education") {
      const range = line.match(RANGE_RE);
      if (range) {
        let head = line.replace(RANGE_RE, "").trim();
        const parts = head.split(/[,،|]|\s+at\s+/).filter(Boolean);
        const degree = splitBi(parts[0] ?? "");
        const institution = splitBi(parts[1] ?? "");
        education.push({
          degree,
          institution,
          field: { ar: "", en: "" },
          startDate: normDate(range[1]),
          endDate: normDate(range[2] ?? ""),
          current: /present|current|حتى/i.test(range[2] ?? ""),
          grade: { ar: "", en: "" },
        });
      } else if (education.length > 0) {
        const last = education[education.length - 1];
        const key = hasArabic(line) ? "ar" : "en";
        if (!last.institution[key] && /university|institute|college|school|جامعة|معهد|كلية|مدرسة/i.test(line))
          last.institution[key] = line;
        else if (!last.field[key]) last.field[key] = line;
      }
    } else if (section === "certifications") {
      const yearMatch = line.match(/\b(19|20)\d{2}\b|\d{2}\/\d{4}/);
      const clean = line.replace(/\b(19|20)\d{2}\b|\d{2}\/\d{4}/, "").replace(/[,\u2013-]+$/, "").trim();
      certifications.push({
        name: splitBi(clean),
        issuer: { ar: "", en: "" },
        date: yearMatch ? yearMatch[0] : "",
        url: "",
      });
    }
    // languages are collected in the dedicated second pass below
  }

  const languages: Array<{ name: { ar: string; en: string }; level: "fluent" }> = [];
  {
    let section2: string | null = null;
    for (const line of lines) {
      const sec = detectSection(line);
      if (sec) {
        section2 = sec;
        continue;
      }
      if (section2 !== "languages") continue;
      const parts = line.split(/[,،;|•·]+/).map((p) => p.trim()).filter(Boolean);
      for (const p of parts) {
        const name = p
          .replace(/\b(native|fluent|advanced|intermediate|basic)\b\s*[:\-–]?/gi, "")
          .replace(/(لغة\s*أم|اللغة\s*الأم|طلاقة\s*تامة|طلاقة|متقدم|متوسط|مبتدئ)\s*[:\-–]?/gi, "")
          .trim();
        if (name && name.length <= 30) languages.push({ name: splitBi(name), level: "fluent" });
      }
    }
  }

  // fill missing job title from first experience position
  if (!jobTitle.ar && !jobTitle.en && experience.length > 0) jobTitle = experience[0].position;

  if (fullName.ar || fullName.en) recognized.push("name");
  if (jobTitle.ar || jobTitle.en) recognized.push("title");
  if (email) recognized.push("email");
  if (phone) recognized.push("phone");
  if (linkedin) recognized.push("linkedin");
  if (github) recognized.push("github");
  if (website) recognized.push("website");
  if (summary.ar || summary.en) recognized.push("summary");
  if (experience.length) recognized.push("experience");
  if (education.length) recognized.push("education");
  if (skills.length) recognized.push("skills");
  if (languages.length) recognized.push("languages");
  if (certifications.length) recognized.push("certifications");
  if (projects.length) recognized.push("projects");

  data.personal = {
    fullName,
    jobTitle,
    email,
    phone,
    city: { ar: "", en: "" },
    country: { ar: "", en: "" },
    website,
    linkedin,
    github,
    summary,
  };
  data.experience = experience.map((e) => ({ id: uid(), ...e }));
  data.education = education.map((e) => ({ id: uid(), ...e }));
  data.skills = skills.map((s) => ({ id: uid(), ...s }));
  data.languages = languages.map((l) => ({ id: uid(), ...l }));
  data.certifications = certifications.map((c) => ({ id: uid(), ...c }));
  data.projects = projects.map((p) => ({ id: uid(), ...p }));

  return { data, recognized };
}

function normDate(s: string): string {
  if (!s) return "";
  const low = s.toLowerCase().trim();
  if (/present|current|now/.test(low)) return "";
  if (/^\d{4}$/.test(low)) return low;
  const m = low.match(/^(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[1].padStart(2, "0")}/${m[2]}`;
  return low;
}

function emailIn(line: string) {
  return EMAIL_RE.test(line);
}
function phoneIn(line: string) {
  return PHONE_RE.test(line);
}
