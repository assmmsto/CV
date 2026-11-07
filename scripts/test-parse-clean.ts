/** Test parseCVText: clean EN + AR CVs (buffered dates), inline format, RTL-marks text. */
import { parseCVText } from "../src/lib/cv/parse";

const cleanEn = `Ahmad Mohammad Al-Khalidi
Senior Graphic Designer
ahmad.khalidi@example.com
+963 955 123 456
Damascus, Syria
linkedin.com/in/ahmad-khalidi

PROFESSIONAL SUMMARY
Graphic designer with 8 years of experience in brand identity, print and digital campaigns. Led 120+ projects.

WORK EXPERIENCE
Ibdaa Advertising Agency — Damascus
Senior Graphic Designer
03/2021 - Present
Led a team of 3 designers developing brand identities
Designed 60+ complete corporate identities for startups

Al-Nour Publishing & Ads — Aleppo
Graphic Designer
06/2018 - 02/2021
Designed book covers and periodicals with 40+ published issues

EDUCATION
Damascus University
Bachelor of Graphic Design
2014 - 2018

SKILLS
Adobe Photoshop, Adobe Illustrator, InDesign, Figma, Branding

LANGUAGES
Arabic - Native
English - Advanced

CERTIFICATIONS
Google UX Design Certificate, Google, 2022`;

const cleanAr = `أحمد محمد الخالدي
مصمم جرافيك أول
ahmad.khalidi@example.com
+963 955 123 456
دمشق، سوريا

الملخص المهني
مصمم جرافيك بخبرة 8 سنوات في بناء الهويات البصرية وتصميم المطبوعات والحملات الرقمية.

الخبرات العملية
وكالة إبداع للدعاية والإعلان — دمشق
مصمم جرافيك أول
03/2021 - حتى الآن
قيادة فريق من 3 مصممين لتطوير الهويات البصرية
تصميم أكثر من 60 هوية بصرية كاملة للشركات الناشئة

شركة النور للنشر والإعلان — حلب
مصمم جرافيك
06/2018 - 02/2021
تصميم أغلفة الكتب والمطبوعات الدورية

التعليم
جامعة دمشق
بكالوريوس الفنون التشكيلية - التصميم الجرافيكي
2014 - 2018

المهارات
أدوبي فوتوشوب، أدوبي إليستريتور، إنديزاين، فيجما، الهوية البصرية

اللغات
العربية - اللغة الأم
الإنجليزية - متقدم

الشهادات
Google UX Design Certificate، جوجل، 2022`;

// Format A: date inline with the header line
const inlineAr = `سارة أحمد
مهندسة برمجيات
sara@example.com
+963 999 888 777
الخبرات العملية
مهندسة برمجيات | شركة التقنية المتقدمة | دمشق 05/2020 - حتى الآن
تطوير تطبيقات ويب
مهندس برمجيات | شركة النظم | حلب 01/2018 - 04/2020
صيانة الأنظمة`;

let pass = 0, fail = 0;
function check(label: string, ok: boolean, detail: string) {
  console.log(`  ${ok ? "✅" : "❌"} ${label} → ${detail}`);
  ok ? pass++ : fail++;
}

function t(name: string, text: string, fn: (r: ReturnType<typeof parseCVText>) => void) {
  console.log(`\n===== ${name} =====`);
  const r = parseCVText(text);
  console.log("recognized:", r.recognized.join(", "));
  fn(r);
}

t("EN clean (buffered dates)", cleanEn, (r) => {
  const p = r.data.personal!;
  check("name", (p.fullName?.en || "").length > 3, p.fullName?.en || "∅");
  check("city+country", p.city?.en === "Damascus" && p.country?.en === "Syria", `${p.city?.en}/${p.country?.en}`);
  check("summary", (p.summary?.en || "").length > 20, `${(p.summary?.en || "").length} chars`);
  const ex = r.data.experience ?? [];
  check("experience x2", ex.length === 2, `${ex.length}`);
  check("exp1 company", (ex[0]?.company?.en || "").includes("Ibdaa"), ex[0]?.company?.en || "∅");
  check("exp1 position", (ex[0]?.position?.en || "").includes("Senior"), ex[0]?.position?.en || "∅");
  check("exp1 city", ex[0]?.city?.en === "Damascus", ex[0]?.city?.en || "∅");
  check("exp1 current", ex[0]?.current === true, String(ex[0]?.current));
  check("exp1 desc", (ex[0]?.description?.en || "").includes("Led a team"), `${(ex[0]?.description?.en || "").length} chars`);
  check("exp2 company", (ex[1]?.company?.en || "").includes("Al-Nour"), ex[1]?.company?.en || "∅");
  const ed = r.data.education ?? [];
  check("education", ed.length === 1, `${ed.length}`);
  check("edu institution", (ed[0]?.institution?.en || "").includes("Damascus University"), ed[0]?.institution?.en || "∅");
  check("edu degree", (ed[0]?.degree?.en || "").includes("Bachelor"), ed[0]?.degree?.en || "∅");
  check("skills x5", (r.data.skills ?? []).length === 5, `${(r.data.skills ?? []).length}`);
  const lg = r.data.languages ?? [];
  check("languages x2", lg.length === 2, `${lg.length}`);
  check("lang1 native", lg[0]?.level === "native", lg[0]?.level);
  check("lang2 advanced", lg[1]?.level === "advanced", lg[1]?.level);
  check("certs x1", (r.data.certifications ?? []).length === 1, `${(r.data.certifications ?? []).length}`);
});

t("AR clean (buffered dates)", cleanAr, (r) => {
  const p = r.data.personal!;
  check("name", (p.fullName?.ar || "").includes("الخالدي"), p.fullName?.ar || "∅");
  check("title", (p.jobTitle?.ar || "").includes("مصمم"), p.jobTitle?.ar || "∅");
  check("city+country", (p.city?.ar || "") === "دمشق" && (p.country?.ar || "") === "سوريا", `${p.city?.ar}/${p.country?.ar}`);
  check("summary", (p.summary?.ar || "").length > 20, `${(p.summary?.ar || "").length} chars`);
  const ex = r.data.experience ?? [];
  check("experience x2", ex.length === 2, `${ex.length}`);
  check("exp1 company", (ex[0]?.company?.ar || "").includes("إبداع"), ex[0]?.company?.ar || "∅");
  check("exp1 position", (ex[0]?.position?.ar || "").includes("مصمم"), ex[0]?.position?.ar || "∅");
  check("exp1 city", (ex[0]?.city?.ar || "") === "دمشق", ex[0]?.city?.ar || "∅");
  check("exp1 current", ex[0]?.current === true, String(ex[0]?.current));
  check("exp1 desc", (ex[0]?.description?.ar || "").includes("قيادة فريق"), `${(ex[0]?.description?.ar || "").length} chars`);
  check("exp2 company", (ex[1]?.company?.ar || "").includes("النور"), ex[1]?.company?.ar || "∅");
  const ed = r.data.education ?? [];
  check("education", ed.length === 1, `${ed.length}`);
  check("edu institution", (ed[0]?.institution?.ar || "").includes("جامعة دمشق"), ed[0]?.institution?.ar || "∅");
  check("edu degree", (ed[0]?.degree?.ar || "").includes("بكالوريوس"), ed[0]?.degree?.ar || "∅");
  check("edu field", (ed[0]?.field?.ar || "").includes("التصميم"), ed[0]?.field?.ar || "∅");
  check("skills x5", (r.data.skills ?? []).length === 5, `${(r.data.skills ?? []).length}`);
  const lg = r.data.languages ?? [];
  check("languages x2", lg.length === 2, `${lg.length}`);
  check("lang1 native", lg[0]?.level === "native", lg[0]?.level);
  check("lang2 advanced", lg[1]?.level === "advanced", lg[1]?.level);
  check("certs x1", (r.data.certifications ?? []).length === 1, `${(r.data.certifications ?? []).length}`);
});

t("AR inline dates (format A)", inlineAr, (r) => {
  const ex = r.data.experience ?? [];
  check("experience x2", ex.length === 2, `${ex.length}`);
  check("exp1 position", (ex[0]?.position?.ar || "").includes("مهندسة برمجيات"), ex[0]?.position?.ar || "∅");
  check("exp1 company", (ex[0]?.company?.ar || "").includes("التقنية المتقدمة"), ex[0]?.company?.ar || "∅");
  check("exp1 city", (ex[0]?.city?.ar || "") === "دمشق", ex[0]?.city?.ar || "∅");
  check("exp1 current", ex[0]?.current === true, String(ex[0]?.current));
  check("exp2 dates", ex[1]?.startDate === "01/2018", ex[1]?.startDate || "∅");
});

// RTL control marks around everything (like pdftotext output)
const rtlWrapped = cleanAr.split("\n").map((l) => "‫" + l + "‬").join("\n");
t("AR with RTL control marks", rtlWrapped, (r) => {
  check("name still found", (r.data.personal?.fullName?.ar || "").includes("الخالدي"), r.data.personal?.fullName?.ar || "∅");
  check("experience still found", (r.data.experience ?? []).length === 2, `${(r.data.experience ?? []).length}`);
  check("skills still found", (r.data.skills ?? []).length === 5, `${(r.data.skills ?? []).length}`);
});

console.log(`\n===== PARSE SUITE: PASS=${pass} FAIL=${fail} =====`);
process.exit(fail > 0 ? 1 : 0);
