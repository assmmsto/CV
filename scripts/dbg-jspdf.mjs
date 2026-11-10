import { chromium } from "playwright-core";
import { PDFDocument } from "pdf-lib";

const browser = await chromium.launch({
  executablePath: "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
  args: ["--no-sandbox"],
});
const page = await (await browser.newContext()).newPage();
await page.goto("http://localhost:8099/CV/app/", { waitUntil: "networkidle", timeout: 60000 });
const b64 = await page.evaluate(async () => {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  doc.text("hello", 20, 20);
  doc.link(10, 10, 50, 10, { url: "https://example.com/a" });
  doc.addPage();
  doc.text("page2", 20, 20);
  doc.link(15, 15, 40, 8, { url: "https://example.com/b" });
  const buf = doc.output("datauristring");
  return buf.split(",")[1];
});
const pdf = await PDFDocument.load(Buffer.from(b64, "base64"));
for (const [i, p] of pdf.getPages().entries()) {
  const annots = p.node.Annots();
  const n = annots ? (annots.size ? annots.size() : 0) : 0;
  const uris = [];
  for (let k = 0; k < n; k++) {
    const a = annots.lookup(k);
    uris.push(a?.get?.("A")?.get?.("URI")?.toString?.());
  }
  console.log(`page ${i + 1}: annots=${n} uris=${JSON.stringify(uris)}`);
}
await browser.close();
