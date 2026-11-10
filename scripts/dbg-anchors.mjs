import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";

const browser = await chromium.launch({
  executablePath: "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
  args: ["--no-sandbox"],
});
const page = await (await browser.newContext()).newPage();
page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 200)));

const PHOTO = "data:image/jpeg;base64," + readFileSync("/home/z/my-project/scripts/fixtures/photo.jpg").toString("base64");
const STATE = {
  state: {
    data: {
      personal: {
        fullName: { ar: "محمد عبدالله", en: "Mohammed" }, jobTitle: { ar: "مهندس", en: "Engineer" },
        email: "m@example.com", phone: "+963 944 555", city: { ar: "دمشق", en: "Damascus" }, country: { ar: "سوريا", en: "Syria" },
        website: "www.mohammed.dev", linkedin: "linkedin.com/in/mohammed", github: "github.com/mohammed", photo: PHOTO,
        summary: { ar: "ملخص", en: "Summary" },
      },
      experience: [{ id: "e1", company: { ar: "ش", en: "C" }, position: { ar: "م", en: "P" }, city: { ar: "", en: "" }, startDate: "2020", endDate: "", current: true, description: "رابط github.com/mohammed في النص" }],
      education: [], skills: [{ id: "s1", name: { ar: "React", en: "React" }, level: 5 }],
      languages: [], certifications: [{ id: "c1", name: { ar: "AWS", en: "AWS" }, issuer: { ar: "A", en: "A" }, date: "2022", url: "https://aws.amazon.com/v" }],
      projects: [{ id: "p1", name: { ar: "منصة", en: "Plat" }, description: { ar: "", en: "" }, url: "https://jobs.example.com", technologies: { ar: "", en: "" } }],
      customSections: [],
    },
    uiLang: "ar", cvLang: "ar", templateId: "ats-classic", accent: "#0f766e", showPhoto: true, fontChoice: "modern", uiTab: "export",
  },
  version: 1,
};

await page.goto("http://localhost:8099/CV/app/", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1500);
await page.evaluate((s) => localStorage.setItem("cv-studio-data-v1", JSON.stringify(s)), STATE);
await page.reload({ waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2500);
const hook = await page.evaluate(() => typeof window.__cvExportPdf);
console.log("hook:", hook);

// instrument: intercept generateTemplatePdf internals? simpler: replicate the DOM probe by
// calling the export and checking whether jsPDF got links — instead, patch-instrument
// the sheet BEFORE capture is impossible; so probe: does an offscreen render contain anchors?
const probe = await page.evaluate(async () => {
  // run the real export but also inspect the DOM right before capture is not possible;
  // instead just export and grab the blob
  const b64 = await window.__cvExportPdf("ats-classic", "ar");
  return b64.slice(0, 100);
});
console.log("export ok, prefix:", probe.slice(0, 30));

// Now test: does the module code see anchors? Build a probe sheet manually with same template:
const anchorCount = await page.evaluate(async () => {
  const { createRoot } = await import("react-dom/client");
  // Instead of re-rendering manually, use the visible PrintPortal? Not rendered on export tab.
  // Direct approach: temporarily patch html2canvas capture by exporting again and reading window.__lastAnchorDebug
  return -1;
});
await browser.close();
