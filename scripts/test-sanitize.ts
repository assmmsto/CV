/** Unit test: sanitizeData + sanitizePersisted heal broken states */
import { sanitizeData } from "../src/lib/cv/store";
import { emptyCV } from "../src/lib/cv/types";

const full = {
  personal: {
    fullName: { ar: "محمد عبدالله السعيد", en: "Mohammed" },
    jobTitle: { ar: "مهندس", en: "Eng" },
    email: "a@b.c", phone: "123",
    city: { ar: "دمشق", en: "" }, country: { ar: "", en: "" },
    website: "", linkedin: "", github: "",
    photo: "data:image/jpeg;base64,AAA",
    summary: { ar: "ملخص", en: "Sum" },
  },
  experience: [{ id: "e1", company: { ar: "شركة", en: "Co" }, position: { ar: "", en: "Dev" }, city: { ar: "", en: "" }, startDate: "01/2020", endDate: "", current: true, description: { ar: "", en: "work" } }],
  education: [], skills: [{ id: "s1", name: { ar: "React", en: "" }, level: 3 }],
  languages: [{ id: "l1", name: { ar: "العربية", en: "" }, level: "native" }],
  certifications: [], projects: [], customSections: [],
};

// 1) full data passes through
const s1 = sanitizeData(full);
console.log("T1 fullName.ar:", s1.personal.fullName.ar);
console.log("T1 photo:", s1.personal.photo?.slice(0, 20));
console.log("T1 exp[0].current:", s1.experience[0].current, "| skill lvl:", s1.skills[0].level, "| lang:", s1.languages[0].level);

// 2) minimal broken data heals
const s2 = sanitizeData({ personal: { fullName: { ar: "اختبار" } } });
console.log("T2 fullName.ar:", s2.personal.fullName.ar, "| arrays:", s2.experience.length, s2.skills.length, s2.customSections.length);

// 3) garbage heals to empty
const s3 = sanitizeData("garbage");
console.log("T3 equals emptyCV:", JSON.stringify(s3) === JSON.stringify(emptyCV()));

// 4) items missing ids get new ones
const s4 = sanitizeData({ experience: [{ company: { ar: "بلا معرف" } }] });
console.log("T4 id generated:", Boolean(s4.experience[0].id), "| company:", s4.experience[0].company.ar);
