import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";

const browser = await chromium.launch({
  executablePath: "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
  args: ["--no-sandbox"],
});
const page = await (await browser.newContext()).newPage();
page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 200)));
page.on("console", (m) => { if (m.type() === "error") console.log("[console.error]", m.text().slice(0, 150)); });

const PHOTO = "data:image/jpeg;base64," + readFileSync("/home/z/my-project/scripts/fixtures/photo.jpg").toString("base64");
const STATE = { state: { data: {
  personal: { fullName: { ar: "محمد عبدالله", en: "Mohammed" }, jobTitle: { ar: "مهندس", en: "Engineer" },
    email: "m@example.com", phone: "+963944555", city: { ar: "دمشق", en: "Damascus" }, country: { ar: "سوريا", en: "Syria" },
    website: "www.mohammed.dev", linkedin: "linkedin.com/in/mohammed", github: "github.com/mohammed", photo: PHOTO,
    summary: { ar: "ملخص", en: "S" } },
  experience: [{ id: "e1", company: { ar: "ش", en: "C" }, position: { ar: "م", en: "P" }, city: { ar: "", en: "" }, startDate: "2020", endDate: "", current: true, description: "github.com/mohammed" }],
  education: [], skills: [{ id: "s1", name: { ar: "React", en: "React" }, level: 5 }], languages: [],
  certifications: [{ id: "c1", name: { ar: "AWS", en: "AWS" }, issuer: { ar: "A", en: "A" }, date: "2022", url: "https://aws.amazon.com/v" }],
  projects: [{ id: "p1", name: { ar: "منصة", en: "Plat" }, description: { ar: "", en: "" }, url: "https://jobs.example.com", technologies: { ar: "", en: "" } }],
  customSections: [] },
  uiLang: "ar", cvLang: "ar", templateId: "ats-classic", accent: "#0f766e", showPhoto: true, fontChoice: "modern", uiTab: "export" }, version: 1 };

await page.goto("http://localhost:8099/CV/app/", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1200);
await page.evaluate((s) => localStorage.setItem("cv-studio-data-v1", JSON.stringify(s)), STATE);
await page.reload({ waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2200);

const out = await page.evaluate(async () => {
  const calls = [];
  const orig = Element.prototype.querySelectorAll;
  Element.prototype.querySelectorAll = function (sel) {
    const r = orig.call(this, sel);
    if (String(sel).includes("href")) calls.push({ sel: String(sel), n: r.length, tag: this.tagName });
    return r;
  };
  const b64 = await window.__cvExportPdf("ats-classic", "ar");
  Element.prototype.querySelectorAll = orig;
  const head = b64.slice(0, 8);
  return { calls, sizeKB: Math.round(b64.length * 3 / 4 / 1024), head };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
