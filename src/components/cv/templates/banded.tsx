import { TemplateProps, pick, dateRange, Bullets, contactItems, CustomSections, FONT_STACKS, ProjectsList, CertsList, LanguageList, MiniIcon, hasSection, tracking } from "./shared";
import { slabel, levelLabel } from "@/lib/cv/i18n";
import { CSSProperties } from "react";

/* ============================== 7. CORPORATE ============================== */
export function Corporate({ data, lang, accent, font, showPhoto }: TemplateProps) {
  const p = data.personal;
  const sans = font === "classic" ? FONT_STACKS.classic : FONT_STACKS.modern;
  const sec: CSSProperties = {
    fontSize: "12pt", fontWeight: 700, color: accent, margin: "0 0 6pt",
    display: "flex", alignItems: "center", gap: 8,
  };
  const entry: CSSProperties = { marginBottom: "9pt", breakInside: "avoid" };

  const heading = (t: string) => (
    <h2 style={sec}>
      {t}
      <span style={{ flex: 1, height: 1.5, background: accent, opacity: 0.35 }} />
    </h2>
  );

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} style={{ fontFamily: sans, background: "#fff", color: "#222", textAlign: "start" }}>
      <header style={{ background: accent, color: "#fff", padding: "9mm 15mm", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: "23pt", fontWeight: 800, margin: 0, letterSpacing: tracking(lang, "0.5px") }}>
            {pick(p.fullName, lang) || (lang === "ar" ? "الاسم الكامل" : "Your Name")}
          </h1>
          {pick(p.jobTitle, lang) && <p style={{ fontSize: "13pt", margin: "3pt 0 7pt", opacity: 0.92 }}>{pick(p.jobTitle, lang)}</p>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 18px", fontSize: "9.5pt", opacity: 0.95 }}>
            {contactItems(data, lang).map((it, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <MiniIcon name={it.icon} size={11} style={{ color: "#fff" }} />
                {it.href ? (
                  <a href={it.href} style={{ color: "inherit", textDecoration: "underline" }}>
                    {it.value}
                  </a>
                ) : (
                  it.value
                )}
              </span>
            ))}
          </div>
        </div>
        {showPhoto && p.photo && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={p.photo}
            alt=""
            style={{ width: 82, height: 82, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.85)", flexShrink: 0 }}
          />
        )}
      </header>

      <div style={{ padding: "8mm 15mm" }}>
        {hasSection(data, "summary") && (
          <section style={{ marginBottom: 12 }}>
            {heading(slabel("summary", lang))}
            <p style={{ margin: 0, lineHeight: 1.55, fontSize: "10pt" }}>{pick(p.summary, lang)}</p>
          </section>
        )}

        {data.experience.length > 0 && (
          <section style={{ marginBottom: 12 }}>
            {heading(slabel("experience", lang))}
            {data.experience.map((e) => (
              <div key={e.id} style={{ ...entry, borderInlineStart: `2.5px solid ${accent}`, paddingInlineStart: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: "11.5pt", color: "#111" }}>{pick(e.position, lang)}</span>
                  <span style={{ whiteSpace: "nowrap", color: accent, fontWeight: 600, fontSize: "9.8pt" }}>{dateRange(e.startDate, e.endDate, e.current, lang)}</span>
                </div>
                <div style={{ fontSize: "10pt", color: "#444" }}>{pick(e.company, lang)}{pick(e.city, lang) ? ` — ${pick(e.city, lang)}` : ""}</div>
                <div style={{ marginTop: 3 }}>
                  <Bullets text={pick(e.description, lang)} style={{ fontSize: "9.8pt" }} />
                </div>
              </div>
            ))}
          </section>
        )}

        {data.education.length > 0 && (
          <section style={{ marginBottom: 12 }}>
            {heading(slabel("education", lang))}
            {data.education.map((ed) => (
              <div key={ed.id} style={{ ...entry, borderInlineStart: `2.5px solid ${accent}`, paddingInlineStart: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: "11pt", color: "#111" }}>{pick(ed.degree, lang)}{pick(ed.field, lang) ? ` — ${pick(ed.field, lang)}` : ""}</span>
                  <span style={{ whiteSpace: "nowrap", color: accent, fontWeight: 600, fontSize: "9.8pt" }}>{dateRange(ed.startDate, ed.endDate, ed.current, lang)}</span>
                </div>
                <div style={{ fontSize: "10pt", color: "#444" }}>{pick(ed.institution, lang)}{pick(ed.grade, lang) ? ` — ${pick(ed.grade, lang)}` : ""}</div>
              </div>
            ))}
          </section>
        )}

        {data.skills.length > 0 && (
          <section style={{ marginBottom: 12 }}>
            {heading(slabel("skills", lang))}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "5px 16px", fontSize: "10pt" }}>
              {data.skills.map((s) => (
                <div key={s.id} style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
                  <span style={{ color: accent, fontWeight: 700 }}>▪</span>
                  <span>{pick(s.name, lang)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.languages.length > 0 && (
          <section style={{ marginBottom: 12 }}>
            {heading(slabel("languages", lang))}
            <LanguageList data={data} lang={lang} />
          </section>
        )}

        {data.certifications.length > 0 && (
          <section style={{ marginBottom: 12 }}>
            {heading(slabel("certifications", lang))}
            <CertsList data={data} lang={lang} />
          </section>
        )}

        {data.projects.length > 0 && (
          <section style={{ marginBottom: 12 }}>
            {heading(slabel("projects", lang))}
            <ProjectsList data={data} lang={lang} />
          </section>
        )}

        <CustomSections data={data} lang={lang} heading={heading} />
      </div>
    </div>
  );
}

/* ============================== 8. ELEGANT DARK ============================== */
export function ElegantDark({ data, lang, accent, font }: TemplateProps) {
  const p = data.personal;
  const serif = font === "modern" ? FONT_STACKS.modern : FONT_STACKS.mixed;
  const dark = "#101826";
  const gold = "#c9a227";
  const sec: CSSProperties = {
    fontSize: "11.5pt", fontWeight: 700, color: gold, letterSpacing: tracking(lang, "1px"), textTransform: "uppercase",
    margin: "0 0 7pt", display: "flex", alignItems: "center", gap: 10,
  };
  const entry: CSSProperties = { marginBottom: "10pt", breakInside: "avoid" };

  const heading = (t: string) => (
    <h2 style={sec}>
      {t}
      <span style={{ flex: 1, height: 1, background: `linear-gradient(${lang === "ar" ? "to left" : "to right"}, ${gold}, transparent)` }} />
    </h2>
  );

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} style={{ fontFamily: serif, background: "#fff", color: "#1e2430", textAlign: "start" }}>
      <header style={{ background: dark, color: "#fff", padding: "12mm 15mm 10mm", textAlign: "center" }}>
        {p.photo && (
          <div style={{ marginBottom: 8, textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.photo} alt="" style={{ width: 78, height: 78, borderRadius: "50%", objectFit: "cover", border: `2.5px solid ${gold}` }} />
          </div>
        )}
        <h1 style={{ fontSize: "25pt", fontWeight: 700, margin: 0, letterSpacing: tracking(lang, "2px"), color: "#fff" }}>
          {pick(p.fullName, lang) || (lang === "ar" ? "الاسم الكامل" : "Your Name")}
        </h1>
        {pick(p.jobTitle, lang) && (
          <p style={{ fontSize: "12.5pt", margin: "6pt auto 9pt", color: gold, letterSpacing: tracking(lang, "3px") }}>{pick(p.jobTitle, lang)}</p>
        )}
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "4px 16px", fontSize: "9.3pt", color: "#c8cfdb" }}>
          {contactItems(data, lang).map((it, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <MiniIcon name={it.icon} size={11} style={{ color: gold }} />
              {it.href ? (
                  <a href={it.href} style={{ color: "inherit", textDecoration: "underline" }}>
                    {it.value}
                  </a>
                ) : (
                  it.value
                )}
            </span>
          ))}
        </div>
        <div style={{ width: 70, height: 2, background: gold, margin: "9pt auto 0" }} />
      </header>

      <div style={{ padding: "9mm 15mm" }}>
        {hasSection(data, "summary") && (
          <section style={{ marginBottom: 13 }}>
            {heading(slabel("summary", lang))}
            <p style={{ margin: 0, lineHeight: 1.6, fontSize: "10.3pt", textAlign: "justify" }}>{pick(p.summary, lang)}</p>
          </section>
        )}

        {data.experience.length > 0 && (
          <section style={{ marginBottom: 13 }}>
            {heading(slabel("experience", lang))}
            {data.experience.map((e) => (
              <div key={e.id} style={entry}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: "11.8pt", color: dark }}>{pick(e.position, lang)}</span>
                  <span style={{ color: gold, fontWeight: 600, fontSize: "9.6pt", whiteSpace: "nowrap" }}>{dateRange(e.startDate, e.endDate, e.current, lang)}</span>
                </div>
                <div style={{ fontSize: "10.3pt", color: "#475066", fontStyle: "italic" }}>{pick(e.company, lang)}{pick(e.city, lang) ? ` — ${pick(e.city, lang)}` : ""}</div>
                <div style={{ marginTop: 3 }}>
                  <Bullets text={pick(e.description, lang)} style={{ fontSize: "9.9pt" }} bulletStyle={{ color: gold }} />
                </div>
              </div>
            ))}
          </section>
        )}

        {data.education.length > 0 && (
          <section style={{ marginBottom: 13 }}>
            {heading(slabel("education", lang))}
            {data.education.map((ed) => (
              <div key={ed.id} style={entry}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: "11.3pt", color: dark }}>{pick(ed.degree, lang)}{pick(ed.field, lang) ? ` — ${pick(ed.field, lang)}` : ""}</span>
                  <span style={{ color: gold, fontWeight: 600, fontSize: "9.6pt", whiteSpace: "nowrap" }}>{dateRange(ed.startDate, ed.endDate, ed.current, lang)}</span>
                </div>
                <div style={{ fontSize: "10.3pt", color: "#475066" }}>{pick(ed.institution, lang)}{pick(ed.grade, lang) ? ` — ${pick(ed.grade, lang)}` : ""}</div>
              </div>
            ))}
          </section>
        )}

        {data.skills.length > 0 && (
          <section style={{ marginBottom: 13 }}>
            {heading(slabel("skills", lang))}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {data.skills.map((s) => (
                <span key={s.id} style={{ border: `1px solid ${gold}`, color: dark, padding: "3px 10px", fontSize: "9.4pt", borderRadius: 2 }}>
                  {pick(s.name, lang)}
                </span>
              ))}
            </div>
          </section>
        )}

        {data.languages.length > 0 && (
          <section style={{ marginBottom: 13 }}>
            {heading(slabel("languages", lang))}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 22px", fontSize: "10.2pt" }}>
              {data.languages.map((l) => (
                <span key={l.id}>{pick(l.name, lang)} <span style={{ color: gold }}>{levelLabel(l.level, lang)}</span></span>
              ))}
            </div>
          </section>
        )}

        {data.certifications.length > 0 && (
          <section style={{ marginBottom: 13 }}>
            {heading(slabel("certifications", lang))}
            <CertsList data={data} lang={lang} />
          </section>
        )}

        {data.projects.length > 0 && (
          <section style={{ marginBottom: 13 }}>
            {heading(slabel("projects", lang))}
            <ProjectsList data={data} lang={lang} nameStyle={{ color: dark }} />
          </section>
        )}

        <CustomSections data={data} lang={lang} heading={heading} />
      </div>
    </div>
  );
}

/* ============================== 9. TIMELINE PRO ============================== */
export function TimelinePro({ data, lang, accent, font, showPhoto }: TemplateProps) {
  const p = data.personal;
  const sans = font === "classic" ? FONT_STACKS.classic : FONT_STACKS.modern;
  const sec: CSSProperties = { fontSize: "12pt", fontWeight: 700, color: accent, margin: "0 0 8pt", textTransform: "uppercase", letterSpacing: tracking(lang, "1.5px") };
  const heading = (t: string) => <h2 style={sec}>{t}</h2>;

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} style={{ padding: "12mm 14mm", fontFamily: sans, color: "#24303f", textAlign: "start" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, borderBottom: `3px solid ${accent}`, paddingBottom: 9, marginBottom: 12 }}>
        <div>
          <h1 style={{ fontSize: "22pt", fontWeight: 800, margin: 0, color: accent, lineHeight: 1.15 }}>
            {pick(p.fullName, lang) || (lang === "ar" ? "الاسم الكامل" : "Your Name")}
          </h1>
          {pick(p.jobTitle, lang) && <p style={{ fontSize: "12.5pt", margin: "3pt 0 0", color: "#4b5563" }}>{pick(p.jobTitle, lang)}</p>}
        </div>
        <div style={{ fontSize: "9.3pt", color: "#4b5563", display: "grid", gap: 3, textAlign: "end" }}>
          {contactItems(data, lang).map((it, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
              <MiniIcon name={it.icon} size={11} style={{ color: accent }} />
              {it.href ? (
                  <a href={it.href} style={{ color: "inherit", textDecoration: "underline" }}>
                    {it.value}
                  </a>
                ) : (
                  it.value
                )}
            </span>
          ))}
        </div>
        {showPhoto && p.photo && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={p.photo}
            alt=""
            style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: `3px solid ${accent}`, flexShrink: 0 }}
          />
        )}
      </header>

      {hasSection(data, "summary") && (
        <section style={{ marginBottom: 13 }}>
          {heading(slabel("summary", lang))}
          <p style={{ margin: 0, lineHeight: 1.55, fontSize: "10.2pt" }}>{pick(p.summary, lang)}</p>
        </section>
      )}

      {data.experience.length > 0 && (
        <section style={{ marginBottom: 13 }}>
          {heading(slabel("experience", lang))}
          <div style={{ borderInlineStart: `2px solid ${accent}`, marginInlineStart: 5, paddingInlineStart: 14, display: "grid", gap: 11 }}>
            {data.experience.map((e) => (
              <div key={e.id} style={{ position: "relative", breakInside: "avoid" }}>
                <span style={{ position: "absolute", insetInlineStart: -19.5, top: 4, width: 9, height: 9, borderRadius: "50%", background: "#fff", border: `2.5px solid ${accent}` }} />
                <div style={{ display: "inline-block", background: `${accent}14`, color: accent, fontSize: "8.8pt", fontWeight: 700, padding: "1px 8px", borderRadius: 99 }}>
                  {dateRange(e.startDate, e.endDate, e.current, lang)}
                </div>
                <div style={{ fontWeight: 700, fontSize: "11.5pt", color: "#1f2937", marginTop: 2 }}>{pick(e.position, lang)}</div>
                <div style={{ fontSize: "10pt", color: "#4b5563" }}>{pick(e.company, lang)}{pick(e.city, lang) ? ` — ${pick(e.city, lang)}` : ""}</div>
                <div style={{ marginTop: 2 }}>
                  <Bullets text={pick(e.description, lang)} style={{ fontSize: "9.8pt" }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.education.length > 0 && (
        <section style={{ marginBottom: 13 }}>
          {heading(slabel("education", lang))}
          <div style={{ borderInlineStart: `2px solid ${accent}`, marginInlineStart: 5, paddingInlineStart: 14, display: "grid", gap: 9 }}>
            {data.education.map((ed) => (
              <div key={ed.id} style={{ position: "relative", breakInside: "avoid" }}>
                <span style={{ position: "absolute", insetInlineStart: -19.5, top: 4, width: 9, height: 9, borderRadius: "50%", background: "#fff", border: `2.5px solid ${accent}` }} />
                <span style={{ display: "inline-block", background: `${accent}14`, color: accent, fontSize: "8.8pt", fontWeight: 700, padding: "1px 8px", borderRadius: 99 }}>
                  {dateRange(ed.startDate, ed.endDate, ed.current, lang)}
                </span>
                <div style={{ fontWeight: 700, fontSize: "11pt", color: "#1f2937" }}>{pick(ed.degree, lang)}{pick(ed.field, lang) ? ` — ${pick(ed.field, lang)}` : ""}</div>
                <div style={{ fontSize: "10pt", color: "#4b5563" }}>{pick(ed.institution, lang)}{pick(ed.grade, lang) ? ` — ${pick(ed.grade, lang)}` : ""}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.skills.length > 0 && (
        <section style={{ marginBottom: 13 }}>
          {heading(slabel("skills", lang))}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {data.skills.map((s) => (
              <span key={s.id} style={{ background: `${accent}12`, border: `1px solid ${accent}55`, padding: "3px 10px", borderRadius: 4, fontSize: "9.6pt" }}>
                {pick(s.name, lang)}
              </span>
            ))}
          </div>
        </section>
      )}

      {data.languages.length > 0 && (
        <section style={{ marginBottom: 13 }}>
          {heading(slabel("languages", lang))}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px", fontSize: "10.2pt" }}>
            {data.languages.map((l) => (
              <span key={l.id}>{pick(l.name, lang)} <span style={{ color: accent }}>{levelLabel(l.level, lang)}</span></span>
            ))}
          </div>
        </section>
      )}

      {data.certifications.length > 0 && (
        <section style={{ marginBottom: 13 }}>
          {heading(slabel("certifications", lang))}
          <CertsList data={data} lang={lang} />
        </section>
      )}

      {data.projects.length > 0 && (
        <section style={{ marginBottom: 13 }}>
          {heading(slabel("projects", lang))}
          <ProjectsList data={data} lang={lang} nameStyle={{ color: "#1f2937" }} />
        </section>
      )}

      <CustomSections data={data} lang={lang} heading={heading} />
    </div>
  );
}

/* ============================== 10. CONTEMPORARY ============================== */
export function Contemporary({ data, lang, accent, showPhoto, font }: TemplateProps) {
  const p = data.personal;
  const sans = font === "classic" ? FONT_STACKS.classic : FONT_STACKS.modern;
  const sec: CSSProperties = {
    fontSize: "12.5pt", fontWeight: 800, margin: "0 0 8pt", display: "flex", alignItems: "center", gap: 8, color: "#111",
  };
  const heading = (t: string) => (
    <h2 style={sec}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: accent, display: "inline-block", flexShrink: 0 }} />
      {t}
    </h2>
  );

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} style={{ fontFamily: sans, background: "#fff", color: "#262626", textAlign: "start" }}>
      <header style={{
        background: `linear-gradient(120deg, ${accent}, ${accent}cc 60%, ${accent}88)`,
        color: "#fff", padding: "11mm 14mm", display: "flex", alignItems: "center", gap: 14,
      }}>
        {showPhoto && p.photo && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={p.photo} alt="" style={{ width: 74, height: 74, borderRadius: 16, objectFit: "cover", border: "3px solid rgba(255,255,255,0.7)", flexShrink: 0 }} />
        )}
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: "24pt", fontWeight: 800, margin: 0, lineHeight: 1.15 }}>
            {pick(p.fullName, lang) || (lang === "ar" ? "الاسم الكامل" : "Your Name")}
          </h1>
          {pick(p.jobTitle, lang) && <p style={{ fontSize: "12.5pt", margin: "3pt 0 0", opacity: 0.9, fontWeight: 500 }}>{pick(p.jobTitle, lang)}</p>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px", fontSize: "9pt", marginTop: 7, opacity: 0.95 }}>
            {contactItems(data, lang).map((it, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <MiniIcon name={it.icon} size={10} style={{ color: "#fff" }} />
                {it.href ? (
                  <a href={it.href} style={{ color: "inherit", textDecoration: "underline" }}>
                    {it.value}
                  </a>
                ) : (
                  it.value
                )}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div style={{ padding: "9mm 14mm" }}>
        {hasSection(data, "summary") && (
          <section style={{ marginBottom: 13 }}>
            {heading(slabel("summary", lang))}
            <p style={{ margin: 0, lineHeight: 1.6, fontSize: "10.3pt", background: "#fafafa", padding: "10px 12px", borderRadius: 8, borderInlineStart: `3px solid ${accent}` }}>
              {pick(p.summary, lang)}
            </p>
          </section>
        )}

        {data.experience.length > 0 && (
          <section style={{ marginBottom: 13 }}>
            {heading(slabel("experience", lang))}
            {data.experience.map((e) => (
              <div key={e.id} style={{ marginBottom: 10, breakInside: "avoid" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: "11.5pt", color: "#111" }}>{pick(e.position, lang)}</div>
                  <div style={{ fontSize: "9pt", fontWeight: 700, color: accent, whiteSpace: "nowrap", background: `${accent}10`, padding: "2px 9px", borderRadius: 99 }}>
                    {dateRange(e.startDate, e.endDate, e.current, lang)}
                  </div>
                </div>
                <div style={{ fontSize: "10pt", color: "#555", marginTop: 1 }}>
                  {pick(e.company, lang)}{pick(e.city, lang) ? ` — ${pick(e.city, lang)}` : ""}
                </div>
                <div style={{ marginTop: 3 }}>
                  <Bullets text={pick(e.description, lang)} style={{ fontSize: "9.8pt" }} bulletStyle={{ color: accent }} />
                </div>
              </div>
            ))}
          </section>
        )}

        {data.education.length > 0 && (
          <section style={{ marginBottom: 13 }}>
            {heading(slabel("education", lang))}
            {data.education.map((ed) => (
              <div key={ed.id} style={{ marginBottom: 8, breakInside: "avoid", display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: "11pt", color: "#111" }}>{pick(ed.degree, lang)}{pick(ed.field, lang) ? ` — ${pick(ed.field, lang)}` : ""}</span>
                  <span style={{ fontSize: "10pt", color: "#555" }}> · {pick(ed.institution, lang)}{pick(ed.grade, lang) ? ` · ${pick(ed.grade, lang)}` : ""}</span>
                </div>
                <div style={{ fontSize: "9pt", fontWeight: 700, color: accent, whiteSpace: "nowrap" }}>{dateRange(ed.startDate, ed.endDate, ed.current, lang)}</div>
              </div>
            ))}
          </section>
        )}

        {data.skills.length > 0 && (
          <section style={{ marginBottom: 13 }}>
            {heading(slabel("skills", lang))}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {data.skills.map((s) => (
                <span key={s.id} style={{ background: accent, color: "#fff", padding: "4px 12px", borderRadius: 99, fontSize: "9.4pt", fontWeight: 600 }}>
                  {pick(s.name, lang)}
                </span>
              ))}
            </div>
          </section>
        )}

        {data.languages.length > 0 && (
          <section style={{ marginBottom: 13 }}>
            {heading(slabel("languages", lang))}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {data.languages.map((l) => (
                <span key={l.id} style={{ border: `1.5px solid ${accent}66`, borderRadius: 8, padding: "4px 10px", fontSize: "9.6pt" }}>
                  {pick(l.name, lang)} <span style={{ color: accent, fontWeight: 700 }}>{levelLabel(l.level, lang)}</span>
                </span>
              ))}
            </div>
          </section>
        )}

        {data.certifications.length > 0 && (
          <section style={{ marginBottom: 13 }}>
            {heading(slabel("certifications", lang))}
            <CertsList data={data} lang={lang} />
          </section>
        )}

        {data.projects.length > 0 && (
          <section style={{ marginBottom: 13 }}>
            {heading(slabel("projects", lang))}
            <ProjectsList data={data} lang={lang} nameStyle={{ color: "#111" }} />
          </section>
        )}

        <CustomSections data={data} lang={lang} heading={heading} />
      </div>
    </div>
  );
}
