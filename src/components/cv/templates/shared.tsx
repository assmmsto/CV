"use client";

import { BiText, CVData, Lang } from "@/lib/cv/types";
import { levelLabel, slabel } from "@/lib/cv/i18n";
import type { CSSProperties, ReactNode } from "react";

export interface TemplateProps {
  data: CVData;
  lang: Lang;
  accent: string;
  showPhoto: boolean;
  font: "modern" | "classic" | "mixed";
}

export const FONT_STACKS: Record<"modern" | "classic" | "mixed", string> = {
  modern: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
  classic: "'Times New Roman', Times, Georgia, serif",
  mixed: "Georgia, 'Times New Roman', Times, serif",
};

/** Pick the text in the requested language with graceful fallback. */
export function pick(b: BiText | undefined, lang: Lang): string {
  if (!b) return "";
  return (b[lang] || b.ar || b.en || "").trim();
}

export function splitLines(s: string): string[] {
  return (s ?? "")
    .split("\n")
    .map((l) => l.replace(/^[\u2022\-*·▪◦]\s*/, "").trim())
    .filter(Boolean);
}

export function dateRange(
  start: string,
  end: string,
  current: boolean,
  lang: Lang
): string {
  const s = (start ?? "").trim();
  const e = current
    ? lang === "ar"
      ? "حتى الآن"
      : "Present"
    : (end ?? "").trim();
  if (s && e) return `${s} — ${e}`;
  return s || e || "";
}

export interface ContactItem {
  icon: string;
  value: string;
}

export function contactItems(data: CVData, lang: Lang): ContactItem[] {
  const p = data.personal;
  const items: ContactItem[] = [];
  if (p.email) items.push({ icon: "email", value: p.email });
  if (p.phone) items.push({ icon: "phone", value: p.phone });
  const loc = [pick(p.city, lang), pick(p.country, lang)].filter(Boolean).join(lang === "ar" ? "، " : ", ");
  if (loc) items.push({ icon: "location", value: loc });
  if (p.linkedin) items.push({ icon: "linkedin", value: p.linkedin });
  if (p.github) items.push({ icon: "github", value: p.github });
  if (p.website) items.push({ icon: "web", value: p.website });
  return items;
}

export function hasSection(data: CVData, key: string): boolean {
  switch (key) {
    case "summary":
      return Boolean(pick(data.personal.summary, "ar") || pick(data.personal.summary, "en"));
    case "experience":
      return data.experience.length > 0;
    case "education":
      return data.education.length > 0;
    case "skills":
      return data.skills.length > 0;
    case "languages":
      return data.languages.length > 0;
    case "certifications":
      return data.certifications.length > 0;
    case "projects":
      return data.projects.length > 0;
    default:
      return false;
  }
}

/** Bullet list from a newline-separated description. */
export function Bullets({ text, style, bulletStyle }: {
  text: string;
  style?: CSSProperties;
  bulletStyle?: CSSProperties;
}) {
  const lines = splitLines(text);
  if (lines.length === 0) return null;
  if (lines.length === 1 && lines[0].length > 0 && !text.includes("\n")) {
    return <p style={{ margin: 0, ...style }}>{lines[0]}</p>;
  }
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none", ...style }}>
      {lines.map((l, i) => (
        <li key={i} style={{ display: "flex", gap: "6px", marginBottom: "2px" }}>
          <span aria-hidden style={{ flexShrink: 0, ...bulletStyle }}>•</span>
          <span>{l}</span>
        </li>
      ))}
    </ul>
  );
}

/** Simple icon glyphs as inline SVG (no external icons in print). */
const iconPaths: Record<string, ReactNode> = {
  email: <path d="M2 4h12v8H2zM2 4l6 5 6-5" fill="none" stroke="currentColor" strokeWidth="1.2" />,
  phone: <path d="M3 2h3l1 3-1.7 1.2a9 9 0 0 0 3.5 3.5L10 8l3 1v3a1 1 0 0 1-1.1 1A10 10 0 0 1 2 3.1 1 1 0 0 1 3 2z" fill="currentColor" stroke="none" />,
  location: <path d="M8 1a4.5 4.5 0 0 1 4.5 4.5C12.5 8.5 8 13 8 13S3.5 8.5 3.5 5.5A4.5 4.5 0 0 1 8 1zm0 2.8a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4z" fill="currentColor" stroke="none" />,
  linkedin: <path d="M3 1.5a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8zM2 5.5h2V13H2zM6 5.5h1.9v1a2.6 2.6 0 0 1 2.3-1.2c2 0 2.8 1.2 2.8 3.2V13h-2V9c0-1-.3-1.7-1.2-1.7S8 8 8 9v4H6z" fill="currentColor" stroke="none" />,
  github: <path d="M8 1a7 7 0 0 0-2.2 13.6c-.3-.1-.4-.5-.4-.8v-1.4c-1.9.4-2.3-.9-2.3-.9-.3-.8-.8-1-.8-1-.6-.4 0-.4 0-.4.7 0 1.1.7 1.1.7.6 1.1 1.7.8 2.1.6.1-.5.3-.8.5-1-1.5-.2-3.2-.8-3.2-3.4 0-.8.3-1.4.7-1.9-.1-.2-.3-.9.1-1.9 0 0 .6-.2 1.9.7a6.6 6.6 0 0 1 3.5 0c1.3-.9 1.9-.7 1.9-.7.4 1 .2 1.7.1 1.9.4.5.7 1.1.7 1.9 0 2.6-1.7 3.2-3.2 3.4.3.2.5.7.5 1.4v2c0 .3-.1.7-.4.8A7 7 0 0 0 8 1z" fill="currentColor" stroke="none" />,
  web: <path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1zm0 1.5c-.8 0-1.9 2-2 5.5h4c-.1-3.5-1.2-5.5-2-5.5zM4.6 8c.1 1.9.5 3.4 1 4.4.2-1 .3-2.5.3-4.4H4.6zm0-1.5h1.3c0-1.5.1-2.8.3-3.8-1 .9-1.5 2.3-1.6 3.8zm6.8 1.5H10c0 1.9.1 3.4.3 4.4.5-1 .9-2.5 1.1-4.4zm0-1.5c-.1-1.5-.6-2.9-1.6-3.8.2 1 .3 2.3.3 3.8h1.3z" fill="currentColor" stroke="none" />,
};

export function MiniIcon({ name, size = 10, style }: { name: string; size?: number; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      style={{ display: "inline-block", flexShrink: 0, ...style }}
      aria-hidden
    >
      {iconPaths[name] ?? null}
    </svg>
  );
}

export function ContactLine({ data, lang, style, itemStyle, iconColor }: {
  data: CVData;
  lang: Lang;
  style?: CSSProperties;
  itemStyle?: CSSProperties;
  iconColor?: string;
}) {
  const items = contactItems(data, lang);
  if (!items.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", ...style }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "4px", ...itemStyle }}>
          <MiniIcon name={it.icon} style={{ color: iconColor ?? "currentColor", opacity: 0.85 }} />
          <span style={{ unicodeBidi: "plaintext" }}>{it.value}</span>
        </span>
      ))}
    </div>
  );
}

export function SkillBars({ data, lang, accent, barH = 4 }: { data: CVData; lang: Lang; accent: string; barH?: number }) {
  if (!data.skills.length) return null;
  return (
    <div>
      {data.skills.map((s) => (
        <div key={s.id} style={{ marginBottom: "6px" }}>
          <div style={{ fontSize: "9.5px", marginBottom: "2px" }}>{pick(s.name, lang)}</div>
          <div style={{ height: barH, background: "rgba(0,0,0,0.12)", borderRadius: 99 }}>
            <div style={{ width: `${(s.level / 5) * 100}%`, height: "100%", background: accent, borderRadius: 99 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LanguageList({ data, lang }: { data: CVData; lang: Lang }) {
  if (!data.languages.length) return null;
  return (
    <div>
      {data.languages.map((l) => (
        <div key={l.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
          <span>{pick(l.name, lang)}</span>
          <span style={{ opacity: 0.75 }}>{levelLabel(l.level, lang)}</span>
        </div>
      ))}
    </div>
  );
}

export function ProjectsList({ data, lang, nameStyle }: { data: CVData; lang: Lang; nameStyle?: CSSProperties }) {
  if (!data.projects.length) return null;
  return (
    <div>
      {data.projects.map((p) => (
        <div key={p.id} style={{ marginBottom: "8px" }}>
          <div style={{ fontWeight: 700, ...nameStyle }}>
            {pick(p.name, lang)}
            {p.url ? <span style={{ fontWeight: 400, opacity: 0.8 }}> — {p.url}</span> : null}
          </div>
          {pick(p.description, lang) && (
            <p style={{ margin: "1px 0 0" }}>{pick(p.description, lang)}</p>
          )}
          {pick(p.technologies, lang) && (
            <p style={{ margin: "1px 0 0", opacity: 0.8, fontSize: "0.92em" }}>
              {lang === "ar" ? "الأدوات: " : "Tools: "}
              {pick(p.technologies, lang)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function CertsList({ data, lang }: { data: CVData; lang: Lang }) {
  if (!data.certifications.length) return null;
  return (
    <div>
      {data.certifications.map((c) => (
        <div key={c.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
          <span>
            <b>{pick(c.name, lang)}</b>
            {pick(c.issuer, lang) ? <span style={{ opacity: 0.8 }}> — {pick(c.issuer, lang)}</span> : null}
            {c.url ? <span style={{ opacity: 0.8 }}> — {c.url}</span> : null}
          </span>
          <span style={{ opacity: 0.75, flexShrink: 0 }}>{c.date}</span>
        </div>
      ))}
    </div>
  );
}

export function CustomSections({ data, lang, heading }: { data: CVData; lang: Lang; heading: (title: string) => ReactNode }) {
  if (!data.customSections.length) return null;
  return (
    <>
      {data.customSections.map((cs) => (
        <section key={cs.id}>
          {heading(pick(cs.title, lang) || slabel("skills", lang))}
          <p style={{ margin: 0, whiteSpace: "pre-line" }}>{pick(cs.content, lang)}</p>
        </section>
      ))}
    </>
  );
}

export const px = (n: number) => `${n}px`;
