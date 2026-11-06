# CV Studio — استوديو السيرة الذاتية

منشئ سيرة ذاتية احترافي **ثنائي اللغة (العربية / الإنجليزية)** يعمل كتطبيق PWA قابل للتثبيت،
يولّد **10 نسخ مختلفة** من السيرة الذاتية بصيغة PDF متوافقة مع أنظمة الفرز الآلي (ATS)
ومعايير قبول الشركات ومنصات التوظيف — وبتنزيل فردي أو جماعي (ZIP) بنقرة واحدة.

A professional **bilingual (Arabic / English)**, installable **PWA** CV builder that
generates **10 distinct ATS-compatible PDF versions** of your CV — downloadable
individually or **all at once with one click**.

---

## ✨ المزايا | Features

| | |
|---|---|
| 🌐 ثنائي اللغة | واجهة عربية (RTL) وإنجليزية (LTR) مع تبديل فوري، وتخزين كل حقل باللغتين معاً |
| 📝 إدخال مرة واحدة | نموذج شامل (خبرات، تعليم، مهارات، لغات، شهادات، مشاريع، أقسام مخصصة) قابل للتعديل والإضافة في أي وقت |
| 📄 استيراد ملف CV | رفع PDF أو DOCX واستخراج البيانات تلقائياً لتعبئة النموذج |
| 🎨 10 قوالب مختلفة | كل قالب بتصميم حقيقي مختلف (وليس مجرد تنسيقات ألوان) |
| ✅ توافق ATS | نص قابل للتحديد والاستخراج، خطوط عربية مضمّنة، بلا جداول معقدة أو صور للنص |
| 📦 تصدير PDF | نسخة واحدة بضغطة، أو **الكل في ZIP بنقرة واحدة** |
| 📲 PWA | تثبيت على الجوال/سطح المكتب، العمل دون اتصال، أزرار تثبيت وحالة OFFLINE |

## 🖨️ القوالب العشرة | The 10 Templates

| # | القالب | Template | ATS |
|---|--------|----------|-----|
| 1 | الكلاسيكي المعتمد | ATS Classic | 100% |
| 2 | العصري المعتمد | ATS Modern | 100% |
| 3 | التنفيذي | Executive | 95% |
| 4 | المينيمال | Minimal Pro | 95% |
| 5 | الشريط الجانبي | Modern Sidebar | 85% |
| 6 | الشركات الرسمي | Corporate | 90% |
| 7 | المسار الزمني | Timeline Pro | 85% |
| 8 | الداكن الفخم | Elegant Dark | 90% |
| 9 | المدمج المحترف | Compact Pro | 90% |
| 10 | المعاصر | Contemporary | 85% |

## 🚀 التشغيل | Getting Started

```bash
# 1) تثبيت الحزم — install dependencies
npm install        # أو bun install

# 2) توليد قاعدة البيانات — generate prisma client
npx prisma generate

# 3) بيئة التطوير — dev server
npm run dev        # http://localhost:3000

# 4) بناء الإنتاج — production build
npm run build
npm run start
```

### متطلبات توليد PDF | PDF engine requirements

يعتمد التصدير على Chromium عبر `playwright-core` ويُشغَّل داخل عامل مستقل بـ bun:

```bash
# تنزيل متصفح Chromium — download chromium
npx playwright-core install chromium   # أو: bunx playwright install chromium
```

- المتصفح يُكتشف تلقائياً من `~/.cache/ms-playwright`، ويمكن تخصيصه عبر المتغير `CHROME_PATH`.
- مسار bun الافتراضي: `/usr/local/bin/bun` (قابل للتغيير عبر `BUN_BIN`).

## 🏗️ البنية | Architecture

```
src/
├─ app/                        # Next.js App Router
│  ├─ page.tsx                 # الواجهة الرئيسية (تبويبات: البيانات/الاستيراد/المعاينة/التصميم/التصدير)
│  └─ api/export/pdf/route.ts  # نقطة التصدير: PDF مفرد أو ZIP بـ 10 نسخ
├─ components/cv/
│  ├─ editor/                  # نموذج إدخال البيانات (شخصي، خبرات، تعليم…)
│  ├─ templates/               # القوالب العشرة + السجل registry.tsx
│  ├─ import-tab.tsx           # استيراد PDF/DOCX وتحليله
│  ├─ export-tab.tsx           # بطاقات النسخ العشر + تنزيل فردي/جماعي
│  └─ pwa.tsx                  # تسجيل Service Worker + زر التثبيت + شارة العمل دون اتصال
├─ lib/cv/
│  ├─ types.ts                 # نموذج البيانات ثنائي اللغة (BiText)
│  ├─ store.ts                 # حالة Zustand مع حفظ تلقائي محلي (localStorage)
│  ├─ parse.ts                 # تحليل ملفات PDF/DOCX المستوردة
│  ├─ export-html.ts           # توليد HTML مخصص للطباعة لكل قالب
│  ├─ export-runner.ts         # تشغيل عامل PDF وتجميع ZIP
│  └─ i18n.ts                  # قاموس الواجهة عربي/إنجليزي
scripts/
└─ pdf-worker.ts               # عامل bun: Chromium + الخطوط العربية → PDF نصي (ATS-safe)
```

## 📱 التثبيت كتطبيق | Install as App

افتح الموقع في المتصفح ثم:
- **الأندرويد/كروم**: زر «تثبيت التطبيق» داخل الصفحة، أو أيقونة التثبيت في شريط العنوان.
- **iOS/سفاري**: مشاركة → «إضافة إلى الشاشة الرئيسية».
- بعد التثبيت يعمل التطبيق **دون اتصال** (بياناتك محفوظة محلياً على جهازك).

## 🔐 الخصوصية | Privacy

كل البيانات تُخزَّن **محلياً على جهاز المستخدم** (localStorage) ولا تُرسل إلى أي خادم خارجي —
التصدير يتم داخل خادم التطبيق نفسه ويعطي الملف مباشرة للمستخدم.

## 🛠️ التقنيات | Tech Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Zustand · Prisma (اختياري) ·
JSZip · Playwright-core (Chromium) · bun — مع PWA كامل (manifest + service worker + offline).

## 🤖 نسخة أندرويد APK | Android APK

التطبيق متوفر كحزمة APK مستقلة تعمل **أونلاين وأوفلاين**:

| الملف | الوصف |
|---|---|
| `docs/index.html` | صفحة ويب عربية لتحميل الـ APK (جاهزة لـ GitHub Pages) |
| `docs/cv-studio.apk` | حزمة التطبيق الموقّعة (com.cvstudio.app v1.0.0) |
| `download/cv-studio-release.keystore` | مفتاح التوقيع (كلمة السر: `CVstudio-2026-key`) — احتفظ به للتحديثات المستقبلية |

**بناء APK من الصفر**:
```bash
npm run build:static   # أو: bash scripts/build-android-web.sh
python3 scripts/gen-icons.py
bash scripts/build-apk.sh   # يتطلب: Android build-tools + android-34 + JDK 21
```

**آلية العمل داخل APK**: الواجهة تعمل بالكامل أوفلاين من أصول التطبيق، وتوليد PDF
يستخدم محرك الطباعة الأصلي في أندرويد (Save as PDF) — وعند توفر خادم التطبيق أونلاين
يُستخدم محرك Bun+Chromium تلقائياً للحصول على نصوص ATS قابلة للتحديد.

> ملاحظة: PDF المولّد أوفلاين عبر الطباعة الأصلية يحتوي نصاً قابلاً للتحديد أيضاً،
> لكن المحرك الأونلاين يوفر تحكماً أدق بالخطوط العربية والتنسيق.
