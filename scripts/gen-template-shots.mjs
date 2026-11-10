/**
 * Generate clean per-template thumbnails for the landing page gallery:
 * screenshots the template root element ([data-std]) in Arabic at 3x,
 * then converts to 480w webp via sharp.
 */
import { chromium } from "playwright-core";
import http from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import { join, normalize } from "node:path";

const PORT = 8109;
const ROOT = "/home/z/my-project/docs";
const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || "/").split("?")[0]);
  if (p.startsWith("/CV/")) p = p.slice(3);
  if (p.endsWith("/")) p += "index.html";
  try {
    const data = readFileSync(normalize(join(ROOT, p)));
    res.writeHead(200, { "Content-Type": p.endsWith(".js") ? "application/javascript" : p.endsWith(".css") ? "text/css" : p.endsWith(".html") ? "text/html" : "application/octet-stream" });
    res.end(data);
  } catch { res.writeHead(404); res.end("nf"); }
});
await new Promise((r) => server.listen(PORT, r));

const PHOTO = "data:image/jpeg;base64," + readFileSync("/home/z/my-project/scripts/fixtures/photo.jpg").toString("base64");
const STATE = {
  state: {
    data: {
      personal: {
        fullName: { ar: "محمد عبدالله السعيد", en: "Mohammed Abdullah Al-Saeed" },
        jobTitle: { ar: "مهندس برمجيات أول", en: "Senior Software Engineer" },
        email: "mohammed@example.com", phone: "+963 944 555 123",
        city: { ar: "دمشق", en: "Damascus" }, country: { ar: "سوريا", en: "Syria" },
        website: "https://mohammed.dev", linkedin: "linkedin.com/in/mohammed", github: "",
        photo: PHOTO,
        summary: { ar: "مهندس برمجيات بخبرة 8 سنوات في بناء تطبيقات الويب واسعة النطاق.", en: "Software engineer." },
      },
      experience: [
        { id: "exp1", company: { ar: "شركة التقنية المتقدمة", en: "Advanced Tech Co" }, position: { ar: "مهندس برمجيات أول", en: "Senior Software Engineer" }, city: { ar: "دمشق", en: "Damascus" }, startDate: "03/2020", endDate: "", current: true, description: "قيادة فريق تطوير من 6 مهندسين\nتحسين أداء المنصة بنسبة 40%" },
        { id: "exp2", company: { ar: "مصارف الشام", en: "Levant Banks" }, position: { ar: "مطور تطبيقات", en: "Application Developer" }, city: { ar: "حلب", en: "Aleppo" }, startDate: "06/2016", endDate: "02/2020", current: false, description: "تطوير أنظمة مصرفية إلكترونية" },
      ],
      education: [{ id: "edu1", institution: { ar: "جامعة دمشق", en: "Damascus University" }, degree: { ar: "ماجستير", en: "MSc" }, field: { ar: "هندسة برمجيات", en: "Software Engineering" }, startDate: "2012", endDate: "2014", current: false, grade: { ar: "ممتاز", en: "Excellent" } }],
      skills: [
        { id: "s1", name: { ar: "React / Next.js", en: "React" }, level: 5 },
        { id: "s2", name: { ar: "Node.js", en: "Node.js" }, level: 4 },
        { id: "s3", name: { ar: "قواعد البيانات", en: "Databases" }, level: 4 },
        { id: "s4", name: { ar: "DevOps", en: "DevOps" }, level: 3 },
      ],
      languages: [
        { id: "l1", name: { ar: "العربية", en: "Arabic" }, level: "native" },
        { id: "l2", name: { ar: "الإنجليزية", en: "English" }, level: "fluent" },
      ],
      certifications: [{ id: "c1", name: { ar: "AWS Solutions Architect", en: "AWS" }, issuer: { ar: "Amazon", en: "Amazon" }, date: "2022", url: "" }],
      projects: [{ id: "p1", name: { ar: "منصة التوظيف الذكية", en: "Smart Jobs" }, description: { ar: "منصة توظيف تجمع الوظائف من عشرات المصادر", en: "Job aggregator" }, technologies: { ar: "Next.js", en: "Next.js" }, url: "" }],
      customSections: [],
    },
    uiLang: "ar", cvLang: "ar", templateId: "ats-classic",
    accent: "#0f766e", showPhoto: true, fontChoice: "modern", uiTab: "preview",
  },
  version: 1,
};

const ALL = ["ats-classic", "ats-modern", "executive", "minimal-pro", "modern-sidebar", "corporate", "timeline", "elegant-dark", "compact-pro", "contemporary"];
const STD = { "ats-classic": "harvard", "ats-modern": "ats-proof", "executive": "hbs-executive", "minimal-pro": "google-simple", "modern-sidebar": "modern-sidebar", "corporate": "indeed", "timeline": "career-timeline", "elegant-dark": "europass", "compact-pro": "fresh-graduate", "contemporary": "creative" };
const NAME_AR = { "ats-classic": "هارفارد الرسمي", "ats-modern": "متوافق الفرز الآلي", "executive": "التنفيذي", "minimal-pro": "جوجل البسيط", "modern-sidebar": "الشريط الحديث", "corporate": "إنديد الرسمي", "timeline": "المسار المهني", "elegant-dark": "يوروباس المعتمد", "compact-pro": "الخريج الجديد", "contemporary": "الإبداعي" };

mkdirSync("/tmp/tpl-shots", { recursive: true });
const browser = await chromium.launch({ executablePath: "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome", args: ["--no-sandbox", "--force-color-profile=srgb"] });
const ctx = await browser.newContext({ viewport: { width: 1100, height: 1400 }, deviceScaleFactor: 3 });
const page = await ctx.newPage();
await page.goto(`http://localhost:${PORT}/CV/app/`, { waitUntil: "networkidle" });
await page.evaluate((s) => localStorage.setItem("cv-studio-data-v1", JSON.stringify(s)), STATE);
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector(".cv-sheet", { state: "attached", timeout: 20000 });
await page.waitForTimeout(900);

for (const tid of ALL) {
  await page.locator('[role="tab"]', { hasText: "القوالب" }).click();
  await page.locator("button[aria-pressed]", { hasText: NAME_AR[tid] }).first().click();
  await page.locator('[role="tab"]', { hasText: "المعاينة" }).click();
  await page.waitForFunction(
    (std) => { const s = document.querySelector(".cv-sheet [data-std]"); return !!s && s.getAttribute("data-std") === std; },
    STD[tid], { timeout: 15000 }
  );
  await page.waitForTimeout(350);
  await page.locator(".cv-sheet [data-std]").first().screenshot({ path: `/tmp/tpl-shots/${tid}.png` });
  console.log("shot", tid);
}
await browser.close();
server.close();

/* convert to 480w webp (first page of each shot) */
const sharp = (await import("sharp")).default;
for (const tid of ALL) {
  const out = `/home/z/my-project/docs/img/tpl-${tid}.webp`;
  await sharp(`/tmp/tpl-shots/${tid}.png`)
    .resize({ width: 480 })
    .webp({ quality: 82 })
    .toFile(out);
  console.log("webp", out);
}
console.log("DONE");
