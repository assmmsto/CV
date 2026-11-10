import { TemplateProps, pick, dateRange, Bullets, ContactLine, CustomSections, FONT_STACKS, hasSection, ProjectsList, CertsList, tracking, contactItems } from "./shared";
import { slabel } from "@/lib/cv/i18n";
import { CSSProperties } from "react";

/* ══════════════════════════════════════════════════════════════════════════
   1. HARVARD FORMAT  (ats-classic)
   المعيار: دليل Harvard College FAS + HBS Alumni الرسمي.
   • الاسم في المنتصف بخط سيريف عريض، سطر التواصل تحته في المنتصف مفصولاً بنقاط.
   • عناوين أقسام UPPERCASE مع خط سفلي أسود رفيع.
   • المنصب/الشركة عريض، التواريخ بمحاذاة لليمين موحّدة في كل الأقسام.
   • بلا صور ولا ألوان — النسخة الأكثر قبولًا لدى الشركات الكبرى.
   ══════════════════════════════════════════════════════════════════════════ */
export function AtsClassic({ data, lang, font }: TemplateProps) {
  const p = data.personal;
  const serif = font === "modern" ? FONT_STACKS.modern : FONT_STACKS.classic;
  const sec: CSSProperties = { fontSize: "11pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: tracking(lang, "1px"), borderBottom: "1px solid #000", paddingBottom: 2, margin: "13pt 0 6pt" };
  const entry: CSSProperties = { marginBottom: "8pt", breakInside: "avoid" };
  const row: CSSProperties = { display: "flex", justifyContent: "space-between", gap: 8 };

  const heading = (t: string) => <h2 style={{ ...sec }}>{t}</h2>;

  /* Harvard contact line: centered single row with • separators, real anchors */
  const items = contactItems(data, lang);

  return (
    <div data-std="harvard" dir={lang === "ar" ? "rtl" : "ltr"} style={{ padding: "16mm 15mm", fontFamily: serif, color: "#000", textAlign: "start" }}>
      <header style={{ textAlign: "center", marginBottom: "4pt" }}>
        <h1 style={{ fontSize: "19pt", fontWeight: 700, margin: 0, letterSpacing: tracking(lang, "0.5px") }}>
          {pick(p.fullName, lang) || (lang === "ar" ? "الاسم الكامل" : "Your Name")}
        </h1>
        {pick(p.jobTitle, lang) && <p style={{ fontSize: "11pt", margin: "2pt 0 5pt", color: "#222" }}>{pick(p.jobTitle, lang)}</p>}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "2px 0", fontSize: "9.5pt", color: "#111" }}>
          {items.map((it, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
              {i > 0 && <span style={{ margin: "0 8px", opacity: 0.65 }}>•</span>}
              {it.href ? (
                <a href={it.href} style={{ color: "inherit", textDecoration: "none" }}>
                  <span style={{ unicodeBidi: "plaintext" }}>{it.value}</span>
                </a>
              ) : (
                <span style={{ unicodeBidi: "plaintext" }}>{it.value}</span>
              )}
            </span>
          ))}
        </div>
      </header>

      {hasSection(data, "summary") && (
        <section>
          {heading(slabel("summary", lang))}
          <p style={{ margin: 0, textAlign: "justify", fontSize: "10.5pt", lineHeight: 1.45 }}>{pick(p.summary, lang)}</p>
        </section>
      )}

      {data.experience.length > 0 && (
        <section>
          {heading(slabel("experience", lang))}
          {data.experience.map((e) => (
            <div key={e.id} style={entry}>
              <div style={row}>
                <span style={{ fontWeight: 700 }}>
                  {pick(e.position, lang)}
                  {pick(e.company, lang) ? `, ${pick(e.company, lang)}` : ""}
                  {pick(e.city, lang) ? ` — ${pick(e.city, lang)}` : ""}
                </span>
                <span style={{ whiteSpace: "nowrap" }}>{dateRange(e.startDate, e.endDate, e.current, lang)}</span>
              </div>
              <div style={{ marginTop: 3 }}>
                <Bullets text={pick(e.description, lang)} style={{ fontSize: "10pt", paddingInlineStart: "12pt" }} bulletStyle={{ marginInlineStart: "-12pt" }} />
              </div>
            </div>
          ))}
        </section>
      )}

      {data.education.length > 0 && (
        <section>
          {heading(slabel("education", lang))}
          {data.education.map((ed) => (
            <div key={ed.id} style={entry}>
              <div style={row}>
                <span style={{ fontWeight: 700 }}>
                  {pick(ed.degree, lang)}
                  {pick(ed.field, lang) ? `, ${pick(ed.field, lang)}` : ""}
                </span>
                <span style={{ whiteSpace: "nowrap" }}>{dateRange(ed.startDate, ed.endDate, ed.current, lang)}</span>
              </div>
              <div style={{ fontSize: "10.5pt" }}>
                {pick(ed.institution, lang)}
                {pick(ed.grade, lang) ? ` — ${pick(ed.grade, lang)}` : ""}
              </div>
            </div>
          ))}
        </section>
      )}

      {data.skills.length > 0 && (
        <section>
          {heading(slabel("skills", lang))}
          <p style={{ margin: 0, fontSize: "10.5pt", lineHeight: 1.5 }}>{data.skills.map((s) => pick(s.name, lang)).filter(Boolean).join(" • ")}</p>
        </section>
      )}

      {data.languages.length > 0 && (
        <section>
          {heading(slabel("languages", lang))}
          <p style={{ margin: 0, fontSize: "10.5pt" }}>
            {data.languages.map((l) => {
              const name = pick(l.name, lang);
              const lv = l.level === "native" ? (lang === "ar" ? "لغة أم" : "Native") : "";
              return lv ? `${name} (${lv})` : name;
            }).filter(Boolean).join(" • ")}
          </p>
        </section>
      )}

      {data.certifications.length > 0 && (
        <section>
          {heading(slabel("certifications", lang))}
          <CertsList data={data} lang={lang} />
        </section>
      )}

      {data.projects.length > 0 && (
        <section>
          {heading(slabel("projects", lang))}
          <ProjectsList data={data} lang={lang} />
        </section>
      )}

      <CustomSections data={data} lang={lang} heading={heading} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   2. ATS-PROOF / WORKDAY  (ats-modern)
   المعيار: تقرير Jobscan لاستخدام ATS في شركات Fortune 500 (2026) —
   Workday الأكثر استخدامًا؛ العمود الواحد + عناوين قياسية + مهارات نص عادي
   بلا شارات أو جداول أو أيقونات = أعلى قابلية قراءة آلية.
   ══════════════════════════════════════════════════════════════════════════ */
export function AtsModern({ data, lang, font }: TemplateProps) {
  const p = data.personal;
  const sans = font === "classic" ? FONT_STACKS.classic : FONT_STACKS.modern;
  const sec: CSSProperties = { fontSize: "11pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: tracking(lang, "1.2px"), margin: "13pt 0 5pt", paddingBottom: 3, borderBottom: "2px solid #111" };
  const entry: CSSProperties = { marginBottom: "8pt", breakInside: "avoid" };

  const heading = (t: string) => <h2 style={sec}>{t}</h2>;

  return (
    <div data-std="ats-proof" dir={lang === "ar" ? "rtl" : "ltr"} style={{ padding: "14mm 15mm", fontFamily: sans, color: "#111", textAlign: "start" }}>
      <header style={{ borderBottom: "3px solid #111", paddingBottom: 8, marginBottom: 4 }}>
        <h1 style={{ fontSize: "21pt", fontWeight: 800, margin: 0, letterSpacing: tracking(lang, "-0.5px") }}>
          {pick(p.fullName, lang) || (lang === "ar" ? "الاسم الكامل" : "Your Name")}
        </h1>
        {pick(p.jobTitle, lang) && <p style={{ fontSize: "11.5pt", margin: "2pt 0 6pt", color: "#333" }}>{pick(p.jobTitle, lang)}</p>}
        {/* plain-text contact row (no icons — maximum machine parseability) */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px", fontSize: "9.5pt", color: "#222" }}>
          {contactItems(data, lang).map((it, i) => (
            <span key={i} style={{ unicodeBidi: "plaintext" }}>
              {it.href ? (
                <a href={it.href} style={{ color: "inherit", textDecoration: "none" }}>{it.value}</a>
              ) : (
                it.value
              )}
            </span>
          ))}
        </div>
      </header>

      {hasSection(data, "summary") && (
        <section>
          {heading(slabel("summary", lang))}
          <p style={{ margin: 0, lineHeight: 1.5, fontSize: "10.5pt" }}>{pick(p.summary, lang)}</p>
        </section>
      )}

      {data.experience.length > 0 && (
        <section>
          {heading(slabel("experience", lang))}
          {data.experience.map((e) => (
            <div key={e.id} style={entry}>
              <div style={{ fontWeight: 700, fontSize: "11pt" }}>{pick(e.position, lang)}</div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ color: "#333" }}>
                  {pick(e.company, lang)}
                  {pick(e.city, lang) ? ` — ${pick(e.city, lang)}` : ""}
                </span>
                <span style={{ whiteSpace: "nowrap", color: "#333" }}>{dateRange(e.startDate, e.endDate, e.current, lang)}</span>
              </div>
              <div style={{ marginTop: 3 }}>
                <Bullets text={pick(e.description, lang)} style={{ fontSize: "10pt" }} />
              </div>
            </div>
          ))}
        </section>
      )}

      {data.education.length > 0 && (
        <section>
          {heading(slabel("education", lang))}
          {data.education.map((ed) => (
            <div key={ed.id} style={entry}>
              <div style={{ fontWeight: 700 }}>
                {pick(ed.degree, lang)}
                {pick(ed.field, lang) ? ` — ${pick(ed.field, lang)}` : ""}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ color: "#333" }}>{pick(ed.institution, lang)}</span>
                <span style={{ whiteSpace: "nowrap", color: "#333" }}>{dateRange(ed.startDate, ed.endDate, ed.current, lang)}</span>
              </div>
              {pick(ed.grade, lang) && <div style={{ color: "#444", fontSize: "9.5pt" }}>{pick(ed.grade, lang)}</div>}
            </div>
          ))}
        </section>
      )}

      {/* skills as plain comma text — the single most ATS-critical formatting rule */}
      {data.skills.length > 0 && (
        <section>
          {heading(slabel("skills", lang))}
          <p style={{ margin: 0, lineHeight: 1.6, fontSize: "10.5pt" }}>
            {data.skills.map((s) => pick(s.name, lang)).filter(Boolean).join("، ")}
          </p>
        </section>
      )}

      {data.languages.length > 0 && (
        <section>
          {heading(slabel("languages", lang))}
          <p style={{ margin: 0, fontSize: "10.5pt" }}>
            {data.languages.map((l) => `${pick(l.name, lang)}${l.level === "native" ? (lang === "ar" ? " (لغة أم)" : " (Native)") : ""}`).filter(Boolean).join("، ")}
          </p>
        </section>
      )}

      {data.certifications.length > 0 && (
        <section>
          {heading(slabel("certifications", lang))}
          <CertsList data={data} lang={lang} />
        </section>
      )}

      {data.projects.length > 0 && (
        <section>
          {heading(slabel("projects", lang))}
          <ProjectsList data={data} lang={lang} />
        </section>
      )}

      <CustomSections data={data} lang={lang} heading={heading} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   3. EXECUTIVE (HBS ALUMNI)  (executive)
   المعيار: دليل خريجي Harvard Business School — ترويسة مركزية سيريف صغيرة
   الحروف الكبيرة، ملخص فقري، كتلة Core Competencies في عمودين، تواريخ مائلة يمين.
   ══════════════════════════════════════════════════════════════════════════ */
export function Executive({ data, lang, font }: TemplateProps) {
  const p = data.personal;
  const serif = font === "modern" ? FONT_STACKS.modern : FONT_STACKS.mixed;
  const sec: CSSProperties = {
    fontSize: "11pt", fontWeight: 700, letterSpacing: tracking(lang, "2.5px"), textTransform: "uppercase",
    textAlign: "center", margin: "12pt 0 7pt",
  };
  const entry: CSSProperties = { marginBottom: "9pt", breakInside: "avoid" };

  const heading = (t: string) => (
    <h2 style={sec}>
      <span style={{ display: "inline-block", borderTop: "1.5px solid #1a1a1a", borderBottom: "1px solid #999", padding: "2px 18px" }}>{t}</span>
    </h2>
  );

  return (
    <div data-std="hbs-executive" dir={lang === "ar" ? "rtl" : "ltr"} style={{ padding: "16mm 18mm", fontFamily: serif, color: "#1a1a1a", textAlign: "start" }}>
      <header style={{ textAlign: "center", marginBottom: 4 }}>
        <h1 style={{ fontSize: "23pt", fontWeight: 400, margin: 0, letterSpacing: tracking(lang, "3px"), textTransform: "uppercase", fontVariant: lang === "en" ? "small-caps" : "normal" }}>
          {pick(p.fullName, lang) || (lang === "ar" ? "الاسم الكامل" : "Your Name")}
        </h1>
        {pick(p.jobTitle, lang) && <p style={{ fontSize: "12pt", margin: "4pt 0", color: "#444", fontStyle: "italic" }}>{pick(p.jobTitle, lang)}</p>}
        <ContactLine data={data} lang={lang} style={{ justifyContent: "center", fontSize: "9.5pt", color: "#333" }} />
      </header>
      <div style={{ borderTop: "2.5px solid #1a1a1a", margin: "6pt 0 2pt" }} />

      {hasSection(data, "summary") && (
        <section>
          {heading(slabel("summary", lang))}
          <p style={{ margin: 0, textAlign: "justify", fontSize: "10.5pt", lineHeight: 1.5 }}>{pick(p.summary, lang)}</p>
        </section>
      )}

      {/* Core Competencies — HBS: key expertise in a 2–3 column grid */}
      {data.skills.length > 0 && (
        <section>
          {heading(slabel("skills", lang))}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "3px 22px", fontSize: "10.5pt", maxWidth: "150mm", margin: "0 auto" }}>
            {data.skills.map((s) => (
              <div key={s.id} style={{ display: "flex", gap: 7, alignItems: "baseline" }}>
                <span style={{ width: 5, height: 5, background: "#1a1a1a", flexShrink: 0, display: "inline-block", transform: "translateY(-2px)" }} />
                <span>{pick(s.name, lang)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.experience.length > 0 && (
        <section>
          {heading(slabel("experience", lang))}
          {data.experience.map((e) => (
            <div key={e.id} style={entry}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: "11.5pt" }}>
                  {pick(e.position, lang)}
                  {pick(e.company, lang) ? ` — ${pick(e.company, lang)}` : ""}
                </span>
                <span style={{ fontSize: "9.5pt", color: "#444", whiteSpace: "nowrap", fontStyle: "italic" }}>{dateRange(e.startDate, e.endDate, e.current, lang)}</span>
              </div>
              <div style={{ fontSize: "10.5pt", color: "#222" }}>
                {pick(e.city, lang)}
              </div>
              <div style={{ marginTop: 2 }}>
                <Bullets text={pick(e.description, lang)} style={{ fontSize: "10pt" }} />
              </div>
            </div>
          ))}
        </section>
      )}

      {data.education.length > 0 && (
        <section>
          {heading(slabel("education", lang))}
          {data.education.map((ed) => (
            <div key={ed.id} style={entry}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: "11pt" }}>{pick(ed.degree, lang)}{pick(ed.field, lang) ? ` — ${pick(ed.field, lang)}` : ""}</span>
                <span style={{ fontSize: "9.5pt", color: "#444", whiteSpace: "nowrap", fontStyle: "italic" }}>{dateRange(ed.startDate, ed.endDate, ed.current, lang)}</span>
              </div>
              <div style={{ fontSize: "10.5pt", color: "#222" }}>{pick(ed.institution, lang)}{pick(ed.grade, lang) ? ` — ${pick(ed.grade, lang)}` : ""}</div>
            </div>
          ))}
        </section>
      )}

      {data.languages.length > 0 && (
        <section>
          {heading(slabel("languages", lang))}
          <p style={{ margin: 0, textAlign: "center", fontSize: "10.5pt" }}>
            {data.languages.map((l) => `${pick(l.name, lang)}${l.level === "native" ? (lang === "ar" ? " (لغة أم)" : " (Native)") : ""}`).filter(Boolean).join("  ·  ")}
          </p>
        </section>
      )}

      {data.certifications.length > 0 && (
        <section>
          {heading(slabel("certifications", lang))}
          <CertsList data={data} lang={lang} />
        </section>
      )}

      {data.projects.length > 0 && (
        <section>
          {heading(slabel("projects", lang))}
          <ProjectsList data={data} lang={lang} />
        </section>
      )}

      <CustomSections data={data} lang={lang} heading={heading} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   4. GOOGLE SIMPLE  (minimal-pro)
   المعيار: قوالب Google Docs الرسمية (Serif/Coral/Spearmint) — عمود واحد
   بقسط لطيف: اسم كبير رفيع، عناوين رمادية هادئة، مساحات بيضاء واسعة.
   ══════════════════════════════════════════════════════════════════════════ */
export function MinimalPro({ data, lang, accent, font, showPhoto }: TemplateProps) {
  const p = data.personal;
  const sans = font === "classic" ? FONT_STACKS.classic : FONT_STACKS.modern;
  const sec: CSSProperties = {
    fontSize: "10.5pt", fontWeight: 600, letterSpacing: tracking(lang, "1px"), textTransform: "uppercase",
    color: "#8a8a8a", margin: "15pt 0 6pt",
  };
  const entry: CSSProperties = { marginBottom: "10pt", breakInside: "avoid" };

  const heading = (t: string) => <h2 style={sec}>{t}</h2>;

  return (
    <div data-std="google-simple" dir={lang === "ar" ? "rtl" : "ltr"} style={{ padding: "17mm 17mm", fontFamily: sans, color: "#212121", textAlign: "start", position: "relative" }}>
      {showPhoto && p.photo && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={p.photo}
          alt=""
          style={{ position: "absolute", top: "12mm", insetInlineEnd: "17mm", width: 62, height: 62, borderRadius: "50%", objectFit: "cover", border: `2px solid ${accent}` }}
        />
      )}
      <header style={{ borderBottom: "1px solid #ddd", paddingBottom: 10, marginBottom: 4, maxWidth: "150mm" }}>
        <h1 style={{ fontSize: "24pt", fontWeight: 300, margin: 0, letterSpacing: tracking(lang, "-0.5px") }}>
          {pick(p.fullName, lang) || (lang === "ar" ? "الاسم الكامل" : "Your Name")}
        </h1>
        {pick(p.jobTitle, lang) && <p style={{ fontSize: "12pt", margin: "3pt 0 8pt", color: "#666", fontWeight: 300 }}>{pick(p.jobTitle, lang)}</p>}
        <ContactLine data={data} lang={lang} style={{ fontSize: "9pt", color: "#777", gap: "3px 16px" }} />
      </header>

      {hasSection(data, "summary") && (
        <section>
          {heading(slabel("summary", lang))}
          <p style={{ margin: 0, lineHeight: 1.6, fontSize: "10.5pt", color: "#333" }}>{pick(p.summary, lang)}</p>
        </section>
      )}

      {data.experience.length > 0 && (
        <section>
          {heading(slabel("experience", lang))}
          {data.experience.map((e) => (
            <div key={e.id} style={entry}>
              <div style={{ fontWeight: 600, fontSize: "11.5pt" }}>{pick(e.position, lang)}</div>
              <div style={{ fontSize: "10pt", color: "#777", margin: "1px 0" }}>
                {pick(e.company, lang)}
                {pick(e.city, lang) ? ` · ${pick(e.city, lang)}` : ""}
                {` · ${dateRange(e.startDate, e.endDate, e.current, lang)}`}
              </div>
              <Bullets text={pick(e.description, lang)} style={{ fontSize: "10pt", color: "#333" }} />
            </div>
          ))}
        </section>
      )}

      {data.education.length > 0 && (
        <section>
          {heading(slabel("education", lang))}
          {data.education.map((ed) => (
            <div key={ed.id} style={entry}>
              <div style={{ fontWeight: 600, fontSize: "11.5pt" }}>{pick(ed.degree, lang)}{pick(ed.field, lang) ? ` — ${pick(ed.field, lang)}` : ""}</div>
              <div style={{ fontSize: "10pt", color: "#777" }}>
                {pick(ed.institution, lang)} · {dateRange(ed.startDate, ed.endDate, ed.current, lang)}
                {pick(ed.grade, lang) ? ` · ${pick(ed.grade, lang)}` : ""}
              </div>
            </div>
          ))}
        </section>
      )}

      {data.skills.length > 0 && (
        <section>
          {heading(slabel("skills", lang))}
          <p style={{ margin: 0, lineHeight: 1.9, fontSize: "10.5pt" }}>
            {data.skills.map((s) => pick(s.name, lang)).filter(Boolean).join("   /   ")}
          </p>
        </section>
      )}

      {data.languages.length > 0 && (
        <section>
          {heading(slabel("languages", lang))}
          <p style={{ margin: 0, fontSize: "10.5pt" }}>
            {data.languages.map((l) => `${pick(l.name, lang)}${l.level === "native" ? (lang === "ar" ? " — لغة أم" : " — Native") : ""}`).filter(Boolean).join("   /   ")}
          </p>
        </section>
      )}

      {data.certifications.length > 0 && (
        <section>
          {heading(slabel("certifications", lang))}
          <CertsList data={data} lang={lang} />
        </section>
      )}

      {data.projects.length > 0 && (
        <section>
          {heading(slabel("projects", lang))}
          <ProjectsList data={data} lang={lang} />
        </section>
      )}

      <CustomSections data={data} lang={lang} heading={heading} />
    </div>
  );
}
