/**
 * PROOF COLLECTOR — collects hard evidence of the 3 reported bugs
 * from the LIVE deployed app (before fix) and later proves the fixes (after).
 *
 * Evidence collected per PDF (all 10 templates, Arabic + English):
 *   A. link annotations inside the PDF (clickable areas)  → bug: 0
 *   B. rendered page image → Arabic letters visual state  → bug: disconnected
 *
 * Usage: node scripts/proof-bugs.mjs <before|after> [baseUrl]
 */
import { chromium } from "playwright-core";
import { writeFileSync, mkdirSync } from "node:fs";
import { PDFDocument } from "pdf-lib";

const TAG = process.argv[2] || "before";
const BASE = process.argv[3] || "https://assmmsto.github.io/CV/app";
const OUT = `/home/z/my-project/scripts/proof/${TAG}`;
mkdirSync(OUT, { recursive: true });

const PHOTO = "data:image/jpeg;base64," +
  (await import("node:fs")).readFileSync("/home/z/my-project/scripts/fixtures/photo.jpg").toString("base64");

const STATE = {
  state: {
    data: {
      personal: {
        fullName: { ar: "محمد عبدالله السعيد", en: "Mohammed Abdullah Al-Saeed" },
        jobTitle: { ar: "مهندس برمجيات أول", en: "Senior Software Engineer" },
        email: "mohammed@example.com",
        phone: "+963 944 555 123",
        city: { ar: "دمشق", en: "Damascus" },
        country: { ar: "سوريا", en: "Syria" },
        website: "www.mohammed.dev",
        linkedin: "linkedin.com/in/mohammed",
        github: "github.com/mohammed",
        photo: PHOTO,
        summary: {
          ar: "مهندس برمجيات بخبرة 8 سنوات في بناء تطبيقات الويب واسعة النطاق. تفضّلوا بزيارة معرض أعمالي على الرابط للمشاريع المفصلة.",
          en: "Software engineer with 8 years of experience building large-scale web applications. Portfolio at www.mohammed.dev with detailed projects.",
        },
      },
      experience: [
        {
          id: "exp1",
          company: { ar: "شركة التقنية المتقدمة", en: "Advanced Tech Co" },
          position: { ar: "مهندس برمجيات أول", en: "Senior Software Engineer" },
          city: { ar: "دمشق", en: "Damascus" },
          startDate: "03/2020", endDate: "", current: true,
          description: "قيادة فريق تطوير من 6 مهندسين\nتفاصيل المشروع على github.com/mohammed",
        },
        {
          id: "exp2",
          company: { ar: "مصارف الشام", en: "Levant Banks" },
          position: { ar: "مطور تطبيقات", en: "Application Developer" },
          city: { ar: "حلب", en: "Aleppo" },
          startDate: "06/2016", endDate: "02/2020", current: false,
          description: "تطوير أنظمة مصرفية إلكترونية",
        },
      ],
      education: [
        { id: "edu1", institution: { ar: "جامعة دمشق", en: "Damascus University" }, degree: { ar: "ماجستير", en: "MSc" }, field: { ar: "هندسة برمجيات", en: "Software Engineering" }, startDate: "2012", endDate: "2014", current: false, grade: { ar: "ممتاز", en: "Excellent" } },
      ],
      skills: [
        { id: "s1", name: { ar: "React / Next.js", en: "React / Next.js" }, level: 5 },
        { id: "s2", name: { ar: "Node.js", en: "Node.js" }, level: 4 },
        { id: "s3", name: { ar: "قواعد البيانات", en: "Databases" }, level: 4 },
      ],
      languages: [
        { id: "l1", name: { ar: "العربية", en: "Arabic" }, level: "native" },
        { id: "l2", name: { ar: "الإنجليزية", en: "English" }, level: "fluent" },
      ],
      certifications: [
        { id: "c1", name: { ar: "AWS Solutions Architect", en: "AWS Solutions Architect" }, issuer: { ar: "Amazon", en: "Amazon" }, date: "2022", url: "https://aws.amazon.com/verification" },
      ],
      projects: [
        { id: "pr1", name: { ar: "منصة توظيف", en: "Jobs Platform" }, description: { ar: "منصة توظيف إلكترونية", en: "Online hiring platform" }, url: "https://jobs.example.com", technologies: { ar: "React, Node.js", en: "React, Node.js" } },
      ],
      customSections: [],
    },
    uiLang: "ar", cvLang: "ar", templateId: "ats-classic",
    accent: "#0f766e", showPhoto: true, fontChoice: "modern", uiTab: "export",
  },
  version: 1,
};

const ALL_TEMPLATES = [
  "ats-classic", "ats-modern", "executive", "minimal-pro", "modern-sidebar",
  "corporate", "timeline", "elegant-dark", "compact-pro", "contemporary",
];

/** count /Link annotations with /URI across all pages of a PDF buffer */
async function countLinks(buf) {
  const { PDFName } = await import("pdf-lib");
  const pdf = await PDFDocument.load(buf);
  const dictOf = (o) => (o && o.dict ? o.dict : o);
  let links = 0; const uris = new Set();
  for (const page of pdf.getPages()) {
    const annots = page.node.Annots();
    if (!annots) continue;
    const n = annots.size ? annots.size() : annots.length || 0;
    for (let i = 0; i < n; i++) {
      const a = dictOf(annots.lookup(i));
      if (!a || !a.get) continue;
      const st = a.get(PDFName.of("Subtype"))?.toString() ?? "";
      if (st === "/Link") {
        links++;
        const act = dictOf(a.get(PDFName.of("A")));
        const uri = act?.get?.(PDFName.of("URI"))?.toString?.() ?? "";
        if (uri) uris.add(uri);
      }
    }
  }
  return { links, uris: [...uris] };
}

const browser = await chromium.launch({
  executablePath: "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
  args: ["--no-sandbox", "--force-color-profile=srgb"],
});
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));

await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(2500);
await page.evaluate((s) => localStorage.setItem("cv-studio-data-v1", JSON.stringify(s)), STATE);
await page.reload({ waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(2000);

console.log(`== collecting evidence (${TAG}) from ${BASE} ==`);
const report = [];
for (const lang of ["ar", "en"]) {
  for (let i = 0; i < ALL_TEMPLATES.length; i++) {
    const tid = ALL_TEMPLATES[i];
    try {
      const b64 = await page.evaluate(
        ([t, l]) => window.__cvExportPdf(t, l), [tid, lang]
      );
      const buf = Buffer.from(b64, "base64");
      const f = `${OUT}/${tid}.${lang}.pdf`;
      writeFileSync(f, buf);
      const { links, uris } = await countLinks(buf);
      report.push({ tid, lang, kb: (buf.length / 1024).toFixed(0), links, uris });
      console.log(`  ${tid}.${lang}: ${(buf.length / 1024).toFixed(0)}KB → clickable-link annotations: ${links} ${uris.length ? JSON.stringify(uris) : ""}`);
    } catch (e) {
      console.log(`  ${tid}.${lang}: FAILED ${String(e).slice(0, 100)}`);
      report.push({ tid, lang, error: String(e).slice(0, 100) });
    }
  }
}

/* on-screen preview screenshot (DOM rendering = reference appearance) */
try {
  await page.evaluate(() => localStorage.setItem("cv-studio-data-v1-ui", "ar"));
  const prev = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("cv-studio-data-v1"));
    s.state.uiTab = "preview";
    localStorage.setItem("cv-studio-data-v1", JSON.stringify(s));
    return true;
  });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/preview-ar.png`, fullPage: false });
  console.log(`  preview screenshot saved (${prev})`);
} catch (e) {
  console.log("  preview screenshot failed:", String(e).slice(0, 100));
}

await browser.close();

/* summary verdict */
const arLinks = report.filter((r) => r.lang === "ar").reduce((a, r) => a + (r.links || 0), 0);
const enLinks = report.filter((r) => r.lang === "en").reduce((a, r) => a + (r.links || 0), 0);
console.log(`\n===== ${TAG.toUpperCase()} SUMMARY =====`);
console.log(`link annotations across 10 Arabic PDFs : ${arLinks}`);
console.log(`link annotations across 10 English PDFs: ${enLinks}`);
console.log(`page JS errors: ${errors.length ? errors.join(" | ") : "none"}`);
writeFileSync(`${OUT}/report.json`, JSON.stringify({ tag: TAG, base: BASE, report, arLinks, enLinks, errors }, null, 2));
console.log(`report → ${OUT}/report.json`);
