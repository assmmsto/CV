import { TemplateProps, pick, dateRange, Bullets, contactItems, CustomSections, FONT_STACKS, ProjectsList, CertsList, LanguageList, MiniIcon, hasSection, tracking } from "./shared";
import { slabel, levelLabel } from "@/lib/cv/i18n";
import { CSSProperties } from "react";

/* ══════════════════════════════════════════════════════════════════════════
   7. INDEED PROFESSIONAL  (corporate)
   المعيار: دليل تنسيق السيرة في Indeed (أكبر موقع توظيف عالميًا) —
   ترويسة ملونّة (الاسم + المسمى + قناة التواصل كاملة) ثم ترتيب Indeed:
   الملخص ← الخبرة المهنية ← المهارات ← التعليم ← الشهادات.
   ══════════════════════════════════════════════════════════════════════════ */
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
    <div data-std="indeed" dir={lang === "ar" ? "rtl" : "ltr"} style={{ fontFamily: sans, background: "#fff", color: "#222", textAlign: "start" }}>
      {/* Indeed-style header band */}
      <header style={{ background: accent, color: "#fff", padding: "9mm 15mm", display: "flex", alignItems: "center", gap: 14 }}>
        {showPhoto && p.photo && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={p.photo} alt="" style={{ width: 82, height: 82, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.85)", flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: "23pt", fontWeight: 800, margin: 0, letterSpacing: tracking(lang, "0.5px") }}>
            {pick(p.fullName, lang) || (lang === "ar" ? "الاسم الكامل" : "Your Name")}
          </h1>
          {pick(p.jobTitle, lang) && <p style={{ fontSize: "13pt", margin: "3pt 0 7pt", opacity: 0.92 }}>{pick(p.jobTitle, lang)}</p>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", fontSize: "9.5pt", opacity: 0.97 }}>
            {contactItems(data, lang).map((it, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <MiniIcon name={it.icon} size={11} style={{ opacity: 0.9 }} />
                {it.href ? (
                  <a href={it.href} style={{ color: "inherit", textDecoration: "underline" }}>
                    <span style={{ unicodeBidi: "plaintext" }}>{it.value}</span>
                  </a>
                ) : (
                  <span style={{ unicodeBidi: "plaintext" }}>{it.value}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div style={{ padding: "8mm 15mm 10mm" }}>
        {/* Indeed order: Summary → Experience → Skills → Education → rest */}
        {hasSection(data, "summary") && (
          <section style={{ marginBottom: 11 }}>
            {heading(slabel("summary", lang))}
            <p style={{ margin: 0, lineHeight: 1.55, fontSize: "10.5pt" }}>{pick(p.summary, lang)}</p>
          </section>
        )}

        {data.experience.length > 0 && (
          <section style={{ marginBottom: 11 }}>
            {heading(slabel("experience", lang))}
            {data.experience.map((e) => (
              <div key={e.id} style={entry}>
                <div style={{ fontWeight: 700, fontSize: "11.5pt", color: "#111" }}>{pick(e.position, lang)}</div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: "10pt", color: "#555" }}>
                  <span>
                    {pick(e.company, lang)}
                    {pick(e.city, lang) ? ` — ${pick(e.city, lang)}` : ""}
                  </span>
                  <span style={{ whiteSpace: "nowrap" }}>{dateRange(e.startDate, e.endDate, e.current, lang)}</span>
                </div>
                <div style={{ marginTop: 3 }}>
                  <Bullets text={pick(e.description, lang)} style={{ fontSize: "10pt" }} bulletStyle={{ color: accent }} />
                </div>
              </div>
            ))}
          </section>
        )}

        {data.skills.length > 0 && (
          <section style={{ marginBottom: 11 }}>
            {heading(slabel("skills", lang))}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "4px 22px", fontSize: "10pt", color: "#333" }}>
              {data.skills.map((s) => (
                <div key={s.id} style={{ display: "flex", gap: 7, alignItems: "baseline" }}>
                  <span style={{ color: accent, flexShrink: 0 }}>•</span>
                  <span>{pick(s.name, lang)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.education.length > 0 && (
          <section style={{ marginBottom: 11 }}>
            {heading(slabel("education", lang))}
            {data.education.map((ed) => (
              <div key={ed.id} style={entry}>
                <div style={{ fontWeight: 700, fontSize: "11pt", color: "#111" }}>
                  {pick(ed.degree, lang)}{pick(ed.field, lang) ? ` — ${pick(ed.field, lang)}` : ""}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: "10pt", color: "#555" }}>
                  <span>{pick(ed.institution, lang)}</span>
                  <span style={{ whiteSpace: "nowrap" }}>{dateRange(ed.startDate, ed.endDate, ed.current, lang)}</span>
                </div>
                {pick(ed.grade, lang) && <div style={{ fontSize: "9.5pt", color: "#666" }}>{pick(ed.grade, lang)}</div>}
              </div>
            ))}
          </section>
        )}

        {data.certifications.length > 0 && (
          <section style={{ marginBottom: 11 }}>
            {heading(slabel("certifications", lang))}
            <CertsList data={data} lang={lang} />
          </section>
        )}

        {data.languages.length > 0 && (
          <section style={{ marginBottom: 11 }}>
            {heading(slabel("languages", lang))}
            <LanguageList data={data} lang={lang} />
          </section>
        )}

        {data.projects.length > 0 && (
          <section style={{ marginBottom: 11 }}>
            {heading(slabel("projects", lang))}
            <ProjectsList data={data} lang={lang} nameStyle={{ color: "#111" }} />
          </section>
        )}

        <CustomSections data={data} lang={lang} heading={heading} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   8. CAREER TIMELINE  (timeline)
   المعيار: النمط الهجين «مسار التدرج الوظيفي» (Combination/Progression) —
   خط زمني عمودي بنقاط يبرز ترقّي المناصب، مع إنجازات مقيسة بالأرقام.
   ══════════════════════════════════════════════════════════════════════════ */
export function TimelinePro({ data, lang, accent, font, showPhoto }: TemplateProps) {
  const p = data.personal;
  const sans = font === "classic" ? FONT_STACKS.classic : FONT_STACKS.modern;
  const entry: CSSProperties = { breakInside: "avoid", position: "relative", paddingInlineStart: 26, paddingBottom: 12 };
  const dot: CSSProperties = { position: "absolute", insetInlineStart: 0, top: 4, width: 11, height: 11, borderRadius: 99, background: accent, border: "2.5px solid #fff", boxShadow: `0 0 0 1.5px ${accent}` };

  const heading = (t: string) => (
    <h2 style={{ fontSize: "12.5pt", fontWeight: 700, color: "#24303f", margin: "0 0 10pt", display: "flex", alignItems: "center", gap: 9 }}>
      <span style={{ width: 4, height: 16, background: accent, borderRadius: 2, display: "inline-block", flexShrink: 0 }} />
      {t}
    </h2>
  );

  return (
    <div data-std="career-timeline" dir={lang === "ar" ? "rtl" : "ltr"} style={{ padding: "13mm 15mm", fontFamily: sans, color: "#24303f", textAlign: "start" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, paddingBottom: 10, borderBottom: "2px solid #e2e8f0", marginBottom: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: "22pt", fontWeight: 800, margin: 0, color: "#111827", letterSpacing: tracking(lang, "0.3px") }}>
            {pick(p.fullName, lang) || (lang === "ar" ? "الاسم الكامل" : "Your Name")}
          </h1>
          {pick(p.jobTitle, lang) && <p style={{ fontSize: "12pt", margin: "3pt 0 0", color: accent, fontWeight: 600 }}>{pick(p.jobTitle, lang)}</p>}
        </div>
        {showPhoto && p.photo && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={p.photo} alt="" style={{ width: 76, height: 76, borderRadius: "50%", objectFit: "cover", border: `2.5px solid ${accent}`, flexShrink: 0 }} />
        )}
        <div style={{ fontSize: "9pt", textAlign: "end", lineHeight: 1.6, color: "#475569", display: "grid", gap: 2, minWidth: 0 }}>
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
        <section style={{ marginBottom: 13 }}>
          {heading(slabel("summary", lang))}
          <p style={{ margin: 0, lineHeight: 1.55, fontSize: "10.5pt", color: "#334155" }}>{pick(p.summary, lang)}</p>
        </section>
      )}

      {data.experience.length > 0 && (
        <section style={{ marginBottom: 13 }}>
          {heading(slabel("experience", lang))}
          <div style={{ position: "relative" }}>
            {/* vertical timeline rail */}
            <div style={{ position: "absolute", insetInlineStart: 5, top: 6, bottom: 14, width: 2, background: "#e2e8f0" }} />
            {data.experience.map((e) => (
              <div key={e.id} style={entry}>
                <span style={dot} />
                <div style={{ fontWeight: 700, fontSize: "11.5pt", color: "#111827" }}>{pick(e.position, lang)}</div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: "9.8pt", color: "#64748b" }}>
                  <span>
                    {pick(e.company, lang)}
                    {pick(e.city, lang) ? ` — ${pick(e.city, lang)}` : ""}
                  </span>
                  <span style={{ whiteSpace: "nowrap", color: accent, fontWeight: 600 }}>{dateRange(e.startDate, e.endDate, e.current, lang)}</span>
                </div>
                <div style={{ marginTop: 3 }}>
                  <Bullets text={pick(e.description, lang)} style={{ fontSize: "10pt", color: "#334155" }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.education.length > 0 && (
        <section style={{ marginBottom: 13 }}>
          {heading(slabel("education", lang))}
          {data.education.map((ed) => (
            <div key={ed.id} style={{ ...entry, paddingBottom: 8 }}>
              <span style={dot} />
              <div style={{ fontWeight: 700, fontSize: "11.5pt", color: "#111827" }}>
                {pick(ed.degree, lang)}{pick(ed.field, lang) ? ` — ${pick(ed.field, lang)}` : ""}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: "9.8pt", color: "#64748b" }}>
                <span>{pick(ed.institution, lang)}</span>
                <span style={{ whiteSpace: "nowrap", color: accent, fontWeight: 600 }}>{dateRange(ed.startDate, ed.endDate, ed.current, lang)}</span>
              </div>
              {pick(ed.grade, lang) && <div style={{ fontSize: "9.5pt", color: "#64748b" }}>{pick(ed.grade, lang)}</div>}
            </div>
          ))}
        </section>
      )}

      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {data.skills.length > 0 && (
          <section style={{ flex: 1, minWidth: 0 }}>
            {heading(slabel("skills", lang))}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "4px 14px", fontSize: "9.8pt", color: "#334155" }}>
              {data.skills.map((s) => (
                <div key={s.id} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ width: 7, height: 7, background: accent, borderRadius: 2, flexShrink: 0 }} />
                  <span>{pick(s.name, lang)}</span>
                </div>
              ))}
            </div>
          </section>
        )}
        {data.languages.length > 0 && (
          <section style={{ flex: 1, minWidth: 0 }}>
            {heading(slabel("languages", lang))}
            <LanguageList data={data} lang={lang} />
          </section>
        )}
      </div>

      {data.certifications.length > 0 && (
        <section style={{ marginTop: 13, marginBottom: 13 }}>
          {heading(slabel("certifications", lang))}
          <CertsList data={data} lang={lang} />
        </section>
      )}

      {data.projects.length > 0 && (
        <section style={{ marginTop: 13, marginBottom: 13 }}>
          {heading(slabel("projects", lang))}
          <ProjectsList data={data} lang={lang} nameStyle={{ color: "#111827" }} />
        </section>
      )}

      <CustomSections data={data} lang={lang} heading={heading} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   9. EUROPASS STANDARD  (elegant-dark)
   المعيار: نموذج Europass الرسمي المعتمد في الاتحاد الأوروبي —
   ترويسة شبكية (الاسم/المسمى + بيانات التواصل + صورة مربعة)، أشرطة عناوين
   زرقاء كحلية، ترتيب: الخبرة ← التعليم والتدريب ← اللغات (بمرجعية CEFR) ←
   المهارات ← الشهادات، ومعلومات إضافية في النهاية.
   ══════════════════════════════════════════════════════════════════════════ */
const EU_NAVY = "#1f4e79";
const EU_BLUE = "#2e75b6";

export function ElegantDark({ data, lang, font, showPhoto }: TemplateProps) {
  const p = data.personal;
  const sans = font === "classic" ? FONT_STACKS.classic : FONT_STACKS.modern;
  const sec: CSSProperties = {
    fontSize: "11.5pt", fontWeight: 700, color: "#fff", background: EU_NAVY,
    padding: "4px 12px", margin: "12pt 0 8pt", letterSpacing: tracking(lang, "0.4px"),
  };
  const entry: CSSProperties = { marginBottom: "9pt", breakInside: "avoid" };

  const heading = (t: string) => <h2 style={sec}>{t}</h2>;

  return (
    <div data-std="europass" dir={lang === "ar" ? "rtl" : "ltr"} style={{ padding: "13mm 14mm", fontFamily: sans, color: "#1e293b", textAlign: "start" }}>
      {/* Europass header grid: name block | personal info | photo */}
      <header style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingBottom: 10, borderBottom: `2px solid ${EU_NAVY}`, marginBottom: 4 }}>
        <div style={{ flex: 1.3, minWidth: 0 }}>
          <h1 style={{ fontSize: "22pt", fontWeight: 800, margin: 0, color: EU_NAVY, lineHeight: 1.15 }}>
            {pick(p.fullName, lang) || (lang === "ar" ? "الاسم الكامل" : "Your Name")}
          </h1>
          {pick(p.jobTitle, lang) && <p style={{ fontSize: "12.5pt", margin: "4pt 0 0", color: EU_BLUE, fontWeight: 600 }}>{pick(p.jobTitle, lang)}</p>}
        </div>
        <div style={{ flex: 1.2, minWidth: 0, fontSize: "9.3pt", color: "#334155", display: "grid", gap: 3, paddingTop: 4 }}>
          {contactItems(data, lang).map((it, i) => (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", wordBreak: "break-word" }}>
              <MiniIcon name={it.icon} size={10} style={{ color: EU_BLUE, marginTop: 2 }} />
              <span style={{ unicodeBidi: "plaintext" }}>
                {it.href ? (
                  <a href={it.href} style={{ color: "inherit", textDecoration: "underline" }}>{it.value}</a>
                ) : (
                  it.value
                )}
              </span>
            </div>
          ))}
        </div>
        {showPhoto && p.photo && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={p.photo} alt="" style={{ width: 88, height: 100, objectFit: "cover", border: `1.5px solid ${EU_NAVY}`, flexShrink: 0 }} />
        )}
      </header>

      {/* Europass order: Work Experience → Education & Training → Languages → Skills → Certs → Projects */}
      {data.experience.length > 0 && (
        <section style={{ marginTop: 8 }}>
          {heading(lang === "ar" ? "الخبرة المهنية" : "Work Experience")}
          {data.experience.map((e) => (
            <div key={e.id} style={entry}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                <span style={{ fontWeight: 700, fontSize: "11pt", color: EU_NAVY }}>
                  {pick(e.position, lang)}
                  {pick(e.company, lang) ? ` — ${pick(e.company, lang)}` : ""}
                </span>
                <span style={{ whiteSpace: "nowrap", fontSize: "9.3pt", color: "#475569", fontWeight: 600 }}>{dateRange(e.startDate, e.endDate, e.current, lang)}</span>
              </div>
              {pick(e.city, lang) && <div style={{ fontSize: "9.3pt", color: "#64748b" }}>{pick(e.city, lang)}</div>}
              <div style={{ marginTop: 2 }}>
                <Bullets text={pick(e.description, lang)} style={{ fontSize: "9.8pt", color: "#334155" }} bulletStyle={{ color: EU_BLUE }} />
              </div>
            </div>
          ))}
        </section>
      )}

      {data.education.length > 0 && (
        <section>
          {heading(lang === "ar" ? "التعليم والتدريب" : "Education and Training")}
          {data.education.map((ed) => (
            <div key={ed.id} style={entry}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                <span style={{ fontWeight: 700, fontSize: "11pt", color: EU_NAVY }}>
                  {pick(ed.degree, lang)}{pick(ed.field, lang) ? ` — ${pick(ed.field, lang)}` : ""}
                </span>
                <span style={{ whiteSpace: "nowrap", fontSize: "9.3pt", color: "#475569", fontWeight: 600 }}>{dateRange(ed.startDate, ed.endDate, ed.current, lang)}</span>
              </div>
              <div style={{ fontSize: "9.8pt", color: "#334155" }}>
                {pick(ed.institution, lang)}{pick(ed.grade, lang) ? ` — ${pick(ed.grade, lang)}` : ""}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Europass mother-tongue / CEFR-style language table */}
      {data.languages.length > 0 && (
        <section>
          {heading(lang === "ar" ? "المهارات اللغوية" : "Language Skills")}
          <div style={{ border: `1px solid ${EU_NAVY}44`, borderRadius: 4, overflow: "hidden" }}>
            {data.languages.map((l, i) => (
              <div key={l.id} style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", fontSize: "9.8pt",
                background: i % 2 ? "#f0f5fa" : "#fff",
                borderBottom: i < data.languages.length - 1 ? `1px solid ${EU_NAVY}22` : "none",
              }}>
                <span style={{ padding: "4px 10px", fontWeight: 600, color: EU_NAVY }}>{pick(l.name, lang)}</span>
                <span style={{ padding: "4px 10px", color: "#334155" }}>{levelLabel(l.level, lang)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.skills.length > 0 && (
        <section>
          {heading(lang === "ar" ? "المهارات الرقمية والمهارات الأخرى" : "Digital & Other Skills")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "3px 20px", fontSize: "9.8pt", color: "#334155" }}>
            {data.skills.map((s) => (
              <div key={s.id} style={{ display: "flex", gap: 7, alignItems: "baseline" }}>
                <span style={{ color: EU_BLUE, flexShrink: 0 }}>–</span>
                <span>{pick(s.name, lang)}</span>
              </div>
            ))}
          </div>
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
          <ProjectsList data={data} lang={lang} nameStyle={{ color: EU_NAVY }} />
        </section>
      )}

      <CustomSections data={data} lang={lang} heading={heading} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   10. CREATIVE PROFESSIONAL  (contemporary)
   المعيار: النمط الإبداعي المعتمد لدى منصات التصميم (Canva / Enhancv) لمجالات
   التسويق والإعلام والتصميم — ترويسة متدرجة اللون، شارات مهارات بمستويات،
   وتقسيم سفلي بعمودين للمهارات واللغات.
   ══════════════════════════════════════════════════════════════════════════ */

/** darken a hex accent for the gradient stop */
function shade(hex: string, amt: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const c = [1, 2, 3].map((i) => Math.max(0, Math.min(255, parseInt(m[i], 16) + amt)));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}

export function Contemporary({ data, lang, accent, font, showPhoto }: TemplateProps) {
  const p = data.personal;
  const sans = font === "classic" ? FONT_STACKS.classic : FONT_STACKS.modern;
  const dark = shade(accent, -46);
  const sec: CSSProperties = {
    fontSize: "12pt", fontWeight: 700, margin: "0 0 7pt", display: "flex", alignItems: "center", gap: 8, color: "#1f2937",
  };
  const entry: CSSProperties = { marginBottom: "10pt", breakInside: "avoid" };

  const heading = (t: string) => (
    <h2 style={sec}>
      <span style={{ width: 12, height: 12, borderRadius: "3px 8px 3px 8px", background: `linear-gradient(135deg, ${accent}, ${dark})`, display: "inline-block", flexShrink: 0 }} />
      {t}
      <span style={{ flex: 1, height: 1.5, background: `linear-gradient(90deg, ${accent}88, transparent)` }} />
    </h2>
  );

  return (
    <div data-std="creative" dir={lang === "ar" ? "rtl" : "ltr"} style={{ fontFamily: sans, background: "#fff", color: "#1f2937", textAlign: "start" }}>
      {/* gradient header */}
      <header style={{ background: `linear-gradient(130deg, ${accent} 0%, ${dark} 100%)`, color: "#fff", padding: "10mm 15mm 9mm" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {showPhoto && p.photo && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={p.photo} alt="" style={{ width: 86, height: 86, borderRadius: "18px 50% 18px 50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.7)", flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: "25pt", fontWeight: 800, margin: 0, letterSpacing: tracking(lang, "0.3px"), lineHeight: 1.12 }}>
              {pick(p.fullName, lang) || (lang === "ar" ? "الاسم الكامل" : "Your Name")}
            </h1>
            {pick(p.jobTitle, lang) && (
              <p style={{ fontSize: "13pt", margin: "4pt 0 8pt", opacity: 0.93, fontWeight: 600 }}>{pick(p.jobTitle, lang)}</p>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", fontSize: "9.3pt", opacity: 0.96 }}>
              {contactItems(data, lang).map((it, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <MiniIcon name={it.icon} size={11} style={{ opacity: 0.9 }} />
                  {it.href ? (
                    <a href={it.href} style={{ color: "inherit", textDecoration: "underline" }}>
                      <span style={{ unicodeBidi: "plaintext" }}>{it.value}</span>
                    </a>
                  ) : (
                    <span style={{ unicodeBidi: "plaintext" }}>{it.value}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div style={{ padding: "8mm 15mm 10mm" }}>
        {hasSection(data, "summary") && (
          <section style={{ marginBottom: 12 }}>
            {heading(slabel("summary", lang))}
            <p style={{ margin: 0, lineHeight: 1.6, fontSize: "10.5pt", color: "#374151" }}>{pick(p.summary, lang)}</p>
          </section>
        )}

        {data.experience.length > 0 && (
          <section style={{ marginBottom: 12 }}>
            {heading(slabel("experience", lang))}
            {data.experience.map((e) => (
              <div key={e.id} style={entry}>
                <div style={{ fontWeight: 700, fontSize: "11.5pt", color: dark }}>{pick(e.position, lang)}</div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: "10pt", color: "#6b7280" }}>
                  <span>
                    {pick(e.company, lang)}
                    {pick(e.city, lang) ? ` — ${pick(e.city, lang)}` : ""}
                  </span>
                  <span style={{ whiteSpace: "nowrap", fontWeight: 600, color: accent }}>{dateRange(e.startDate, e.endDate, e.current, lang)}</span>
                </div>
                <div style={{ marginTop: 3, borderInlineStart: `2.5px solid ${accent}55`, paddingInlineStart: 10 }}>
                  <Bullets text={pick(e.description, lang)} style={{ fontSize: "10pt", color: "#374151" }} />
                </div>
              </div>
            ))}
          </section>
        )}

        {data.education.length > 0 && (
          <section style={{ marginBottom: 12 }}>
            {heading(slabel("education", lang))}
            {data.education.map((ed) => (
              <div key={ed.id} style={{ ...entry, background: `${accent}0d`, borderInlineStart: `3px solid ${accent}`, borderRadius: 6, padding: "7px 12px" }}>
                <div style={{ fontWeight: 700, fontSize: "11pt", color: dark }}>
                  {pick(ed.degree, lang)}{pick(ed.field, lang) ? ` — ${pick(ed.field, lang)}` : ""}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: "9.8pt", color: "#6b7280" }}>
                  <span>{pick(ed.institution, lang)}{pick(ed.grade, lang) ? ` — ${pick(ed.grade, lang)}` : ""}</span>
                  <span style={{ whiteSpace: "nowrap", fontWeight: 600, color: accent }}>{dateRange(ed.startDate, ed.endDate, ed.current, lang)}</span>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* two-column bottom half: skills chips | languages */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          {data.skills.length > 0 && (
            <section style={{ flex: 1.2, minWidth: 0 }}>
              {heading(slabel("skills", lang))}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {data.skills.map((s) => (
                  <span key={s.id} style={{ border: `1.5px solid ${accent}`, color: dark, padding: "3px 10px", fontSize: "9.3pt", borderRadius: 99, background: `${accent}0f` }}>
                    {pick(s.name, lang)}
                  </span>
                ))}
              </div>
            </section>
          )}
          {data.languages.length > 0 && (
            <section style={{ flex: 1, minWidth: 0 }}>
              {heading(slabel("languages", lang))}
              <LanguageList data={data} lang={lang} />
            </section>
          )}
        </div>

        {data.certifications.length > 0 && (
          <section style={{ marginTop: 12, marginBottom: 12 }}>
            {heading(slabel("certifications", lang))}
            <CertsList data={data} lang={lang} />
          </section>
        )}

        {data.projects.length > 0 && (
          <section style={{ marginTop: 12, marginBottom: 12 }}>
            {heading(slabel("projects", lang))}
            <ProjectsList data={data} lang={lang} nameStyle={{ color: dark }} />
          </section>
        )}

        <CustomSections data={data} lang={lang} heading={heading} />
      </div>
    </div>
  );
}
