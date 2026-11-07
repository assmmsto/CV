/**
 * FULL E2E — CV Studio v1.2
 * 1. All 10 templates generate real PDFs (with photo) directly client-side
 * 2. Clicking a template's download button fires a real browser download (PDF)
 * 3. "Download all" fires a real ZIP download containing 10 separate PDFs
 * 4. Photo upload via file input works (store gets data:image)
 * 5. CV import (PDF file → parsed → applied) works
 */
import { chromium } from "playwright-core";
import { writeFileSync, readFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";

const PORT = 8077;
const BASE = `http://localhost:${PORT}`;
const PHOTO = "data:image/jpeg;base64," + readFileSync("/home/z/my-project/scripts/fixtures/photo.jpg").toString("base64");
rmSync("/tmp/e2e-pdfs", { recursive: true, force: true });
const DOWN = "/tmp/e2e-downloads";
rmSync(DOWN, { recursive: true, force: true });
mkdirSync(DOWN, { recursive: true });

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
        website: "https://mohammed.dev",
        linkedin: "linkedin.com/in/mohammed",
        github: "github.com/mohammed",
        photo: PHOTO,
        summary: {
          ar: "مهندس برمجيات بخبرة 8 سنوات في بناء تطبيقات الويب واسعة النطاق باستخدام React و Node.js. قادت فرقاً تقنية من 6 أفراد.",
          en: "Software engineer with 8 years of experience building large-scale web applications with React and Node.js.",
        },
      },
      experience: [
        {
          id: "exp1",
          company: { ar: "شركة التقنية المتقدمة", en: "Advanced Tech Co" },
          position: { ar: "مهندس برمجيات أول", en: "Senior Software Engineer" },
          city: { ar: "دمشق", en: "Damascus" },
          startDate: "03/2020", endDate: "", current: true,
          description: "قيادة فريق تطوير من 6 مهندسين\nتحسين أداء المنصة بنسبة 40%",
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
      ],
      languages: [
        { id: "l1", name: { ar: "العربية", en: "Arabic" }, level: "native" },
        { id: "l2", name: { ar: "الإنجليزية", en: "English" }, level: "fluent" },
      ],
      certifications: [
        { id: "c1", name: { ar: "AWS Solutions Architect", en: "AWS Solutions Architect" }, issuer: { ar: "Amazon", en: "Amazon" }, date: "2022", url: "" },
      ],
      projects: [],
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

let pass = 0, fail = 0;
const ok = (m) => { console.log("  ✅", m); pass++; };
const bad = (m) => { console.log("  ❌", m); fail++; };

const browser = await chromium.launch({
  executablePath: "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
  args: ["--no-sandbox", "--force-color-profile=srgb"],
});
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("[pageexception]", String(e).slice(0, 300)));

console.log("== 1) hook + all 10 templates → direct PDF blobs ==");
await page.goto(BASE, { waitUntil: "networkidle" });
await page.evaluate((s) => localStorage.setItem("cv-studio-data-v1", JSON.stringify(s)), STATE);
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(900);

const hook = await page.evaluate(() => typeof window.__cvExportPdf === "function");
hook ? ok("__cvExportPdf hook exists") : bad("__cvExportPdf hook missing");

mkdirSync("/tmp/e2e-pdfs", { recursive: true });
const t0 = Date.now();
for (let i = 0; i < ALL_TEMPLATES.length; i++) {
  const tid = ALL_TEMPLATES[i];
  try {
    const b64 = await page.evaluate((t) => window.__cvExportPdf(t, "ar"), tid);
    const buf = Buffer.from(b64, "base64");
    const isPdf = buf.subarray(0, 5).toString() === "%PDF-";
    writeFileSync(`/tmp/e2e-pdfs/${String(i + 1).padStart(2, "0")}-${tid}.pdf`, buf);
    isPdf && buf.length > 20000
      ? ok(`${tid} → PDF ${(buf.length / 1024).toFixed(0)}KB`)
      : bad(`${tid} → invalid (${buf.length}B, magic=${isPdf})`);
  } catch (e) {
    bad(`${tid} → threw: ${String(e).slice(0, 120)}`);
  }
}
console.log(`  (${((Date.now() - t0) / 1000).toFixed(1)}s for 10 PDFs)`);

const uniq = execSync("md5sum /tmp/e2e-pdfs/*.pdf | awk '{print $1}' | sort -u | wc -l").toString().trim();
uniq === "10" ? ok("all 10 PDFs are unique") : bad(`only ${uniq}/10 unique PDFs`);

console.log("== 2) CLICK download button → real download fires immediately ==");
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const dlPromise = page.waitForEvent("download", { timeout: 60000 });
await page.locator("button", { hasText: "تحميل PDF" }).first().click();
const dl = await dlPromise;
const dlPath = await dl.path();
const dlName = dl.suggestedFilename();
const dlBuf = readFileSync(dlPath);
(dlName.endsWith(".pdf") && dlBuf.subarray(0, 5).toString() === "%PDF-")
  ? ok(`single click → "${dlName}" (${(dlBuf.length / 1024).toFixed(0)}KB) downloaded directly`)
  : bad(`single click → wrong file ${dlName}`);

console.log("== 3) CLICK download-all → real ZIP with 10 separate PDFs ==");
const zipPromise = page.waitForEvent("download", { timeout: 240000 });
await page.locator("button", { hasText: "تحميل النسخ العشر" }).first().click();
const zipDl = await zipPromise;
const zipPath = await zipDl.path();
const zipName = zipDl.suggestedFilename();
writeFileSync(`${DOWN}/${zipName}`, readFileSync(zipPath));
execSync(`rm -rf /tmp/e2e-zip && mkdir -p /tmp/e2e-zip && cd /tmp/e2e-zip && unzip -q "${zipPath}"`);
const pdfs = readdirSync("/tmp/e2e-zip").filter((f) => f.endsWith(".pdf"));
pdfs.length === 10 ? ok(`ZIP "${zipName}" contains exactly 10 separate PDF files`) : bad(`ZIP contains ${pdfs.length} PDFs`);
const zipUniq = execSync("md5sum /tmp/e2e-zip/*.pdf | awk '{print $1}' | sort -u | wc -l").toString().trim();
zipUniq === "10" ? ok("ZIP: every template is its own distinct file") : bad(`ZIP: only ${zipUniq} unique`);
console.log("   ", pdfs.slice(0, 3).join(" | "), "…");

console.log("== 4) PHOTO upload via file input ==");
await page.evaluate(() => localStorage.clear());
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.locator('[role="tab"]', { hasText: "البيانات" }).click();
await page.waitForTimeout(500);
await page.setInputFiles('input[type="file"][accept="image/*"]', "/home/z/my-project/scripts/fixtures/photo.jpg");
await page.waitForTimeout(2000);
const photoOk = await page.evaluate(() => {
  const raw = localStorage.getItem("cv-studio-data-v1");
  if (!raw) return false;
  const st = JSON.parse(raw);
  return (st.state?.data?.personal?.photo || "").startsWith("data:image/") && st.state?.showPhoto === true;
});
photoOk ? ok("photo picked via <input type=file> → stored as data:image + showPhoto=true") : bad("photo upload did not reach the store");

console.log("== 5) CV import: PDF file → parse → apply ==");
await page.locator('[role="tab"]', { hasText: "استيراد" }).click();
await page.waitForTimeout(500);
await page.setInputFiles('input[type="file"][accept=".pdf,.docx,.txt,.md"]', "/home/z/my-project/scripts/fixtures/sample-cv.pdf");
await page.waitForTimeout(5000);
const hasResult = await page.evaluate(() => !!document.querySelector("details"));
let rawTextShown = false;
if (hasResult) {
  await page.locator("details summary").first().click(); // expand extracted text panel
  await page.waitForTimeout(300);
  rawTextShown = await page.evaluate(() => {
    const pre = document.querySelector("details pre");
    return !!pre && (pre.textContent || "").includes("Mohammed Abdullah Al-Saeed");
  });
}
hasResult && rawTextShown ? ok("import parsed the PDF (extracted text shows the CV content)") : bad(`import failed (result=${hasResult}, text=${rawTextShown})`);
const applyBtn = page.locator("button", { hasText: "تطبيق على بياناتي" }).first();
if (await applyBtn.count()) {
  await applyBtn.click();
  await page.waitForTimeout(1500);
  const applied = await page.evaluate(() => {
    const raw = localStorage.getItem("cv-studio-data-v1");
    if (!raw) return "";
    const st = JSON.parse(raw);
    const n = st.state?.data?.personal?.fullName || {};
    return `${n.ar || ""} ${n.en || ""}`;
  });
  applied.includes("Mohammed") || applied.includes("محمد") ? ok(`apply → store updated ("${applied.trim()}") → jumped to export`) : bad("apply failed");
} else {
  bad("apply button not found");
}

await browser.close();
console.log(`\n===== E2E RESULT: PASS=${pass} FAIL=${fail} =====`);
process.exit(fail ? 1 : 0);
