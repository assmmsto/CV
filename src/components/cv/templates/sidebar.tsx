import { TemplateProps, pick, dateRange, Bullets, ContactItem, contactItems, CustomSections, FONT_STACKS, SkillBars, LanguageList, ProjectsList, CertsList, MiniIcon, hasSection, tracking } from "./shared";
import { slabel, levelLabel } from "@/lib/cv/i18n";
import { CSSProperties } from "react";

/* ============================== 5. MODERN SIDEBAR ============================== */
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
    <div dir={lang === "ar" ? "rtl" : "ltr"} style={{ display: "flex", minHeight: "297mm", fontFamily: sans, background: "#fff", color: "#1e293b", textAlign: "start" }}>
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

/* ============================== 6. COMPACT PRO ============================== */
export function CompactPro({ data, lang, accent, font, showPhoto }: TemplateProps) {
  const p = data.personal;
  const sans = font === "classic" ? FONT_STACKS.classic : FONT_STACKS.modern;
  const sec: CSSProperties = { fontSize: "10.5pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: tracking(lang, "1.2px"), color: "#111", margin: "0 0 6pt" };
  const entry: CSSProperties = { marginBottom: "7pt", breakInside: "avoid" };
  const railHead: CSSProperties = { fontSize: "9.5pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: tracking(lang, "1px"), color: accent, margin: "0 0 5pt", paddingBottom: 2, borderBottom: `1.5px solid ${accent}` };

  const heading = (t: string) => <h2 style={{ ...sec, display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 18, height: 2.5, background: accent, display: "inline-block", flexShrink: 0 }} />{t}</h2>;

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} style={{ padding: "10mm 11mm", fontFamily: sans, color: "#222", textAlign: "start" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 10, borderBottom: `2.5px solid ${accent}`, paddingBottom: 7, marginBottom: 10 }}>
        <div>
          <h1 style={{ fontSize: "19pt", fontWeight: 800, margin: 0, color: "#111" }}>
            {pick(p.fullName, lang) || (lang === "ar" ? "الاسم الكامل" : "Your Name")}
          </h1>
          {pick(p.jobTitle, lang) && <p style={{ fontSize: "11.5pt", margin: "2pt 0 0", color: accent, fontWeight: 600 }}>{pick(p.jobTitle, lang)}</p>}
        </div>
        <div style={{ fontSize: "8.8pt", textAlign: "end", lineHeight: 1.5, color: "#444", display: "grid", gap: 1 }}>
          {contactItems(data, lang).map((it, i) => (
            <span key={i} style={{ unicodeBidi: "plaintext" }}>{it.href ? (
                  <a href={it.href} style={{ color: "inherit", textDecoration: "underline" }}>
                    {it.value}
                  </a>
                ) : (
                  it.value
                )}</span>
          ))}
        </div>
        {showPhoto && p.photo && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={p.photo}
            alt=""
            style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: `2.5px solid ${accent}`, flexShrink: 0, alignSelf: "center" }}
          />
        )}
      </header>

      <div style={{ display: "flex", gap: "9mm" }}>
        <main style={{ flex: 1.6, minWidth: 0 }}>
          {hasSection(data, "summary") && (
            <section style={{ marginBottom: 10 }}>
              {heading(slabel("summary", lang))}
              <p style={{ margin: 0, lineHeight: 1.5, fontSize: "9.6pt" }}>{pick(p.summary, lang)}</p>
            </section>
          )}
          {data.experience.length > 0 && (
            <section style={{ marginBottom: 10 }}>
              {heading(slabel("experience", lang))}
              {data.experience.map((e) => (
                <div key={e.id} style={entry}>
                  <div style={{ fontWeight: 700, fontSize: "10.5pt", color: "#111" }}>{pick(e.position, lang)}</div>
                  <div style={{ fontSize: "9.2pt", color: "#555", display: "flex", justifyContent: "space-between", gap: 6 }}>
                    <span>{pick(e.company, lang)}{pick(e.city, lang) ? `, ${pick(e.city, lang)}` : ""}</span>
                    <span style={{ whiteSpace: "nowrap" }}>{dateRange(e.startDate, e.endDate, e.current, lang)}</span>
                  </div>
                  <Bullets text={pick(e.description, lang)} style={{ fontSize: "9.3pt" }} bulletStyle={{ color: accent }} />
                </div>
              ))}
            </section>
          )}
          {data.education.length > 0 && (
            <section style={{ marginBottom: 10 }}>
              {heading(slabel("education", lang))}
              {data.education.map((ed) => (
                <div key={ed.id} style={entry}>
                  <div style={{ fontWeight: 700, fontSize: "10.5pt" }}>{pick(ed.degree, lang)}{pick(ed.field, lang) ? ` — ${pick(ed.field, lang)}` : ""}</div>
                  <div style={{ fontSize: "9.2pt", color: "#555", display: "flex", justifyContent: "space-between", gap: 6 }}>
                    <span>{pick(ed.institution, lang)}{pick(ed.grade, lang) ? ` — ${pick(ed.grade, lang)}` : ""}</span>
                    <span style={{ whiteSpace: "nowrap" }}>{dateRange(ed.startDate, ed.endDate, ed.current, lang)}</span>
                  </div>
                </div>
              ))}
            </section>
          )}
          {data.projects.length > 0 && (
            <section style={{ marginBottom: 10 }}>
              {heading(slabel("projects", lang))}
              <ProjectsList data={data} lang={lang} />
            </section>
          )}
          <CustomSections data={data} lang={lang} heading={heading} />
        </main>

        <aside style={{ flex: 1, minWidth: 0 }}>
          {data.skills.length > 0 && (
            <section style={{ marginBottom: 10 }}>
              <h2 style={railHead}>{slabel("skills", lang)}</h2>
              <div style={{ fontSize: "9.3pt", display: "grid", gap: 5 }}>
                {data.skills.map((s) => (
                  <div key={s.id}>
                    <div style={{ marginBottom: 2 }}>{pick(s.name, lang)}</div>
                    <div style={{ height: 3.5, background: "#eee", borderRadius: 99 }}>
                      <div style={{ width: `${(s.level / 5) * 100}%`, height: "100%", background: accent, borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {data.languages.length > 0 && (
            <section style={{ marginBottom: 10 }}>
              <h2 style={railHead}>{slabel("languages", lang)}</h2>
              <LanguageList data={data} lang={lang} />
            </section>
          )}
          {data.certifications.length > 0 && (
            <section style={{ marginBottom: 10 }}>
              <h2 style={railHead}>{slabel("certifications", lang)}</h2>
              <CertsList data={data} lang={lang} />
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
