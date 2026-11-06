import { TemplateProps, pick, dateRange, Bullets, ContactLine, CustomSections, FONT_STACKS, hasSection, ProjectsList, CertsList } from "./shared";
import { slabel } from "@/lib/cv/i18n";
import { CSSProperties } from "react";

/* ============================== 1. ATS CLASSIC ============================== */
export function AtsClassic({ data, lang, font }: TemplateProps) {
  const p = data.personal;
  const serif = font === "modern" ? FONT_STACKS.modern : FONT_STACKS.classic;
  const sec: CSSProperties = { fontSize: "12pt", fontWeight: 700, textTransform: "uppercase", borderBottom: "1px solid #000", paddingBottom: 2, margin: "14pt 0 6pt" };
  const entry: CSSProperties = { marginBottom: "8pt", breakInside: "avoid" };
  const row: CSSProperties = { display: "flex", justifyContent: "space-between", gap: 8 };

  const heading = (t: string) => <h2 style={{ ...sec }}>{t}</h2>;

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} style={{ padding: "16mm 15mm", fontFamily: serif, color: "#000", textAlign: "start" }}>
      <header style={{ textAlign: "center", marginBottom: "6pt" }}>
        <h1 style={{ fontSize: "20pt", fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
          {pick(p.fullName, lang) || (lang === "ar" ? "الاسم الكامل" : "Your Name")}
        </h1>
        {pick(p.jobTitle, lang) && <p style={{ fontSize: "11.5pt", margin: "3pt 0 5pt" }}>{pick(p.jobTitle, lang)}</p>}
        <ContactLine data={data} lang={lang} style={{ justifyContent: "center", fontSize: "9.5pt" }} />
      </header>

      {hasSection(data, "summary") && (
        <section>
          {heading(slabel("summary", lang))}
          <p style={{ margin: 0, textAlign: "justify" }}>{pick(p.summary, lang)}</p>
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
                <Bullets text={pick(e.description, lang)} style={{ paddingLeft: lang === "ar" ? 0 : "14pt", paddingRight: lang === "ar" ? "14pt" : 0 }} bulletStyle={{ marginInlineStart: "-14pt" }} />
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
          <p style={{ margin: 0 }}>{data.skills.map((s) => pick(s.name, lang)).filter(Boolean).join(" • ")}</p>
        </section>
      )}

      {data.languages.length > 0 && (
        <section>
          {heading(slabel("languages", lang))}
          <p style={{ margin: 0 }}>
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

/* ============================== 2. ATS MODERN ============================== */
export function AtsModern({ data, lang, font }: TemplateProps) {
  const p = data.personal;
  const sans = font === "classic" ? FONT_STACKS.classic : FONT_STACKS.modern;
  const sec: CSSProperties = { fontSize: "11.5pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", margin: "13pt 0 5pt", paddingBottom: 3, borderBottom: "2px solid #111" };
  const entry: CSSProperties = { marginBottom: "8pt", breakInside: "avoid" };

  const heading = (t: string) => <h2 style={sec}>{t}</h2>;

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} style={{ padding: "14mm 15mm", fontFamily: sans, color: "#111", textAlign: "start" }}>
      <header style={{ borderBottom: "3px solid #111", paddingBottom: 8, marginBottom: 4 }}>
        <h1 style={{ fontSize: "22pt", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
          {pick(p.fullName, lang) || (lang === "ar" ? "الاسم الكامل" : "Your Name")}
        </h1>
        {pick(p.jobTitle, lang) && <p style={{ fontSize: "12pt", margin: "2pt 0 6pt", color: "#333" }}>{pick(p.jobTitle, lang)}</p>}
        <ContactLine data={data} lang={lang} style={{ fontSize: "9.5pt", color: "#222" }} />
      </header>

      {hasSection(data, "summary") && (
        <section>
          {heading(slabel("summary", lang))}
          <p style={{ margin: 0, lineHeight: 1.5 }}>{pick(p.summary, lang)}</p>
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

      {data.skills.length > 0 && (
        <section>
          {heading(slabel("skills", lang))}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data.skills.map((s) => (
              <span key={s.id} style={{ border: "1px solid #333", padding: "2px 8px", fontSize: "9.5pt", borderRadius: 3 }}>
                {pick(s.name, lang)}
              </span>
            ))}
          </div>
        </section>
      )}

      {data.languages.length > 0 && (
        <section>
          {heading(slabel("languages", lang))}
          <p style={{ margin: 0 }}>
            {data.languages.map((l) => `${pick(l.name, lang)}${l.level === "native" ? (lang === "ar" ? " (لغة أم)" : " (Native)") : ""}`).filter(Boolean).join(" • ")}
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

/* ============================== 3. EXECUTIVE ============================== */
export function Executive({ data, lang, font }: TemplateProps) {
  const p = data.personal;
  const serif = FONT_STACKS.mixed;
  const sec: CSSProperties = {
    fontSize: "11pt", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase",
    textAlign: "center", margin: "12pt 0 7pt",
  };
  const entry: CSSProperties = { marginBottom: "9pt", breakInside: "avoid" };

  const heading = (t: string) => (
    <h2 style={sec}>
      <span style={{ display: "inline-block", borderTop: "1.5px solid #1a1a1a", borderBottom: "1px solid #999", padding: "2px 18px" }}>{t}</span>
    </h2>
  );

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} style={{ padding: "16mm 18mm", fontFamily: serif, color: "#1a1a1a", textAlign: "start" }}>
      <header style={{ textAlign: "center", marginBottom: 4 }}>
        <h1 style={{ fontSize: "23pt", fontWeight: 400, margin: 0, letterSpacing: "3px", textTransform: "uppercase", fontVariant: lang === "en" ? "small-caps" : "normal" }}>
          {pick(p.fullName, lang) || (lang === "ar" ? "الاسم الكامل" : "Your Name")}
        </h1>
        {pick(p.jobTitle, lang) && <p style={{ fontSize: "12pt", margin: "4pt 0", color: "#444", fontStyle: "italic" }}>{pick(p.jobTitle, lang)}</p>}
        <ContactLine data={data} lang={lang} style={{ justifyContent: "center", fontSize: "9.5pt", color: "#333" }} />
      </header>
      <div style={{ borderTop: "2.5px solid #1a1a1a", margin: "6pt 0 2pt" }} />

      {hasSection(data, "summary") && (
        <section>
          {heading(slabel("summary", lang))}
          <p style={{ margin: 0, textAlign: "justify", fontSize: "10.5pt" }}>{pick(p.summary, lang)}</p>
        </section>
      )}

      {data.experience.length > 0 && (
        <section>
          {heading(slabel("experience", lang))}
          {data.experience.map((e) => (
            <div key={e.id} style={entry}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: "11.5pt" }}>{pick(e.position, lang)}</span>
                <span style={{ fontSize: "9.5pt", color: "#444", whiteSpace: "nowrap", fontStyle: "italic" }}>{dateRange(e.startDate, e.endDate, e.current, lang)}</span>
              </div>
              <div style={{ fontSize: "10.5pt", color: "#222" }}>
                {pick(e.company, lang)}
                {pick(e.city, lang) ? `, ${pick(e.city, lang)}` : ""}
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

      {data.skills.length > 0 && (
        <section>
          {heading(slabel("skills", lang))}
          <p style={{ margin: 0, textAlign: "center", fontSize: "10.5pt" }}>{data.skills.map((s) => pick(s.name, lang)).filter(Boolean).join("  ·  ")}</p>
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

/* ============================== 4. MINIMAL PRO ============================== */
export function MinimalPro({ data, lang, accent, font }: TemplateProps) {
  const p = data.personal;
  const sans = font === "classic" ? FONT_STACKS.classic : FONT_STACKS.modern;
  const sec: CSSProperties = {
    fontSize: "11pt", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase",
    color: "#9a9a9a", margin: "16pt 0 7pt",
  };
  const entry: CSSProperties = { marginBottom: "10pt", breakInside: "avoid" };

  const heading = (t: string) => <h2 style={sec}>{t}</h2>;

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} style={{ padding: "17mm 17mm", fontFamily: sans, color: "#212121", textAlign: "start" }}>
      <div style={{ borderTop: `3px solid ${accent}`, margin: "-17mm -17mm 12mm" }} />
      <header style={{ marginBottom: 6 }}>
        <h1 style={{ fontSize: "24pt", fontWeight: 300, margin: 0, letterSpacing: "-0.5px" }}>
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
