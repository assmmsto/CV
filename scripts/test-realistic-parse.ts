/**
 * Proof test #A — does "استيراد نص" really work for REALISTIC user input?
 * Runs parseCVText on real-world Arabic & English CV texts (as users paste them)
 * and reports what gets recognized.
 */
import { parseCVText } from "../src/lib/cv/parse";

const arabicCV = `محمد عبدالله السعيد
مهندس برمجيات
دمشق، سوريا
هاتف: 0933 111 222
البريد الإلكتروني: mohammed.saeed@example.com

الملخص المهني
مهندس برمجيات بخبرة ثماني سنوات في تطوير تطبيقات الويب وقيادة فرق تقنية.

الخبرة العملية
مهندس برمجيات — شركة الأمل للتقنية | دمشق
2020 - حتى الآن
• تطوير تطبيقات الويب باستخدام React و Node.js
• قيادة فريق من خمسة مهندسين

مهندس ويب — شركة النور | حلب
2016 - 2020
• تصميم واجهات المستخدم

التعليم
بكالوريوس هندسة برمجيات - جامعة دمشق
2012 - 2016

المهارات
JavaScript, React, Node.js, SQL, Docker

اللغات
العربية: لغة أم
الإنجليزية: طلاقة تامة`;

const arabicCV2 = `أحمد خالد
محاسب
حلب، سوريا
0944555666
ahmed.khaled@mail.com
linkedin.com/in/ahmed-khaled

الخبرات العملية
محاسب — مكتب الشمعة للمحاسبة | حلب
2018/03 - حتى الآن
إعداد القوائم المالية
المراجعة الشهرية

محاسب مساعد — شركة الفرات | دير الزور
2015/06 - 2018/02
تسجيل القيود المحاسبية

المؤهلات الدراسية
دبلوم محاسبة - المعهد التجاري
2013 - 2015

الكفاءات
محاسبة، مراجعة، Excel، QuickBooks`;

const englishCV = `Sarah Johnson
Graphic Designer
Beirut, Lebanon
+961 3 123 456
sarah.j@example.com

PROFILE
Creative designer with 6 years of experience in branding and print design.

EXPERIENCE
Senior Designer — Creative House | Beirut
2019 - Present
• Led branding projects for 20+ clients
• Designed marketing campaigns

Designer — AdWorks | Beirut
2016 - 2019
• Created social media visuals

EDUCATION
BA Graphic Design - Lebanese University
2012 - 2016

SKILLS
Photoshop, Illustrator, InDesign, Figma

LANGUAGES
Arabic: Native
English: Fluent`;

function report(name: string, raw: string) {
  const r = parseCVText(raw);
  const d = r.data;
  console.log("=".repeat(70));
  console.log("SCENARIO:", name);
  console.log("recognized:", JSON.stringify(r.recognized));
  console.log("  name   :", d.personal?.fullName?.ar || d.personal?.fullName?.en || "(empty)");
  console.log("  title  :", d.personal?.jobTitle?.ar || d.personal?.jobTitle?.en || "(empty)");
  console.log("  email  :", d.personal?.email || "(empty)");
  console.log("  phone  :", d.personal?.phone || "(empty)");
  console.log("  city   :", d.personal?.city?.ar || d.personal?.city?.en || "(empty)");
  console.log("  summary:", (d.personal?.summary?.ar || d.personal?.summary?.en || "(empty)").slice(0, 50));
  console.log("  exp    :", d.experience?.length ?? 0, "entries");
  for (const e of d.experience ?? []) {
    console.log(`     [${e.position.ar || e.position.en}] @ [${e.company.ar || e.company.en}] ${e.startDate}-${e.endDate || (e.current ? "الآن" : "")} desc=${(e.description.ar || e.description.en || "").length}ch`);
  }
  console.log("  edu    :", d.education?.length ?? 0, "entries");
  for (const e of d.education ?? []) {
    console.log(`     [${e.degree.ar || e.degree.en}] @ [${e.institution.ar || e.institution.en}] ${e.startDate}-${e.endDate || (e.current ? "الآن" : "")}`);
  }
  console.log("  skills :", d.skills?.length ?? 0, JSON.stringify((d.skills ?? []).slice(0, 6).map((s) => s.name.ar || s.name.en)));
  console.log("  langs  :", d.languages?.length ?? 0, JSON.stringify((d.languages ?? []).map((l) => `${l.name.ar || l.name.en}:${l.level}`)));
}

report("ARABIC CV #1 (structured)", arabicCV);
report("ARABIC CV #2 (linked-in, month/year dates)", arabicCV2);
report("ENGLISH CV (structured)", englishCV);

/* ============ adversarial scenarios (added with the fix) ============ */

const arabicCV3 = `ليلى حسن
مهندسة معمارية
من 2018 إلى الآن تعمل في المكتب الاستشاري

الخبرة العملية
مهندسة معمارية — المكتب الاستشاري الهندسي
من 2018 إلى الآن
الإشراف على تنفيذ مشاريع سكنية

مهندسة متدربة — مكتب العمارة الحديثة
من 2015 إلى 2017
تصميم المخططات التنفيذية

الشهادات
- شهادة LEED الخضراء - 2021
- دورة الريفيت المتقدمة - 2020

المشاريع
برج الياسمين السكني - تفاصيل المشروع على www.layla-arch.com
تصميم متكامل للواجهات`;

const messyPdf = `لينا محمد\n\n\nمصممة جرافيك\n\nحلب ، سوريا\n+963 922 333 444\nlina.m@mail.com\n\nالمهارات\nPhotoshop • Illustrator • Figma\n\nالخبرة العملية\nمصممة جرافيك — وكالة البدائل\n2019/07 - الآن\nتصميم الهويات البصرية\n\nمصممة — استوديو فنون\n2017 - 2019/06\nإعداد تصاميم المطبوعات\n\nالتعليم\nمعهد الفنون التطبيقية\n2013 - 2017`;

report("ARABIC CV #3 (من/إلى ranges + certs + projects)", arabicCV3);
report("MESSY PDF-EXTRACTED text (blank lines, \\n joins)", messyPdf);
