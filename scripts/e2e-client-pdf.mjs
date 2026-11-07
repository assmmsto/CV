/**
 * E2E test: client-side PDF generation inside a real Chromium page.
 * Serves out/, injects sample CV data (with a photo) into localStorage,
 * then calls window.__cvExportPdf for several templates and saves the PDFs.
 */
import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";

const PORT = 8077;
const BASE = `http://localhost:${PORT}`;

// tiny 3x4 portrait JPEG (solid teal block) as the user photo
const PHOTO_JPEG =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwcJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPDQ0NP/AAsEAAQEAGxEAIRgAP/0gA9ADAARAQAB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDz+iiivpH4oUUUUAFFFaaSbBJJAA5JNJRRQAUUUUAf//Z";

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
        photo: PHOTO_JPEG,
        summary: {
          ar: "مهندس برمجيات بخبرة 8 سنوات في بناء تطبيقات الويب واسعة النطاق باستخدام React و Node.js. قادت فرقاً تقنية من 6 أفراد وحققت تحسناً بنسبة 40% في أداء الأنظمة.",
          en: "Software engineer with 8 years of experience building large-scale web applications with React and Node.js. Led teams of 6 and improved system performance by 40%.",
        },
      },
      experience: [
        {
          id: "exp1",
          company: { ar: "شركة التقنية المتقدمة", en: "Advanced Tech Co" },
          position: { ar: "مهندس برمجيات أول", en: "Senior Software Engineer" },
          city: { ar: "دمشق", en: "Damascus" },
          startDate: "03/2020",
          endDate: "",
          current: true,
          description:
            "قيادة فريق تطوير من 6 مهندسين\nتحسين أداء المنصة بنسبة 40%\nإطلاق 12 منتجاً رقمياً جديداً",
        },
        {
          id: "exp2",
          company: { ar: "مصارف الشام", en: "Levant Banks" },
          position: { ar: "مطور تطبيقات", en: "Application Developer" },
          city: { ar: "حلب", en: "Aleppo" },
          startDate: "06/2016",
          endDate: "02/2020",
          current: false,
          description: "تطوير أنظمة مصرفية إلكترونية\nأتمتة عمليات الفروع",
        },
      ],
      education: [
        {
          id: "edu1",
          institution: { ar: "جامعة دمشق", en: "Damascus University" },
          degree: { ar: "ماجستير", en: "MSc" },
          field: { ar: "هندسة برمجيات", en: "Software Engineering" },
          startDate: "2012",
          endDate: "2014",
          current: false,
          grade: { ar: "ممتاز", en: "Excellent" },
        },
      ],
      skills: [
        { id: "s1", name: { ar: "React / Next.js", en: "React / Next.js" }, level: 5 },
        { id: "s2", name: { ar: "Node.js", en: "Node.js" }, level: 4 },
        { id: "s3", name: { ar: "إدارة الفرق", en: "Team Leadership" }, level: 4 },
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
    uiLang: "ar",
    cvLang: "ar",
    templateId: "ats-classic",
    accent: "#0f766e",
    showPhoto: true,
    fontChoice: "modern",
    uiTab: "export",
  },
  version: 1,
};

const run = async () => {
  const browser = await chromium.launch({
    executablePath: "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
    args: ["--no-sandbox", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  page.on("console", (m) => {
    if (m.type() === "error") console.log("[page-error]", m.text().slice(0, 200));
  });
  page.on("pageerror", (e) => console.log("[pageexception]", String(e).slice(0, 300)));

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate((s) => localStorage.setItem("cv-studio-data-v1", JSON.stringify(s)), STATE);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  // sanity: hook exists & store picked up data
  const hasHook = await page.evaluate(() => typeof window.__cvExportPdf === "function");
  const name = await page.evaluate(() => {
    const raw = localStorage.getItem("cv-studio-data-v1");
    return raw ? JSON.parse(raw).state.data.personal.fullName.ar : "??";
  });
  console.log("hook:", hasHook, "| stored name:", name);

  const cases = [
    ["ats-classic", "ar", "/tmp/test-ats-classic-ar.pdf"],
    ["modern-sidebar", "ar", "/tmp/test-sidebar-ar.pdf"],
    ["corporate", "en", "/tmp/test-corporate-en.pdf"],
  ];

  for (const [tid, lang, file] of cases) {
    const t0 = Date.now();
    const b64 = await page.evaluate(
      (arg) => window.__cvExportPdf(arg.tid, arg.lang),
      { tid, lang }
    );
    writeFileSync(file, Buffer.from(b64, "base64"));
    console.log(`OK ${tid}/${lang} -> ${file} (${(b64.length / 1024).toFixed(0)}KB b64, ${Date.now() - t0}ms)`);
  }

  // ---- multi-page test: inflate the CV with 12 experiences ----
  await page.evaluate((s) => {
    const long = structuredClone(s);
    const base = long.state.data.experience[0];
    long.state.data.experience = Array.from({ length: 12 }, (_, i) => ({
      ...base,
      id: `exp${i}`,
      position: { ar: `منصب رقم ${i + 1}`, en: `Role number ${i + 1}` },
    }));
    localStorage.setItem("cv-studio-data-v1", JSON.stringify(long));
  }, STATE);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const b64Long = await page.evaluate(() => window.__cvExportPdf("ats-modern", "ar"));
  writeFileSync("/tmp/test-long-ar.pdf", Buffer.from(b64Long, "base64"));
  console.log(`OK ats-modern(ar, 12 jobs) -> /tmp/test-long-ar.pdf (${(b64Long.length / 1024).toFixed(0)}KB b64)`);

  await browser.close();
  console.log("E2E CLIENT PDF OK");
};

run().catch((e) => {
  console.error("E2E FAILED:", e);
  process.exit(1);
});
