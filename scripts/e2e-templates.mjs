/**
 * DEEP TEMPLATE-PROOF E2E — redesigned templates v1.3
 * Every template must PROVE compliance with its real-world standard:
 *  1) 20 PDFs (10 templates × ar/en) — valid, with correct clickable /Link URIs
 *  2) Templates switched by REAL user clicks on the design-tab cards (no reloads)
 *  3) DOM assertions per template (photo rule + standard-specific structure)
 *  4) Arabic shaping guard: zero letter-spacing on Arabic text in every template
 *  5) Evidence: PDFs + full-page shots (ar) + high-res name crops + report.json
 */
import { chromium } from "playwright-core";
import { writeFileSync, readFileSync, mkdirSync, rmSync } from "node:fs";
import http from "node:http";
import { join, normalize, extname } from "node:path";
import { execSync } from "node:child_process";

const PORT = 8101;
const BASE = `http://localhost:${PORT}/CV/app/`;
const ROOT = "/home/z/my-project/docs";
const EVID = "/home/z/my-project/scripts/proof/templates";
rmSync(EVID, { recursive: true, force: true });
mkdirSync(`${EVID}/pdfs`, { recursive: true });
mkdirSync(`${EVID}/shots`, { recursive: true });
mkdirSync(`${EVID}/name-crops`, { recursive: true });

/* ---------------- mini GitHub-Pages-like static server ---------------- */
const MIME = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".txt": "text/plain", ".webmanifest": "application/manifest+json", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || "/").split("?")[0]);
  if (p.startsWith("/CV/")) p = p.slice(3);
  if (p.endsWith("/")) p += "index.html";
  const file = normalize(join(ROOT, p));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  try {
    res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream" });
    res.end(readFileSync(file));
  } catch {
    res.writeHead(404); res.end("nf");
  }
});
await new Promise((r) => server.listen(PORT, r));

/* ---------------- sample state (photo + 5 links + Arabic) ---------------- */
const PHOTO = "data:image/jpeg;base64," + readFileSync("/home/z/my-project/scripts/fixtures/photo.jpg").toString("base64");
const mkState = (cvLang) => ({
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
        { id: "exp1", company: { ar: "شركة التقنية المتقدمة", en: "Advanced Tech Co" }, position: { ar: "مهندس برمجيات أول", en: "Senior Software Engineer" }, city: { ar: "دمشق", en: "Damascus" }, startDate: "03/2020", endDate: "", current: true, description: "قيادة فريق تطوير من 6 مهندسين\nتحسين أداء المنصة بنسبة 40%" },
        { id: "exp2", company: { ar: "مصارف الشام", en: "Levant Banks" }, position: { ar: "مطور تطبيقات", en: "Application Developer" }, city: { ar: "حلب", en: "Aleppo" }, startDate: "06/2016", endDate: "02/2020", current: false, description: "تطوير أنظمة مصرفية إلكترونية" },
      ],
      education: [
        { id: "edu1", institution: { ar: "جامعة دمشق", en: "Damascus University" }, degree: { ar: "ماجستير", en: "MSc" }, field: { ar: "هندسة برمجيات", en: "Software Engineering" }, startDate: "2012", endDate: "2014", current: false, grade: { ar: "ممتاز", en: "Excellent" } },
      ],
      skills: [
        { id: "s1", name: { ar: "React / Next.js", en: "React / Next.js" }, level: 5 },
        { id: "s2", name: { ar: "Node.js", en: "Node.js" }, level: 4 },
        { id: "s3", name: { ar: "قواعد البيانات", en: "Databases" }, level: 4 },
        { id: "s4", name: { ar: "DevOps", en: "DevOps" }, level: 3 },
      ],
      languages: [
        { id: "l1", name: { ar: "العربية", en: "Arabic" }, level: "native" },
        { id: "l2", name: { ar: "الإنجليزية", en: "English" }, level: "fluent" },
      ],
      certifications: [
        { id: "c1", name: { ar: "AWS Solutions Architect", en: "AWS Solutions Architect" }, issuer: { ar: "Amazon", en: "Amazon" }, date: "2022", url: "" },
      ],
      projects: [
        { id: "p1", name: { ar: "منصة التوظيف الذكية", en: "Smart Jobs Platform" }, description: { ar: "منصة توظيف تجمع الوظائف من عشرات المصادر", en: "Aggregates jobs from dozens of sources" }, technologies: { ar: "Next.js, PostgreSQL", en: "Next.js, PostgreSQL" }, url: "https://github.com/mohammed/jobs" },
      ],
      customSections: [],
    },
    uiLang: "ar", cvLang, templateId: "ats-classic",
    accent: "#0f766e", showPhoto: true, fontChoice: "modern", uiTab: "preview",
  },
  version: 1,
});

const ALL = [
  "ats-classic", "ats-modern", "executive", "minimal-pro", "modern-sidebar",
  "corporate", "timeline", "elegant-dark", "compact-pro", "contemporary",
];
const STD = {
  "ats-classic": "harvard", "ats-modern": "ats-proof", "executive": "hbs-executive",
  "minimal-pro": "google-simple", "modern-sidebar": "modern-sidebar", "corporate": "indeed",
  "timeline": "career-timeline", "elegant-dark": "europass", "compact-pro": "fresh-graduate",
  "contemporary": "creative",
};
const NAME_AR = {
  "ats-classic": "هارفارد الرسمي", "ats-modern": "متوافق الفرز الآلي", "executive": "التنفيذي",
  "minimal-pro": "جوجل البسيط", "modern-sidebar": "الشريط الحديث", "corporate": "إنديد الرسمي",
  "timeline": "المسار المهني", "elegant-dark": "يوروباس المعتمد", "compact-pro": "الخريج الجديد",
  "contemporary": "الإبداعي",
};
const STRICT_NO_PHOTO = new Set(["ats-classic", "ats-modern", "executive"]);

let pass = 0, fail = 0;
const ok = (m) => { console.log("  ✅", m); pass++; };
const bad = (m) => { console.log("  ❌", m); fail++; };

const browser = await chromium.launch({
  executablePath: "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
  args: ["--no-sandbox", "--force-color-profile=srgb"],
});
const ctx = await browser.newContext({ viewport: { width: 1200, height: 1000 }, acceptDownloads: true });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("[pageexception]", String(e).slice(0, 200)));

const ctx3 = await browser.newContext({ viewport: { width: 1200, height: 1000 }, deviceScaleFactor: 3 });
const page3 = await ctx3.newPage();

const report = {};

/** Switch template like a real user: القوالب tab → click card → المعاينة tab. */
async function switchTemplate(tid) {
  await page.locator('[role="tab"]', { hasText: "القوالب" }).click();
  await page.locator('button[aria-pressed]', { hasText: NAME_AR[tid] }).first().click();
  await page.locator('[role="tab"]', { hasText: "المعاينة" }).click();
  await page.waitForFunction(
    (std) => { const s = document.querySelector(".cv-sheet [data-std]"); return !!s && s.getAttribute("data-std") === std; },
    STD[tid], { timeout: 15000 }
  );
  await page.waitForTimeout(300);
}

async function domChecks(tid, lang) {
  const name = lang === "ar" ? "محمد عبدالله السعيد" : "Mohammed Abdullah Al-Saeed";
  return page.evaluate(({ tid, lang, name, strict }) => {
    const sheet = document.querySelector(".cv-sheet");
    if (!sheet) return { error: "no .cv-sheet" };
    const out = {};
    const h1 = sheet.querySelector("h1");
    out.nameOk = !!h1 && (h1.textContent || "").trim().length > 4;
    const links = Array.from(sheet.querySelectorAll("a[href]")).map((a) => a.getAttribute("href") || "");
    out.links = links;
    out.mailto = links.some((h) => h.startsWith("mailto:"));
    out.tel = links.some((h) => h.startsWith("tel:"));
    out.https = links.some((h) => h.startsWith("https://"));
    out.imgCount = sheet.querySelectorAll("img").length;
    const AR = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    let lsViolations = 0;
    for (const el of sheet.querySelectorAll("*")) {
      const hasAr = Array.from(el.childNodes).some((n) => n.nodeType === 3 && AR.test(n.textContent || ""));
      if (!hasAr) continue;
      const ls = getComputedStyle(el).letterSpacing;
      if (ls && ls !== "0px" && ls !== "normal") lsViolations++;
    }
    out.lsViolations = lsViolations;
    const h2s = Array.from(sheet.querySelectorAll("h2"));
    const idx = (t) => h2s.findIndex((h) => (h.textContent || "").includes(t));
    if (tid === "compact-pro") {
      const eduIdx = idx(lang === "ar" ? "التعليم" : "Education");
      const expIdx = idx(lang === "ar" ? "الخبرات" : "Experience");
      out.eduFirst = eduIdx >= 0 && expIdx >= 0 && eduIdx < expIdx;
      out._dbg = { eduIdx, expIdx, h2s: h2s.slice(0, 6).map((h) => h.textContent?.trim()) };
    }
    if (tid === "elegant-dark") {
      out.navyBar = h2s.some((h) => getComputedStyle(h).backgroundColor === "rgb(31, 78, 121)");
      out.cefrTable = (sheet.textContent || "").includes(lang === "ar" ? "لغة أم" : "Native");
    }
    if (tid === "corporate") {
      const header = sheet.querySelector("header");
      out.band = !!header && getComputedStyle(header).backgroundColor === "rgb(15, 118, 110)";
    }
    if (tid === "ats-classic") out.centered = !!h1 && getComputedStyle(h1).textAlign === "center";
    if (tid === "ats-modern") {
      /* inline style is zoom-independent (computed border widths scale with the preview zoom) */
      out.strongHead = h2s.some((h) => (h.style.borderBottomWidth || "") === "2px");
    }
    if (tid === "executive") {
      out.competencies2col = Array.from(sheet.querySelectorAll("*")).some((el) => {
        const g = getComputedStyle(el).gridTemplateColumns;
        return /^\d+(\.\d+)?px \d+(\.\d+)?px$/.test(g);
      });
    }
    if (tid === "minimal-pro") out.lightHead = !!h1 && parseInt(getComputedStyle(h1).fontWeight) <= 350;
    if (tid === "modern-sidebar") out.darkSide = Array.from(sheet.querySelectorAll("aside")).some((a) => getComputedStyle(a).backgroundColor === "rgb(30, 41, 59)");
    if (tid === "timeline") {
      const dots = Array.from(sheet.querySelectorAll("*")).filter((el) => el.style && el.style.borderRadius === "99px" && /(#0f766e|rgb\(15, 118, 110\))/.test(el.style.background + " " + el.style.boxShadow)).length;
      out.timelineDots = dots >= 3;
      out.dotCount = dots;
    }
    if (tid === "contemporary") {
      const header = sheet.querySelector("header");
      out.gradient = !!header && getComputedStyle(header).backgroundImage.includes("linear-gradient");
    }
    out.photoRule = strict ? out.imgCount === 0 : out.imgCount >= 1;
    return out;
  }, { tid, lang, name, strict: STRICT_NO_PHOTO.has(tid) });
}

for (const lang of ["ar", "en"]) {
  console.log(`\n════ LANG = ${lang.toUpperCase()} ════`);
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate((s) => localStorage.setItem("cv-studio-data-v1", JSON.stringify(s)), mkState(lang));
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".cv-sheet", { state: "attached", timeout: 20000 });
  await page.waitForTimeout(600);

  for (let i = 0; i < ALL.length; i++) {
    const tid = ALL[i];
    report[`${tid}:${lang}`] = {};
    try {
      await switchTemplate(tid);
      const d = await domChecks(tid, lang);
      report[`${tid}:${lang}`].dom = d;
      if (d.error) { bad(`${tid} ${lang}: DOM ${d.error}`); continue; }
      d.nameOk ? ok(`${tid}/${lang}: name renders`) : bad(`${tid}/${lang}: name missing`);
      d.mailto && d.tel && d.https ? ok(`${tid}/${lang}: real anchors (mailto+tel+https)`) : bad(`${tid}/${lang}: anchors incomplete`);
      d.photoRule ? ok(`${tid}/${lang}: photo rule (${STRICT_NO_PHOTO.has(tid) ? "strict text-only" : "photo shown"})`) : bad(`${tid}/${lang}: photo rule violated (imgs=${d.imgCount})`);
      if (lang === "ar") d.lsViolations === 0 ? ok(`${tid}/${lang}: zero letter-spacing on Arabic (shaping safe)`) : bad(`${tid}/${lang}: ${d.lsViolations} Arabic letter-spacing violations`);
      const specMap = {
        "ats-classic": "centered", "ats-modern": "strongHead", "executive": "competencies2col",
        "minimal-pro": "lightHead", "modern-sidebar": "darkSide", "corporate": "band",
        "timeline": "timelineDots", "elegant-dark": "navyBar", "compact-pro": "eduFirst", "contemporary": "gradient",
      };
      const specKey = specMap[tid];
      if (specKey && lang === "ar") {
        d[specKey] ? ok(`${tid}/${lang}: standard check «${specKey}» ✓`) : bad(`${tid}/${lang}: standard check «${specKey}» FAILED ${d._dbg ? JSON.stringify(d._dbg) : ""}`);
      }
      if (tid === "elegant-dark" && lang === "ar") {
        d.cefrTable ? ok(`${tid}/${lang}: CEFR language table present`) : bad(`${tid}/${lang}: CEFR table missing`);
      }

      /* PDF via the app hook (renders offscreen from the store) */
      const b64 = await page.evaluate((t) => window.__cvExportPdf(t, undefined), tid);
      const buf = Buffer.from(b64, "base64");
      const file = `${EVID}/pdfs/${String(i + 1).padStart(2, "0")}-${tid}-${lang}.pdf`;
      writeFileSync(file, buf);
      const magic = buf.subarray(0, 5).toString() === "%PDF-";
      const pages = (buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
      const raw = buf.toString("latin1");
      const uris = [];
      const re = /\/URI\s*\(([^)]*)\)/g;
      let m;
      while ((m = re.exec(raw))) uris.push(m[1]);
      const hasMail = uris.some((u) => u.startsWith("mailto:mohammed@example.com"));
      const hasTel = uris.some((u) => u.startsWith("tel:+963944555123"));
      const hasHttp = uris.some((u) => u.includes("linkedin.com/in/mohammed"));
      report[`${tid}:${lang}`].pdf = { size: buf.length, pages, links: uris.length, hasMail, hasTel, hasHttp, uris };
      magic && buf.length > 15000 ? ok(`${tid}/${lang}: PDF ${(buf.length / 1024).toFixed(0)}KB, ${pages} page(s)`) : bad(`${tid}/${lang}: PDF invalid (magic=${magic}, ${buf.length}B)`);
      uris.length >= 3 ? ok(`${tid}/${lang}: ${uris.length} clickable /Link annotations`) : bad(`${tid}/${lang}: only ${uris.length} link annotations`);
      hasMail && hasTel && hasHttp ? ok(`${tid}/${lang}: links carry correct mailto/tel/linkedin URIs`) : bad(`${tid}/${lang}: wrong URIs: ${JSON.stringify(uris.slice(0, 6))}`);

      if (lang === "ar") {
        await page.locator(".cv-sheet").first().screenshot({ path: `${EVID}/shots/${tid}-ar.png` });
      }
    } catch (e) {
      bad(`${tid}/${lang}: threw ${String(e).slice(0, 160)}`);
    }
  }
}

/* -- high-res Arabic name crops (letter-connection evidence) -- */
console.log("\n== Arabic name crops (deviceScaleFactor=3) ==");
await page3.goto(BASE, { waitUntil: "networkidle" });
await page3.evaluate((s) => localStorage.setItem("cv-studio-data-v1", JSON.stringify(s)), mkState("ar"));
await page3.reload({ waitUntil: "networkidle" });
await page3.waitForSelector(".cv-sheet", { state: "attached", timeout: 20000 });
await page3.waitForTimeout(800);
for (const tid of ALL) {
  await page3.locator('[role="tab"]', { hasText: "القوالب" }).click();
  await page3.locator('button[aria-pressed]', { hasText: NAME_AR[tid] }).first().click();
  await page3.locator('[role="tab"]', { hasText: "المعاينة" }).click();
  await page3.waitForFunction(
    (std) => { const s = document.querySelector(".cv-sheet [data-std]"); return !!s && s.getAttribute("data-std") === std; },
    STD[tid], { timeout: 15000 }
  );
  await page3.waitForTimeout(300);
  const h1 = page3.locator(".cv-sheet h1").first();
  const box = await h1.boundingBox();
  if (!box) { bad(`${tid}: no h1 for crop`); continue; }
  await page3.screenshot({
    path: `${EVID}/name-crops/${tid}-ar-name.png`,
    clip: { x: Math.max(0, box.x - 12), y: Math.max(0, box.y - 10), width: Math.min(1150, box.width + 24), height: box.height + 20 },
  });
  ok(`${tid}: name crop saved`);
}

/* -- uniqueness across the 20 PDFs -- */
const uniq = execSync(`md5sum ${EVID}/pdfs/*.pdf | awk '{print $1}' | sort -u | wc -l`).toString().trim();
uniq === "20" ? ok("all 20 PDFs (10 templates × 2 languages) are unique") : bad(`unique PDFs: ${uniq}/20`);

await browser.close();
server.close();
writeFileSync(`${EVID}/report.json`, JSON.stringify(report, null, 2));
console.log(`\n===== TEMPLATE PROOF: PASS=${pass} FAIL=${fail} =====`);
console.log(`evidence → ${EVID}`);
process.exit(fail ? 1 : 0);
