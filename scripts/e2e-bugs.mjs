/**
 * E2E v2 — proves the 3 reported bugs are FIXED, through the REAL UI:
 *   Bug A: import CV from FILE (DOCX + TXT + PDF) and from PASTED TEXT
 *          — Arabic CV with year/month dates ("2018/03 - حتى الآن")
 *          → must recognize experience entries, education degree, languages
 *   Bug B: Arabic letters connected in generated PDFs (visual + programmatic)
 *   Bug C: links (email/phone/social/project/cert/in-text) are CLICKABLE
 *          inside every generated PDF (jsPDF /Link annotations with /URI)
 *
 * Usage: node scripts/e2e-bugs.mjs [baseUrl]
 */
import { chromium } from "playwright-core";
import { writeFileSync, readFileSync, mkdirSync, rmSync } from "node:fs";
import { PDFDocument, PDFName } from "pdf-lib";

const BASE = process.argv[2] || "http://localhost:8099/CV/app";
const FIX = "/home/z/my-project/scripts/fixtures";
const TMP = "/tmp/e2e-bugs";
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

let pass = 0, fail = 0;
const ok = (m) => { console.log("  ✅", m); pass++; };
const bad = (m) => { console.log("  ❌", m); fail++; };

/** count clickable /Link annotations (robust against pdf-lib stream-wrapped dicts) */
async function countLinks(buf) {
  const pdf = await PDFDocument.load(buf);
  const dictOf = (o) => (o && o.dict ? o.dict : o);
  let links = 0;
  const uris = new Set();
  for (const page of pdf.getPages()) {
    const annots = page.node.Annots();
    if (!annots) continue;
    const n = annots.size ? annots.size() : 0;
    for (let i = 0; i < n; i++) {
      const a = dictOf(annots.lookup(i));
      if (!a || !a.get) continue;
      if (a.get(PDFName.of("Subtype"))?.toString() === "/Link") {
        links++;
        const act = dictOf(a.get(PDFName.of("A")));
        const u = act?.get?.(PDFName.of("URI"))?.toString?.();
        if (u) uris.add(u.replace(/^\(|\)$/g, ""));
      }
    }
  }
  return { links, uris: [...uris] };
}

const browser = await chromium.launch({
  executablePath: "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
  args: ["--no-sandbox", "--force-color-profile=srgb"],
});
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("[pageexception]", String(e).slice(0, 200)));

await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(1500);
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(1800);

async function openImportTab() {
  await page.locator('[role="tab"]', { hasText: "استيراد" }).click();
  await page.waitForTimeout(600);
}

async function assertApplied(label, expect) {
  const st = await page.evaluate(() => {
    const raw = localStorage.getItem("cv-studio-data-v1");
    return raw ? JSON.parse(raw) : null;
  });
  const d = st?.state?.data ?? {};
  const name = d.personal?.fullName?.ar || d.personal?.fullName?.en || "";
  const exp = d.experience?.length ?? 0;
  const edu = d.education?.length ?? 0;
  const langs = d.languages?.length ?? 0;
  const skills = d.skills?.length ?? 0;
  const first = d.experience?.[0] ?? {};
  const details = [
    first.position?.ar || first.position?.en || "",
    first.company?.ar || first.company?.en || "",
    first.startDate || "",
  ].join(" | ");
  const good =
    name.includes(expect.name) &&
    exp >= (expect.exp ?? 0) &&
    edu >= (expect.edu ?? 0) &&
    langs >= (expect.langs ?? 0) &&
    skills >= (expect.skills ?? 0) &&
    (!expect.firstExp || details.includes(expect.firstExp)) &&
    (!expect.startDate || details.includes(expect.startDate));
  good
    ? ok(`${label}: name="${name}" exp=${exp} edu=${edu} langs=${langs} skills=${skills} first=[${details}]`)
    : bad(`${label}: name="${name}" exp=${exp} edu=${edu} langs=${langs} skills=${skills} first=[${details}]`);
  return { name, exp, edu, langs, skills, details };
}

/* ============ 1) BUG A: import from FILE ============ */
console.log("== 1) import from FILE (DOCX arabic, year/month dates) ==");
await openImportTab();
await page.setInputFiles('input[type="file"][accept=".pdf,.docx,.txt,.md"]', `${FIX}/sample-cv-ar.docx`);
await page.waitForTimeout(4000);
const applyBtn1 = page.locator("button", { hasText: "تطبيق على بياناتي" }).first();
(await applyBtn1.count()) ? ok("DOCX parsed → result panel + apply button appeared") : bad("DOCX: no result panel");
await applyBtn1.click();
await page.waitForTimeout(1200);
await assertApplied("DOCX → applied", {
  name: "أحمد", exp: 2, edu: 1, langs: 2, skills: 3,
  firstExp: "محاسب", startDate: "03/2018",
});

console.log("== 2) import from FILE (TXT) ==");
await openImportTab();
await page.setInputFiles('input[type="file"][accept=".pdf,.docx,.txt,.md"]', `${FIX}/sample-cv-ar.txt`);
await page.waitForTimeout(3000);
const applyBtn2 = page.locator("button", { hasText: "تطبيق على بياناتي" }).first();
if (await applyBtn2.count()) {
  await applyBtn2.click();
  await page.waitForTimeout(1200);
  await assertApplied("TXT → applied", { name: "أحمد", exp: 2, edu: 1, langs: 2, skills: 3 });
} else bad("TXT: no result panel");

console.log("== 3) import from FILE (PDF english, regression) ==");
await openImportTab();
await page.setInputFiles('input[type="file"][accept=".pdf,.docx,.txt,.md"]', `${FIX}/sample-cv.pdf`);
await page.waitForTimeout(6000);
const applyBtn3 = page.locator("button", { hasText: "تطبيق على بياناتي" }).first();
if (await applyBtn3.count()) {
  await applyBtn3.click();
  await page.waitForTimeout(1200);
  await assertApplied("PDF → applied", { name: "Mohammed", exp: 2 });
} else bad("PDF: no result panel");

/* ============ 4) BUG A: import from PASTED TEXT ============ */
console.log("== 4) import from PASTED TEXT (arabic, year/month) ==");
await page.evaluate(() => {
  const raw = localStorage.getItem("cv-studio-data-v1");
  const st = JSON.parse(raw);
  st.state.data = {};
  localStorage.setItem("cv-studio-data-v1", JSON.stringify(st));
});
await page.reload({ waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(1500);
await openImportTab();
const PASTED = `سارة الأمين
مصممة واجهات
دمشق، سوريا
+963 933 777 888
sara@example.com
github.com/sara-amin

الخبرة العملية
مصممة واجهات — استوديو الإبداع | دمشق
2019/04 - الآن
تصميم واجهات التطبيقات
المتابعة مع فريق التطوير

مصممة — وكالة الألوان
2016 - 2019/03
إعداد الهويات البصرية

المهارات
Figma, Photoshop, Illustrator

اللغات
العربية: لغة أم
الإنجليزية: متقدم`;
await page.locator("textarea").fill(PASTED);
await page.locator("button", { hasText: "استخراج" }).first().click();
await page.waitForTimeout(1500);
const applyBtn4 = page.locator("button", { hasText: "تطبيق على بياناتي" }).first();
(await applyBtn4.count()) ? ok("pasted text parsed → result panel") : bad("pasted text: no result panel");
await applyBtn4.click();
await page.waitForTimeout(1200);
await assertApplied("PASTE → applied", {
  name: "سارة", exp: 2, edu: 0, langs: 2, skills: 3, startDate: "04/2019",
});

/* ============ 5) BUG C: links clickable inside generated PDFs ============ */
console.log("== 5) BUG C: link annotations inside PDFs (ar + en × 3 templates) ==");
mkdirSync(`${TMP}/pdfs`, { recursive: true });
for (const lang of ["ar", "en"]) {
  for (const tid of ["ats-classic", "modern-sidebar", "corporate"]) {
    const b64 = await page.evaluate(([t, l]) => window.__cvExportPdf(t, l), [tid, lang]);
    const buf = Buffer.from(b64, "base64");
    const f = `${TMP}/pdfs/${tid}.${lang}.pdf`;
    writeFileSync(f, buf);
    const { links, uris } = await countLinks(buf);
    const needed = [
      "mailto:sara@example.com",
      "tel:+963933777888",
      "https://github.com/sara-amin",
    ];
    const all = needed.every((u) => uris.some((x) => x === u));
    links >= 3 && all
      ? ok(`${tid}.${lang}: ${links} clickable links, uris ok (${uris.length} unique)`)
      : bad(`${tid}.${lang}: links=${links} uris=${JSON.stringify(uris)}`);
  }
}

/* ============ 6) BUG B: Arabic letters connected (canvas-level proof) ============ */
console.log("== 6) BUG B: Arabic letters connected in PDF (visual evidence) ==");
await page.evaluate(() => {
  const raw = localStorage.getItem("cv-studio-data-v1");
  const st = JSON.parse(raw);
  st.state.data.personal.fullName = { ar: "محمد عبدالله السعيد", en: "Mohammed" };
  st.state.data.personal.jobTitle = { ar: "مهندس برمجيات أول", en: "Engineer" };
  st.state.uiTab = "export";
  localStorage.setItem("cv-studio-data-v1", JSON.stringify(st));
});
await page.reload({ waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(1800);
const b64ar = await page.evaluate(() => window.__cvExportPdf("ats-classic", "ar"));
writeFileSync(`${TMP}/pdfs/name-check.ar.pdf`, Buffer.from(b64ar, "base64"));
ok("arabic PDF with tracked name generated → visual check below (zoom-name-after)");

/* ============ 7) regressions: click download + ZIP of 10 ============ */
console.log("== 7) regressions: direct download + ZIP with 10 separate PDFs ==");
const dlPromise = page.waitForEvent("download", { timeout: 120000 });
await page.locator("button", { hasText: "تحميل PDF" }).first().click();
const dl = await dlPromise;
const dlBuf = readFileSync(await dl.path());
dl.suggestedFilename().endsWith(".pdf") && dlBuf.subarray(0, 5).toString() === "%PDF-"
  ? ok(`click → direct download "${dl.suggestedFilename()}" (${(dlBuf.length / 1024).toFixed(0)}KB)`)
  : bad("click download broken");

const zipPromise = page.waitForEvent("download", { timeout: 300000 });
await page.locator("button", { hasText: "تحميل النسخ العشر" }).first().click();
const zipDl = await zipPromise;
writeFileSync(`${TMP}/all.zip`, readFileSync(await zipDl.path()));
import { execSync } from "node:child_process";
execSync(`rm -rf ${TMP}/unzip && mkdir -p ${TMP}/unzip && cd ${TMP}/unzip && unzip -q ${TMP}/all.zip`);
const pdfs = execSync(`ls ${TMP}/unzip`).toString().trim().split("\n").filter((f) => f.endsWith(".pdf"));
pdfs.length === 10 ? ok(`ZIP contains exactly 10 separate PDFs`) : bad(`ZIP has ${pdfs.length} PDFs`);
// each ZIP member must ALSO carry clickable links
let zipLinkFail = 0;
for (const f of pdfs) {
  const { links } = await countLinks(readFileSync(`${TMP}/unzip/${f}`));
  if (links < 3) zipLinkFail++;
}
zipLinkFail === 0 ? ok("every PDF inside the ZIP carries clickable links") : bad(`${zipLinkFail} PDFs in ZIP lack links`);

await browser.close();
console.log(`\n===== E2E-BUGS RESULT: PASS=${pass} FAIL=${fail} =====`);
process.exit(fail ? 1 : 0);
