import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";

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
        email: "m@example.com", phone: "+963944555", city: { ar: "دمشق", en: "Damascus" }, country: { ar: "سوريا", en: "Syria" },
        website: "www.mohammed.dev", linkedin: "linkedin.com/in/mohammed", github: "github.com/mohammed", photo: PHOTO,
        summary: { ar: "ملخص مع github.com/mohammed", en: "Summary" },
      },
      experience: [{ id: "e1", company: { ar: "ش", en: "C" }, position: { ar: "م", en: "P" }, city: { ar: "", en: "" }, startDate: "2020", endDate: "", current: true, description: "زيارة github.com/mohammed" }],
      education: [], skills: [{ id: "s1", name: { ar: "React", en: "React" }, level: 5 }],
      languages: [], certifications: [{ id: "c1", name: { ar: "AWS", en: "AWS" }, issuer: { ar: "A", en: "A" }, date: "2022", url: "https://aws.amazon.com/v" }],
      projects: [{ id: "p1", name: { ar: "منصة", en: "Plat" }, description: { ar: "", en: "" }, url: "https://jobs.example.com", technologies: { ar: "", en: "" } }],
      customSections: [],
    },
    uiLang: "ar", cvLang: "ar", templateId: "ats-classic", accent: "#0f766e", showPhoto: true, fontChoice: "modern", uiTab: "preview",
  },
  version: 1,
};

await page.goto("http://localhost:8099/CV/app/", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1500);
await page.evaluate((s) => localStorage.setItem("cv-studio-data-v1", JSON.stringify(s)), STATE);
await page.reload({ waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2500);

const info = await page.evaluate(() => {
  const q = (sel) => Array.from(document.querySelectorAll(sel));
  const links = q(".print-root a[href], .cv-sheet a[href]");
  return {
    anchors: links.length,
    hrefs: links.slice(0, 12).map((a) => a.getAttribute("href")),
    sampleText: links.slice(0, 3).map((a) => a.textContent?.trim().slice(0, 30)),
  };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
