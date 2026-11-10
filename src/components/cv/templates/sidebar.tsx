import { TemplateProps, pick, dateRange, Bullets, ContactItem, contactItems, CustomSections, FONT_STACKS, LanguageList, ProjectsList, CertsList, MiniIcon, hasSection, tracking } from "./shared";
import { slabel, levelLabel } from "@/lib/cv/i18n";
import { CSSProperties } from "react";

/* ══════════════════════════════════════════════════════════════════════════
   5. MODERN SIDEBAR  (modern-sidebar)
   المعيار: النمط الهجين الحديث المعتمد لدى منصات Zety/Novoresume/Enhancv —
   شريط جانبي داكن (الصورة + التواصل + المهارات + اللغات) وعمود رئيسي
   (الملخص + الخبرة + التعليم + المشاريع + الشهادات).
   ══════════════════════════════════════════════════════════════════════════ */
export function ModernSidebar({ data, lang, accent, showPhoto, font }: TemplateProps) {
  const p = data.personal;
  const sans = font === "classic" ? FONT_STACKS.classic : FONT_STACKS.modern;
  const sidebarBg = "#1e293b";
  const sec: CSSProperties = { fontSize: "12.5pt", fontWeight: 700, color: accent, margin: "0 0 7pt", paddingBottom: 3, borderBottom: `2px solid ${accent}` };
  const entry: CSSProperties = { marginBottom: "10pt", breakInside: "avoid" };
  const sideHead: CSSProperties = { fontSize: "11pt", fontWeight: 700, letterSpacing: tracking(lang, "1.5px"), textTransform: "uppercase", color: "#fff", margin: "0 0 7pt", paddingBottom: 4, borderBottom: "1px solid rgba(255,255,255,0.25)" };
  const items = contactItems(data, lang);

  const heading = (t: string) => <h2 style={sec}>{t}</h2>;

  return (
    <div data-std="modern-sidebar" dir={lang === "ar" ? "rtl" : "ltr"} style={{ display: "flex", minHeight: "297mm", fontFamily: sans, background: "#fff", color: "#1e293b", textAlign: "start" }}>
      {/* Sidebar */}
      <aside style={{ width: "66mm", background: sidebarBg, color: "#e2e8f0", padding: "10mm 7mm", flexShrink: 0 }}>
        {showPhoto && p.photo && (
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.photo} alt="" style={{ width: 84, height: 84, borderRadius: "50%", objectFit: "cover", border: `3px solid ${accent}` }} />
          </div>
        )}
        <section>
          <h2 style={sideHead}>{slabel("contact", lang)}</h2>
          <div style={{ display: "grid", gap: 7, fontSize: "9.5pt", wordBreak: "break-word" }}>
            {items.map((it: ContactItem, i: number) => (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                <MiniIcon name={it.icon} size={11} style={{ color: accent, marginTop: 2 }} />
                <span style={{ unicodeBidi: "plaintext" }}>{it.href ? (
                  <a href={it.href} style={{ color: "inherit", textDecoration: "underline" }}>
                    {it.value}
                  </a>
                ) : (
                  it.value
                )}</span>
              </div>
            ))}
          </div>
        </section>
        {data.skills.length > 0 && (
          <section style={{ marginTop: 12 }}>
            <h2 style={sideHead}>{slabel("skills", lang)}</h2>
            <div style={{ fontSize: "9.5pt" }}>
              {data.skills.map((s) => (
                <div key={s.id} style={{ marginBottom: 7 }}>
                  <div style={{ marginBottom: 3 }}>{pick(s.name, lang)}</div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.18)", borderRadius: 99 }}>
                    <div style={{ width: `${(s.level / 5) * 100}%`, height: "100%", background: accent, borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {data.languages.length > 0 && (
          <section style={{ marginTop: 12 }}>
            <h2 style={sideHead}>{slabel("languages", lang)}</h2>
            <div style={{ fontSize: "9.5pt" }}>
              {data.languages.map((l) => (
                <div key={l.id} style={{ marginBottom: 5 }}>
                  <div>{pick(l.name, lang)}</div>
                  <div style={{ color: accent, fontSize: "8.5pt" }}>{levelLabel(l.level, lang)}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "10mm 8mm" }}>
        <header style={{ marginBottom: 12 }}>
          <h1 style={{ fontSize: "24pt", fontWeight: 800, margin: 0, color: "#0f172a", lineHeight: 1.15 }}>
            {pick(p.fullName, lang) || (lang === "ar" ? "الاسم الكامل" : "Your Name")}
          </h1>
          {pick(p.jobTitle, lang) && (
            <p style={{ fontSize: "13pt", margin: "4pt 0 0", color: accent, fontWeight: 600 }}>{pick(p.jobTitle, lang)}</p>
          )}
        </header>

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
              <div key={e.id} style={entry}>
                <div style={{ fontWeight: 700, fontSize: "11.5pt", color: "#0f172a" }}>{pick(e.position, lang)}</div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: "9.8pt", color: "#475569" }}>
                  <span>{pick(e.company, lang)}{pick(e.city, lang) ? ` — ${pick(e.city, lang)}` : ""}</span>
                  <span style={{ whiteSpace: "nowrap" }}>{dateRange(e.startDate, e.endDate, e.current, lang)}</span>
                </div>
                <div style={{ marginTop: 3 }}>
                  <Bullets text={pick(e.description, lang)} style={{ fontSize: "9.8pt" }} bulletStyle={{ color: accent }} />
                </div>
              </div>
            ))}
          </section>
        )}

        {data.education.length > 0 && (
          <section style={{ marginBottom: 12 }}>
            {heading(slabel("education", lang))}
            {data.education.map((ed) => (
              <div key={ed.id} style={entry}>
                <div style={{ fontWeight: 700, fontSize: "11.5pt", color: "#0f172a" }}>{pick(ed.degree, lang)}{pick(ed.field, lang) ? ` — ${pick(ed.field, lang)}` : ""}</div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: "9.8pt", color: "#475569" }}>
                  <span>{pick(ed.institution, lang)}</span>
                  <span style={{ whiteSpace: "nowrap" }}>{dateRange(ed.startDate, ed.endDate, ed.current, lang)}</span>
                </div>
                {pick(ed.grade, lang) && <div style={{ fontSize: "9.5pt", color: "#475569" }}>{pick(ed.grade, lang)}</div>}
              </div>
            ))}
          </section>
        )}

        {data.projects.length > 0 && (
          <section style={{ marginBottom: 12 }}>
            {heading(slabel("projects", lang))}
            <ProjectsList data={data} lang={lang} nameStyle={{ color: "#0f172a" }} />
          </section>
        )}

        {data.certifications.length > 0 && (
          <section style={{ marginBottom: 12 }}>
            {heading(slabel("certifications", lang))}
            <CertsList data={data} lang={lang} />
          </section>
        )}

        <CustomSections data={data} lang={lang} heading={heading} />
      </main>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   6. FRESH GRADUATE  (compact-pro)
   المعيار: نموذج الطالب/الخريج (resume.io Student + Harvard College) —
   التعليم أولاً ثم التدريبات/الخبرة ثم المشاريع البارزة ثم مهارات مجمّعة —
   صفحة واحدة نظيفة تكفي الحد الأدنى من الخبرة.
   ══════════════════════════════════════════════════════════════════════════ */
export function CompactPro({ data, lang, accent, font, showPhoto }: TemplateProps) {
  const p = data.personal;
  const sans = font === "classic" ? FONT_STACKS.classic : FONT_STACKS.modern;
  const sec: CSSProperties = { fontSize: "11.5pt", fontWeight: 700, color: "#111", margin: "0 0 6pt", paddingBottom: 3, borderBottom: `2px solid ${accent}`, display: "flex", alignItems: "center", gap: 8 };
  const entry: CSSProperties = { marginBottom: "8pt", breakInside: "avoid" };

  const heading = (t: string) => <h2 style={sec}><span style={{ width: 14, height: 14, borderRadius: 3, background: accent, display: "inline-block", flexShrink: 0, opacity: 0.9 }} />{t}</h2>;

  const eduBlock = data.education.length > 0 && (
    <section style={{ marginBottom: 11 }}>
      {heading(slabel("education", lang))}
      {data.education.map((ed) => (
        <div key={ed.id} style={entry}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
            <span style={{ fontWeight: 700, fontSize: "11pt", color: "#111" }}>
              {pick(ed.degree, lang)}{pick(ed.field, lang) ? ` — ${pick(ed.field, lang)}` : ""}
            </span>
            <span style={{ whiteSpace: "nowrap", fontSize: "9.3pt", color: "#555" }}>{dateRange(ed.startDate, ed.endDate, ed.current, lang)}</span>
          </div>
          <div style={{ fontSize: "10pt", color: "#444" }}>{pick(ed.institution, lang)}</div>
          {pick(ed.grade, lang) && <div style={{ fontSize: "9.3pt", color: "#555" }}>{pick(ed.grade, lang)}</div>}
        </div>
      ))}
    </section>
  );

  const expBlock = data.experience.length > 0 && (
    <section style={{ marginBottom: 11 }}>
      {heading(slabel("experience", lang))}
      {data.experience.map((e) => (
        <div key={e.id} style={entry}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
            <span style={{ fontWeight: 700, fontSize: "11pt", color: "#111" }}>{pick(e.position, lang)}</span>
            <span style={{ whiteSpace: "nowrap", fontSize: "9.3pt", color: "#555" }}>{dateRange(e.startDate, e.endDate, e.current, lang)}</span>
          </div>
          <div style={{ fontSize: "10pt", color: "#444" }}>
            {pick(e.company, lang)}{pick(e.city, lang) ? ` — ${pick(e.city, lang)}` : ""}
          </div>
          <div style={{ marginTop: 2 }}>
            <Bullets text={pick(e.description, lang)} style={{ fontSize: "9.6pt", color: "#333" }} bulletStyle={{ color: accent }} />
          </div>
        </div>
      ))}
    </section>
  );

  const projBlock = data.projects.length > 0 && (
    <section style={{ marginBottom: 11 }}>
      {heading(slabel("projects", lang))}
      <ProjectsList data={data} lang={lang} nameStyle={{ color: accent }} />
    </section>
  );

  const skillBlock = data.skills.length > 0 && (
    <section style={{ marginBottom: 11 }}>
      {heading(slabel("skills", lang))}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "4px 18px", fontSize: "9.8pt", color: "#333" }}>
        {data.skills.map((s) => (
          <div key={s.id} style={{ display: "flex", gap: 7, alignItems: "center" }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: accent, flexShrink: 0 }} />
            <span>{pick(s.name, lang)}</span>
          </div>
        ))}
      </div>
    </section>
  );

  const langBlock = data.languages.length > 0 && (
    <section style={{ marginBottom: 11 }}>
      {heading(slabel("languages", lang))}
      <LanguageList data={data} lang={lang} />
    </section>
  );

  const certBlock = data.certifications.length > 0 && (
    <section style={{ marginBottom: 11 }}>
      {heading(slabel("certifications", lang))}
      <CertsList data={data} lang={lang} />
    </section>
  );

  return (
    <div data-std="fresh-graduate" dir={lang === "ar" ? "rtl" : "ltr"} style={{ padding: "13mm 14mm", fontFamily: sans, color: "#222", textAlign: "start" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, background: `${accent}14`, border: `1px solid ${accent}55`, borderRadius: 8, padding: "6mm 7mm", marginBottom: 11 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: "20pt", fontWeight: 800, margin: 0, color: "#111" }}>
            {pick(p.fullName, lang) || (lang === "ar" ? "الاسم الكامل" : "Your Name")}
          </h1>
          {pick(p.jobTitle, lang) && <p style={{ fontSize: "11.5pt", margin: "3pt 0 5pt", color: accent, fontWeight: 600 }}>{pick(p.jobTitle, lang)}</p>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 12px", fontSize: "9pt", color: "#444" }}>
            {contactItems(data, lang).map((it, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <MiniIcon name={it.icon} size={10} style={{ color: accent }} />
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

      {/* fresh-graduate order: EDUCATION → EXPERIENCE → PROJECTS → SKILLS → LANGUAGES → CERTS */}
      {eduBlock}
      {expBlock}
      {projBlock}
      {skillBlock}
      {langBlock}
      {certBlock}

      <CustomSections data={data} lang={lang} heading={heading} />
    </div>
  );
}
