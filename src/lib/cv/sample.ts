import { CVData, uid, emptyCV } from "./types";

/** Realistic sample data used by the "Fill with sample" action. */
export const sampleCV = (): CVData => ({
  ...emptyCV(),
  personal: {
    fullName: { ar: "أحمد محمد الخالدي", en: "Ahmad Mohammad Al-Khalidi" },
    jobTitle: { ar: "مصمم جرافيك أول", en: "Senior Graphic Designer" },
    email: "ahmad.khalidi@example.com",
    phone: "+963 955 123 456",
    city: { ar: "دمشق", en: "Damascus" },
    country: { ar: "سوريا", en: "Syria" },
    website: "https://portfolio.example.com",
    linkedin: "linkedin.com/in/ahmad-khalidi",
    github: "",
    summary: {
      ar: "مصمم جرافيك بخبرة 8 سنوات في بناء الهويات البصرية وتصميم المطبوعات والحملات الرقمية. قدت أكثر من 120 مشروعاً لعملاء في قطاعات التجزئة والعقارات والتقنية، ورفعت التفاعل الرقمي للعلامات بنسبة تصل إلى 45%. أجمع بين حسّ الفن الجمالي والتفكير الاستراتيجي المرتبط بأهداف العمل.",
      en: "Graphic designer with 8 years of experience in brand identity, print and digital campaigns. Led 120+ projects for retail, real-estate and tech clients, lifting digital engagement by up to 45%. I combine strong visual craft with strategic, business-driven thinking.",
    },
  },
  experience: [
    {
      id: uid(),
      company: { ar: "وكالة إبداع للدعاية والإعلان", en: "Ibdaa Advertising Agency" },
      position: { ar: "مصمم جرافيك أول", en: "Senior Graphic Designer" },
      city: { ar: "دمشق", en: "Damascus" },
      startDate: "03/2021",
      endDate: "",
      current: true,
      description: {
        ar: "قيادة فريق من 3 مصممين لتطوير الهويات البصرية والحملات المتكاملة\nتصميم أكثر من 60 هوية بصرية كاملة للشركات الناشئة\nرفع معدل تفاعل حملات العملاء على المنصات الرقمية بنسبة 45%\nإدارة علاقات العملاء وتقديم العروض التصميمية",
        en: "Led a team of 3 designers developing brand identities and integrated campaigns\nDesigned 60+ complete corporate identities for startups\nRaised clients' digital campaign engagement by 45%\nManaged client relationships and design presentations",
      },
    },
    {
      id: uid(),
      company: { ar: "شركة النور للنشر والإعلان", en: "Al-Nour Publishing & Ads" },
      position: { ar: "مصمم جرافيك", en: "Graphic Designer" },
      city: { ar: "حلب", en: "Aleppo" },
      startDate: "06/2018",
      endDate: "02/2021",
      current: false,
      description: {
        ar: "تصميم أغلفة الكتب والمطبوعات الدورية بأكثر من 40 إصداراً\nإعداد تصاميم السوشيال ميديا لأكثر من 15 علامة تجارية\nتحسين سير عمل الملفات وتقليل زمن التسليم بنسبة 30%",
        en: "Designed book covers and periodicals with 40+ published issues\nProduced social media designs for 15+ brands\nImproved file workflow and reduced delivery time by 30%",
      },
    },
  ],
  education: [
    {
      id: uid(),
      institution: { ar: "جامعة دمشق", en: "Damascus University" },
      degree: { ar: "بكالوريوس", en: "Bachelor's Degree" },
      field: { ar: "الفنون التشكيلية — التصميم الجرافيكي", en: "Fine Arts — Graphic Design" },
      startDate: "2014",
      endDate: "2018",
      current: false,
      grade: { ar: "جيد جداً — 82%", en: "Very Good — 82%" },
    },
  ],
  skills: [
    { id: uid(), name: { ar: "أدوبي فوتوشوب", en: "Adobe Photoshop" }, level: 5 },
    { id: uid(), name: { ar: "أدوبي إليستريتور", en: "Adobe Illustrator" }, level: 5 },
    { id: uid(), name: { ar: "أدوبي إنديزاين", en: "Adobe InDesign" }, level: 4 },
    { id: uid(), name: { ar: "فيجما", en: "Figma" }, level: 4 },
    { id: uid(), name: { ar: "تصميم الهوية البصرية", en: "Brand Identity Design" }, level: 5 },
    { id: uid(), name: { ar: "التايبوغرافي العربي", en: "Arabic Typography" }, level: 4 },
  ],
  languages: [
    { id: uid(), name: { ar: "العربية", en: "Arabic" }, level: "native" },
    { id: uid(), name: { ar: "الإنجليزية", en: "English" }, level: "advanced" },
  ],
  certifications: [
    {
      id: uid(),
      name: { ar: "شهادة تصميم تجربة المستخدم UX", en: "UX Design Certificate" },
      issuer: { ar: "Google — منصة كورسيرا", en: "Google — Coursera" },
      date: "2022",
      url: "",
    },
    {
      id: uid(),
      name: { ar: "دورة التايبوغرافي المتقدم", en: "Advanced Typography Course" },
      issuer: { ar: "معهد التصميم", en: "Design Institute" },
      date: "2020",
      url: "",
    },
  ],
  projects: [
    {
      id: uid(),
      name: { ar: "هوية سلسلة مقاهي «رَوق»", en: "Rawq Café Chain Identity" },
      description: {
        ar: "هوية بصرية متكاملة للشعار والمطبوعات والتغليف لسلسلة من 5 فروع، أدت لرفع التعرف على العلامة بنسبة 60%.",
        en: "Full visual identity covering logo, print and packaging for a 5-branch chain; boosted brand recognition by 60%.",
      },
      url: "",
      technologies: { ar: "إليستريتور، فوتوشوب، إنديزاين", en: "Illustrator, Photoshop, InDesign" },
    },
  ],
  customSections: [],
});
