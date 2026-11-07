/** Build a test payload.json from the sample CV (all templates). */
import { writeFileSync } from "node:fs";
import { sampleCV } from "../src/lib/cv/sample";

const payload = {
  data: sampleCV(),
  lang: "ar",
  templates: "all" as const,
  accent: "#0f766e",
  showPhoto: false,
  font: "modern" as const,
};
writeFileSync("/tmp/cv-payload.json", JSON.stringify(payload), "utf8");
console.log("payload written");
