
import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome", args: ["--no-sandbox"] });
const page = await (await browser.newContext()).newPage();
const BASE = "http://localhost:8078/CV/app";
await page.goto(BASE, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.setItem("cv-studio-data-v1", JSON.stringify({ state: { data: { personal: { fullName: { ar: "فحص الاسم", en: "Name Test" }, jobTitle: { ar: "", en: "" }, city: { ar: "", en: "" }, country: { ar: "", en: "" }, summary: { ar: "", en: "" } } }, uiLang: "ar", cvLang: "ar", uiTab: "data" }, version: 1 })));
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const stored = await page.evaluate(() => localStorage.getItem("cv-studio-data-v1"));
console.log("stored-after-reload:", (stored || "NULL").slice(0, 160));
console.log("body-has-name:", await page.evaluate(() => document.body.innerText.includes("فحص الاسم")));
await browser.close();
