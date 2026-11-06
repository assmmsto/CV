/** Test parse.ts bilingual heuristics with text from a real generated CV PDF. */
import { execSync } from "node:child_process";
import { parseCVText } from "../src/lib/cv/parse";

const raw = execSync("pdftotext /tmp/cv-out/08.pdf -").toString();
console.log("--- extracted text (first 300 chars) ---");
console.log(raw.slice(0, 300));

const result = parseCVText(raw);
const p = result.data.personal ?? { fullName: { ar: "", en: "" }, email: "", phone: "", summary: { ar: "", en: "" } } as never;
console.log("recognized fields:", result.recognized.join(", "));

const checks: Array<[string, boolean, string]> = [
  ["fullName.ar detected", (p.fullName.ar ?? "").includes("الخالدي") || (p.fullName.ar ?? "").length > 3, `ar="${p.fullName.ar}"`],
  ["fullName.en detected", (p.fullName.en ?? "").length > 3, `en="${p.fullName.en}"`],
  ["email detected", p.email.includes("@example.com"), p.email],
  ["phone detected", p.phone.replace(/\s/g, "").length >= 10, p.phone],
  ["summary detected", (p.summary.ar ?? "").length > 20 || (p.summary.en ?? "").length > 20, `${(p.summary.ar ?? "").length}/${(p.summary.en ?? "").length} chars`],
  ["experience items", (result.data.experience ?? []).length >= 1, `${(result.data.experience ?? []).length} items`],
  ["education items", (result.data.education ?? []).length, `${(result.data.education ?? []).length} items`],
  ["skills items", (result.data.skills ?? []).length, `${(result.data.skills ?? []).length} items`],
];

let pass = 0, fail = 0;
for (const [label, ok, detail] of checks) {
  if (ok) { console.log(`  ✅ ${label} → ${detail}`); pass++; }
  else { console.log(`  ❌ ${label} → ${detail}`); fail++; }
}
console.log(`\nPARSE TEST: PASS=${pass} FAIL=${fail}`);
process.exit(fail > 0 ? 1 : 0);
