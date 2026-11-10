import { parseCVText } from "../src/lib/cv/parse";

const t = `ليلى حسن
مهندسة معمارية

الخبرة العملية
مهندسة معمارية — المكتب الاستشاري الهندسي
من 2018 إلى الآن
الإشراف على تنفيذ مشاريع سكنية

الشهادات
- شهادة LEED الخضراء - 2021
- دورة الريفيت المتقدمة - 2020

المشاريع
برج الياسمين السكني - تفاصيل المشروع على www.layla-arch.com
تصميم متكامل للواجهات`;

const r = parseCVText(t);
console.log("certs:", JSON.stringify(r.data.certifications?.map(c => ({ n: c.name.ar, d: c.date })), null, 1));
console.log("projects:", JSON.stringify(r.data.projects?.map(p => ({ n: p.name.ar, u: p.url, d: p.description.ar })), null, 1));
