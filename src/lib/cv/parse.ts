/**
 * Client-side CV file parsing: extract text from PDF / DOCX / TXT,
 * then apply bilingual (AR/EN) heuristics to map raw lines onto the CV model.
 */
import type { CVData } from "./types";
import { uid, type Level } from "./types";

/* ---------------- text extraction ---------------- */

export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = (await import("pdfjs-dist")) as typeof import("pdfjs-dist");
  // relative → works at host root (APK), under /CV/app/ (GitHub Pages) and in dev
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdf.worker.min.mjs", document.baseURI).href;
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

/** Invisible bidi/zero-width marks that break regex matching on PDF-extracted text. */
const RTL_MARKS = /[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

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

/**
 * Section headers — Arabic and English.
 * NOTE: JS `\b` treats Arabic letters as non-word chars, so a trailing `\b`
 * after Arabic text NEVER matches. We use an explicit lookahead boundary
 * `(?=[\s:،,\-–—•]|$)` which works for both scripts.
 */
const SECTION_KEYS: Array<{ key: string; words: RegExp }> = [
  { key: "summary", words: /^(?:professional\s+|my\s+)?(?:summary|profile|objective|about(?:\s+me)?|الملخص\s*المهني|الملخص|النبذة|نبذة\s*(?:عني|تعريفية)|الهدف|من\s*أنا)(?=[\s:،,\-–—•:]|$)/i },
  { key: "experience", words: /^(?:(?:work|professional|employment)\s+)?(?:experience|work\s+history|employment\s+history|career\s+history|الخبرات?\s*ال(?:عملية|مهنية)|الخبرات|الخبرة|سجل\s*الوظائف|الوظائف|المسار\s*المهني)(?=[\s:،,\-–—•:]|$)/i },
  { key: "education", words: /^(?:education(?:al)?\s*(?:background|qualifications)?|academic\s+background|التعليم|المؤهل(?:ات)?\s*الدراسية|الدرجات\s*العلمية|المؤهلات|التعليم\s*والتدريب|الدراسة)(?=[\s:،,\-–—•:]|$)/i },
  { key: "skills", words: /^(?:(?:technical|core)\s+)?(?:skills|competencies|expertise|المهارات|القدرات|التخصصات|الكفاءات)(?=[\s:،,\-–—•:]|$)/i },
  { key: "languages", words: /^(?:languages?|اللغات)(?=[\s:،,\-–—•:]|$)/i },
  { key: "certifications", words: /^(?:certifications?|certificates?|licenses?|courses|trainings?|الشهادات|الدورات|التدريبات|الشهادة)(?=[\s:،,\-–—•:]|$)/i },
  { key: "projects", words: /^(?:selected\s+)?(?:projects?|المشاريع|أعمال\s*مختارة)(?=[\s:،,\-–—•:]|$)/i },
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

/** A line that consists (almost) solely of a date range. */
const isDateLine = (l?: string): boolean => {
  if (!l) return false;
  if (detectSection(l)) return false;
  const stripped = l.replace(RANGE_RE, "").trim();
  return stripped.length === 0;
};

const isBullet = (line: string) => /^[\u2022\-*·▪◦–—]|^\d+[.)]\s+/.test(line.trim());
const stripBullet = (line: string) => line.replace(/^[\u2022\-*·▪◦–—]\s*/, "").replace(/^\d+[.)]\s+/, "");

const TITLE_HINT =
  /(engineer|developer|designer|manager|accountant|teacher|doctor|consultant|architect|marketer|analyst|nurse|driver|translator|programmer|technician|officer|sales|supervisor|مصمم|مهندس|مدير|محاسب|مطور|معلّم|معلم|طبيب|استشاري|مسؤول|مختص|أخصائي|اخصائي|محلل|مبرمج|ممرض|سائق|مترجم|فني|مدرب|مدرّب|محرر|مصرفي|مسوق|مسوّق|صيدلي|فنان|مصور)/i;

const UNIV_HINT = /university|institute|college|school|academy|faculty|جامعة|معهد|كلية|مدرسة|أكاديمية|اكاديمية|كليه/i;

/** Lines that typically START with a description verb — never a header. */
const DESC_HINT = /^(?:led|designed|developed|managed|created|improved|built|worked|handled|produced|coordinated|implemented|maintained|reduced|raised|assisted|supported|trained|wrote|prepared|organized|achieved|delivered|participated|contributed|established|increased|decreased|spearheaded|oversaw|supervised|guided|mentored|analyzed|tested|deployed|automated|migrated|optimized|resolved|documented|researched|presented|negotiated|collaborated|streamlined|enhanced|expanded|launched|started|grew|cut|saved|نشر|قيادة|تصميم|رفع|تحسين|إدارة|ادارة|تطوير|أداء|إنشاء|انشاء|متابعة|تنفيذ|هندسة|كتابة|ترجمة|عمل|إعداد|اعداد|تنسيق|تقديم|مشاركة|المساهمة|إنجاز|تحقيق|صيانة|تركيب|دعم|تدريب|شرح|مراجعة|تنظيم|استخدام|اعتماد|إبراز|تمييز|تشغيل|فحص|معالجة|حل|بناء|برمجة|تسليم)/i;

const COUNTRY_HINT = /syria|lebanon|jordan|saudi|egypt|u\.?a\.?e|emirates|iraq|yemen|qatar|kuwait|oman|bahrain|palestine|morocco|algeria|tunisia|libya|sudan|turkey|germany|france|spain|italy|canada|america|united\s*states|united\s*kingdom|سوريا|سورية|لبنان|الأردن|الاردن|السعودية|مصر|الإمارات|الامارات|العراق|اليمن|قطر|الكويت|عمان|البحرين|فلسطين|المغرب|الجزائر|تونس|ليبيا|السودان|تركيا|ألمانيا|المانيا|فرنسا|إسبانيا|امريكا|أمريكا|بريطانيا|إنجلترا|هولندا|السويد|الدنمارك/i;

const END_SEP = /[\s\-–—:،,]+$/;

/* ---------------- main parser ---------------- */

export interface ParseResult {
  data: Partial<CVData>;
  recognized: string[];
}

export function parseCVText(raw: string): ParseResult {
  const text = normalizeDigits(
    raw.replace(/\r/g, "").replace(RTL_MARKS, "").replace(/\u00A0/g, " ")
  );
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
  let city: { ar: string; en: string } = { ar: "", en: "" };
  let country: { ar: string; en: string } = { ar: "", en: "" };

  interface ExpDraft {
    position: { ar: string; en: string };
    company: { ar: string; en: string };
    city: { ar: string; en: string };
    startDate: string;
    endDate: string;
    current: boolean;
    description: { ar: string; en: string };
  }
  const experience: ExpDraft[] = [];
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
  const languages: Array<{ name: { ar: string; en: string }; level: Level }> = [];
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

  /** Build position/company/city from a raw header string. */
  const splitExpHead = (head: string) => {
    const norm = head
      .replace(/\s+—\s+|\s+–\s+|\s+-\s+/g, " | ")
      .replace(/\s+at\s+/gi, " | ")
      .replace(/[|,،]/g, " | ");
    const parts = norm.split(/\s*\|\s*/).map((p) => p.trim()).filter(Boolean);
    let ti = parts.findIndex((p) => TITLE_HINT.test(p));
    if (ti < 0) ti = 0;
    const position = parts[ti] ?? "";
    const rest = parts.filter((_, idx) => idx !== ti);
    const company = rest[0] ?? "";
    const cityPart = rest[1] ?? "";
    return {
      position: splitBi(position),
      company: splitBi(company),
      city: splitBi(cityPart),
    };
  };

  // 2) walk sections
  let section: string | null = null;
  const headerCount = Math.min(8, lines.length);
  let expBuffer: string[] = [];
  let eduBuffer: string[] = [];

  const flushExpBufferAsEntry = (range: RegExpMatchArray) => {
    const head = expBuffer.join(" — ");
    expBuffer = [];
    const { position, company, city: c } = splitExpHead(head);
    const current = /present|current|now|حتى\s*الآن|حتى|الآن/i.test(range[2] ?? "");
    experience.push({
      position,
      company,
      city: c,
      startDate: normDate(range[1]),
      endDate: current ? "" : normDate(range[2] ?? ""),
      current,
      description: { ar: "", en: "" },
    });
  };

  const flushEduBufferAsEntry = (range: RegExpMatchArray) => {
    const head = eduBuffer.join(" | ");
    eduBuffer = [];
    const norm = head.replace(/\s+at\s+/gi, " | ");
    const parts = norm.split(/\s*\|\s*|[,،]/).map((p) => p.trim()).filter(Boolean);
    let inst = parts[0] ?? "";
    let degree = parts[1] ?? "";
    if (!UNIV_HINT.test(inst) && UNIV_HINT.test(degree)) [inst, degree] = [degree, inst];
    // "بكالوريوس X - التصميم" → degree + field
    let field = "";
    const dashSplit = degree.split(/\s+[-–—]\s+/);
    if (dashSplit.length >= 2) {
      degree = dashSplit[0];
      field = dashSplit.slice(1).join(" ");
    }
    const current = /present|current|now|حتى\s*الآن|حتى|الآن/i.test(range[2] ?? "");
    education.push({
      degree: splitBi(degree),
      field: splitBi(field),
      institution: splitBi(inst),
      startDate: normDate(range[1]),
      endDate: current ? "" : normDate(range[2] ?? ""),
      current,
      grade: { ar: "", en: "" },
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // header region: name / title / city line
    if (i < headerCount && !emailIn(line) && !phoneIn(line) && !URL_RE.test(line) && !detectSection(line)) {
      // "دمشق، سوريا" / "Damascus, Syria"
      if (!(city.ar || city.en) && (fullName.ar || fullName.en)) {
        const comma = line.match(/^([^,،]{2,30})[,،]\s*([^,،]{2,30})$/);
        if (comma && line.split(/\s+/).length <= 6) {
          const after = comma[2].trim();
          const nameAndTitleFilled = (fullName.ar || fullName.en) && (jobTitle.ar || jobTitle.en);
          if (nameAndTitleFilled || COUNTRY_HINT.test(after)) {
            city = splitBi(comma[1].trim());
            country = splitBi(after);
            continue;
          }
        }
      }
      const looksTitle = TITLE_HINT.test(line);
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
    } else if (section === "experience") {
      const range = line.match(RANGE_RE);
      if (range) {
        // date inline with header, or standalone date after buffered header lines
        const inlineHead = line.replace(RANGE_RE, "").trim();
        if (inlineHead) {
          expBuffer = [inlineHead];
        }
        if (expBuffer.length) flushExpBufferAsEntry(range);
        continue;
      }
      const words = line.split(/\s+/).length;
      const shortHeader = line.length <= 80 && words <= 8 && !isBullet(line);
      const notDesc = !DESC_HINT.test(line);
      // header lines of the NEXT entry: a short non-description line right before
      // its date line (1 or 2 lines before)
      const startsHeaderGroup =
        notDesc && shortHeader && (isDateLine(lines[i + 1]) ||
          (expBuffer.length === 0 && isDateLine(lines[i + 2]) && (lines[i + 1]?.length ?? 999) <= 80));
      if (startsHeaderGroup) {
        expBuffer.push(stripBullet(line));
      } else if (experience.length > 0) {
        const last = experience[experience.length - 1];
        const key = hasArabic(line) ? "ar" : "en";
        last.description[key] = (last.description[key] ? last.description[key] + "\n" : "") + stripBullet(line);
      } else {
        expBuffer.push(stripBullet(line));
        if (expBuffer.length > 4) expBuffer = expBuffer.slice(-4);
      }
    } else if (section === "education") {
      const range = line.match(RANGE_RE);
      if (range) {
        const inlineHead = line.replace(RANGE_RE, "").trim();
        if (inlineHead) {
          eduBuffer = [inlineHead];
        }
        if (eduBuffer.length) flushEduBufferAsEntry(range);
        continue;
      }
      if (education.length === 0) {
        eduBuffer.push(stripBullet(line));
        if (eduBuffer.length > 4) eduBuffer = eduBuffer.slice(-4);
      } else {
        const last = education[education.length - 1];
        const key = hasArabic(line) ? "ar" : "en";
        if (!last.institution[key] && UNIV_HINT.test(line)) last.institution[key] = line;
        else if (/معدل|تقدير|GPA|grade/i.test(line) && !last.grade[key]) last.grade[key] = line;
        else if (!last.field[key]) last.field[key] = line;
      }
    } else if (section === "projects") {
      if (isBullet(line) || projects.length === 0) {
        projects.push({
          name: splitBi(stripBullet(line)),
          description: { ar: "", en: "" },
          url: "",
          technologies: { ar: "", en: "" },
        });
      } else if (projects.length > 0) {
        const last = projects[projects.length - 1];
        const key = hasArabic(line) ? "ar" : "en";
        last.description[key] = (last.description[key] ? last.description[key] + " " : "") + line;
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
  }

  // languages — dedicated pass (levels detected and stripped)
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
        const level: Level = /لغة\s*أم|اللغة\s*الأم|native/i.test(p)
          ? "native"
          : /طلاقة|fluent/i.test(p)
            ? "fluent"
            : /متقدم|advanced/i.test(p)
              ? "advanced"
              : /متوسط|intermediate/i.test(p)
                ? "intermediate"
                : /مبتدئ|basic/i.test(p)
                  ? "basic"
                  : "fluent";
        const name = p
          .replace(/(native|fluent|advanced|intermediate|basic)\s*[:\-–—]?/gi, "")
          .replace(/(لغة\s*أم|اللغة\s*الأم|طلاقة\s*تامة|طلاقة|متقدم|متوسط|مبتدئ)\s*[:\-–—]?/gi, "")
          .replace(END_SEP, "")
          .trim();
        if (name && name.length <= 30) languages.push({ name: splitBi(name), level });
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
  if (city.ar || city.en) recognized.push("city");

  data.personal = {
    fullName,
    jobTitle,
    email,
    phone,
    city,
    country,
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
  if (/present|current|now|حتى/.test(low)) return "";
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
