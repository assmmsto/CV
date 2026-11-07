/** Debug photo with a REAL photo: 1) live preview shows photo? 2) PDF has photo pixels? */
import { chromium } from "playwright-core";
import { writeFileSync, readFileSync } from "node:fs";

const PORT = 8077;
const BASE = `http://localhost:${PORT}`;
const PHOTO = "data:image/jpeg;base64," + readFileSync("/tmp/test-photo.jpg").toString("base64");

const STATE = {
  state: {
    data: {
      personal: {
        fullName: { ar: "محمد عبدالله", en: "Mohammed" },
        jobTitle: { ar: "مهندس", en: "Engineer" },
        email: "a@b.c", phone: "123",
        city: { ar: "دمشق", en: "Damascus" }, country: { ar: "", en: "" },
        website: "", linkedin: "", github: "",
        photo: PHOTO,
        summary: { ar: "ملخص قصير", en: "Short summary" },
      },
      experience: [], education: [], skills: [], languages: [],
      certifications: [], projects: [], customSections: [],
    },
    uiLang: "ar", cvLang: "ar", templateId: "corporate",
    accent: "#0f766e", showPhoto: true, fontChoice: "modern", uiTab: "preview",
  },
  version: 1,
};

const browser = await chromium.launch({
  executablePath: "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on("pageerror", (e) => console.log("[pageexception]", String(e).slice(0, 400)));
page.on("console", (m) => { if (m.type() === "error") console.log("[err]", m.text().slice(0, 200)); });

await page.goto(BASE, { waitUntil: "networkidle" });
await page.evaluate((s) => localStorage.setItem("cv-studio-data-v1", JSON.stringify(s)), STATE);
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1000);

await page.screenshot({ path: "/tmp/pdfcheck/live-preview.png" });

const info = await page.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll("img")).map((i) => ({
    w: i.naturalWidth, h: i.naturalHeight, complete: i.complete,
  }));
  return { imgs };
});
console.log("imgs:", JSON.stringify(info.imgs));

const b64 = await page.evaluate(() => window.__cvExportPdf("corporate", "ar"));
writeFileSync("/tmp/pdfcheck/debug-corporate.pdf", Buffer.from(b64, "base64"));
console.log("pdf bytes:", Math.round((b64.length * 3) / 4));

await browser.close();
console.log("DONE");
