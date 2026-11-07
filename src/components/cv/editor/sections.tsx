"use client";

import { useCVStore } from "@/lib/cv/store";
import { dict, levelLabel } from "@/lib/cv/i18n";
import { BiField, PlainField, ItemCard } from "./fields";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Slider } from "@/components/ui";
import { Briefcase, GraduationCap, Sparkles, Globe2, Award, FolderKanban, PlusCircle } from "lucide-react";
import type { Lang, BiText } from "@/lib/cv/types";

const SectionShell = ({ title, icon, onAdd, addLabel, children, count }: {
  title: string; icon: React.ReactNode; onAdd: () => void; addLabel: string; children: React.ReactNode; count: number;
}) => (
  <Card>
    <CardHeader className="flex-row items-center justify-between space-y-0">
      <CardTitle className="flex items-center gap-2 text-base">
        {icon}
        {title}
        {count > 0 && <span className="text-xs font-normal text-muted-foreground">({count})</span>}
      </CardTitle>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={onAdd}>
        <PlusCircle className="h-4 w-4" />{addLabel}
      </Button>
    </CardHeader>
    <CardContent className="space-y-3">{children}</CardContent>
  </Card>
);

const emptyBi = (): BiText => ({ ar: "", en: "" });

/* ---------- Experience ---------- */
export function ExperienceSection({ lang }: { lang: Lang }) {
  const { data, addExperience, updateExperience, removeExperience, duplicateExperience, moveExperience } = useCVStore();
  return (
    <SectionShell title={dict.secExperience[lang]} icon={<Briefcase className="h-4 w-4 text-amber-600" />} onAdd={addExperience} addLabel={dict.addExperience[lang]} count={data.experience.length}>
      {data.experience.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">{dict.emptyCv[lang]}</p>}
      {data.experience.map((e, i) => (
        <ItemCard key={e.id} index={i} lang={lang}
          title={e.position.ar || e.position.en || e.company.ar || e.company.en}
          subtitle={`${e.company.ar || e.company.en || ""} ${e.startDate ? `(${e.startDate}${e.current ? " →" : ` — ${e.endDate}`})` : ""}`.trim() || undefined}
          expanded onToggle={() => {}} onDelete={() => removeExperience(e.id)} onDuplicate={() => duplicateExperience(e.id)} onMove={(d) => moveExperience(e.id, d)}>
          <div className="grid gap-3 md:grid-cols-2">
            <BiField label={dict.position[lang]} value={e.position} onChange={(v) => updateExperience(e.id, { position: v })} compact />
            <BiField label={dict.company[lang]} value={e.company} onChange={(v) => updateExperience(e.id, { company: v })} compact />
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <PlainField label={dict.startDate[lang]} value={e.startDate} onChange={(v) => updateExperience(e.id, { startDate: v })} placeholder="MM/YYYY" dir="ltr" />
            <PlainField label={dict.endDate[lang]} value={e.current ? "" : e.endDate} onChange={(v) => updateExperience(e.id, { endDate: v })} placeholder={e.current ? dict.currently[lang] : "MM/YYYY"} dir="ltr" />
            <div className="flex items-end gap-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm pb-2 cursor-pointer">
                <input type="checkbox" checked={e.current} onChange={(ev) => updateExperience(e.id, { current: ev.target.checked })} className="h-4 w-4 accent-amber-600" />
                {dict.currentJob[lang]}
              </label>
            </div>
          </div>
          <BiField label={dict.city[lang]} value={e.city} onChange={(v) => updateExperience(e.id, { city: v })} compact />
          <BiField label={dict.description[lang]} value={e.description} onChange={(v) => updateExperience(e.id, { description: v })} textarea rows={4} hint={dict.achievementsHint[lang]} />
        </ItemCard>
      ))}
    </SectionShell>
  );
}

/* ---------- Education ---------- */
export function EducationSection({ lang }: { lang: Lang }) {
  const { data, addEducation, updateEducation, removeEducation, duplicateEducation, moveEducation } = useCVStore();
  return (
    <SectionShell title={dict.secEducation[lang]} icon={<GraduationCap className="h-4 w-4 text-amber-600" />} onAdd={addEducation} addLabel={dict.addEducation[lang]} count={data.education.length}>
      {data.education.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">{dict.emptyCv[lang]}</p>}
      {data.education.map((ed, i) => (
        <ItemCard key={ed.id} index={i} lang={lang}
          title={ed.degree.ar || ed.degree.en || ed.institution.ar || ed.institution.en}
          subtitle={ed.institution.ar || ed.institution.en || undefined}
          expanded onToggle={() => {}} onDelete={() => removeEducation(ed.id)} onDuplicate={() => duplicateEducation(ed.id)} onMove={(d) => moveEducation(ed.id, d)}>
          <div className="grid gap-3 md:grid-cols-2">
            <BiField label={dict.degree[lang]} value={ed.degree} onChange={(v) => updateEducation(ed.id, { degree: v })} compact />
            <BiField label={dict.institution[lang]} value={ed.institution} onChange={(v) => updateEducation(ed.id, { institution: v })} compact />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <BiField label={dict.field[lang]} value={ed.field} onChange={(v) => updateEducation(ed.id, { field: v })} compact />
            <BiField label={dict.grade[lang]} value={ed.grade} onChange={(v) => updateEducation(ed.id, { grade: v })} compact />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <PlainField label={dict.startDate[lang]} value={ed.startDate} onChange={(v) => updateEducation(ed.id, { startDate: v })} placeholder="YYYY" dir="ltr" />
            <PlainField label={dict.endDate[lang]} value={ed.current ? "" : ed.endDate} onChange={(v) => updateEducation(ed.id, { endDate: v })} placeholder={ed.current ? dict.currently[lang] : "YYYY"} dir="ltr" />
            <label className="flex items-center gap-2 text-sm pb-2.5 cursor-pointer">
              <input type="checkbox" checked={ed.current} onChange={(ev) => updateEducation(ed.id, { current: ev.target.checked })} className="h-4 w-4 accent-amber-600" />
              {dict.currentJob[lang]}
            </label>
          </div>
        </ItemCard>
      ))}
    </SectionShell>
  );
}

/* ---------- Skills ---------- */
export function SkillsSection({ lang }: { lang: Lang }) {
  const { data, addSkill, updateSkill, removeSkill } = useCVStore();
  return (
    <SectionShell title={dict.secSkills[lang]} icon={<Sparkles className="h-4 w-4 text-amber-600" />} onAdd={addSkill} addLabel={dict.addSkill[lang]} count={data.skills.length}>
      {data.skills.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">{dict.emptyCv[lang]}</p>}
      <div className="grid gap-2">
        {data.skills.map((s) => (
          <div key={s.id} className="flex flex-wrap items-end gap-2 p-2.5 rounded-xl border bg-card">
            <div className="w-8 text-center text-xs font-bold text-muted-foreground" />
            <div className="flex-1 min-w-[180px]">
              <BiField label="" value={s.name} onChange={(v) => updateSkill(s.id, { name: v })} compact />
            </div>
            <div className="w-[130px] pb-1">
              <div className="text-xs text-muted-foreground mb-1">{dict.level[lang]}: {s.level}/5</div>
              <Slider value={[s.level]} min={1} max={5} step={1}
                onValueChange={(v: number[]) => updateSkill(s.id, { level: v[0] as 1 | 2 | 3 | 4 | 5 })} />
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeSkill(s.id)}>
              <i className="text-xs">✕</i>
            </Button>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ---------- Languages ---------- */
export function LanguagesSection({ lang }: { lang: Lang }) {
  const { data, addLanguage, updateLanguage, removeLanguage } = useCVStore();
  return (
    <SectionShell title={dict.secLanguages[lang]} icon={<Globe2 className="h-4 w-4 text-amber-600" />} onAdd={addLanguage} addLabel={dict.addLanguage[lang]} count={data.languages.length}>
      {data.languages.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">{dict.emptyCv[lang]}</p>}
      <div className="grid gap-2">
        {data.languages.map((l) => (
          <div key={l.id} className="flex flex-wrap items-end gap-2 p-2.5 rounded-xl border bg-card">
            <div className="flex-1 min-w-[160px]">
              <BiField label="" value={l.name} onChange={(v) => updateLanguage(l.id, { name: v })} compact />
            </div>
            <div className="w-[150px] pb-1">
              <div className="text-xs text-muted-foreground mb-1">{dict.level[lang]}</div>
              <Select value={l.level} onValueChange={(v) => updateLanguage(l.id, { level: v as typeof l.level })}>
                <SelectTrigger size="sm" className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["native", "fluent", "advanced", "intermediate", "basic"] as const).map((lv) => (
                    <SelectItem key={lv} value={lv}>{levelLabel(lv, lang)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeLanguage(l.id)}>
              <i className="text-xs">✕</i>
            </Button>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ---------- Certifications ---------- */
export function CertificationsSection({ lang }: { lang: Lang }) {
  const { data, addCertification, updateCertification, removeCertification } = useCVStore();
  return (
    <SectionShell title={dict.secCertifications[lang]} icon={<Award className="h-4 w-4 text-amber-600" />} onAdd={addCertification} addLabel={dict.addCertification[lang]} count={data.certifications.length}>
      {data.certifications.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">{dict.emptyCv[lang]}</p>}
      {data.certifications.map((c, i) => (
        <ItemCard key={c.id} index={i} lang={lang}
          title={c.name.ar || c.name.en}
          subtitle={c.issuer.ar || c.issuer.en || c.date || undefined}
          expanded onToggle={() => {}} onDelete={() => removeCertification(c.id)}>
          <BiField label={dict.certName[lang]} value={c.name} onChange={(v) => updateCertification(c.id, { name: v })} compact />
          <div className="grid gap-3 md:grid-cols-3">
            <BiField label={dict.issuer[lang]} value={c.issuer} onChange={(v) => updateCertification(c.id, { issuer: v })} compact />
            <PlainField label={dict.date[lang]} value={c.date} onChange={(v) => updateCertification(c.id, { date: v })} placeholder="YYYY" dir="ltr" />
            <PlainField label={dict.url[lang]} value={c.url} onChange={(v) => updateCertification(c.id, { url: v })} placeholder="https://…" dir="ltr" />
          </div>
        </ItemCard>
      ))}
    </SectionShell>
  );
}

/* ---------- Projects ---------- */
export function ProjectsSection({ lang }: { lang: Lang }) {
  const { data, addProject, updateProject, removeProject } = useCVStore();
  return (
    <SectionShell title={dict.secProjects[lang]} icon={<FolderKanban className="h-4 w-4 text-amber-600" />} onAdd={addProject} addLabel={dict.addProject[lang]} count={data.projects.length}>
      {data.projects.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">{dict.emptyCv[lang]}</p>}
      {data.projects.map((p, i) => (
        <ItemCard key={p.id} index={i} lang={lang}
          title={p.name.ar || p.name.en}
          expanded onToggle={() => {}} onDelete={() => removeProject(p.id)}>
          <BiField label={dict.projectName[lang]} value={p.name} onChange={(v) => updateProject(p.id, { name: v })} compact />
          <BiField label={dict.description[lang]} value={p.description} onChange={(v) => updateProject(p.id, { description: v })} textarea rows={3} compact />
          <div className="grid gap-3 md:grid-cols-2">
            <BiField label={dict.technologies[lang]} value={p.technologies} onChange={(v) => updateProject(p.id, { technologies: v })} compact />
            <PlainField label={dict.url[lang]} value={p.url} onChange={(v) => updateProject(p.id, { url: v })} placeholder="https://…" dir="ltr" />
          </div>
        </ItemCard>
      ))}
    </SectionShell>
  );
}

/* ---------- Custom sections ---------- */
export function CustomSectionsEditor({ lang }: { lang: Lang }) {
  const { data, addCustomSection, updateCustomSection, removeCustomSection } = useCVStore();
  return (
    <SectionShell title={dict.secCustom[lang]} icon={<PlusCircle className="h-4 w-4 text-amber-600" />} onAdd={addCustomSection} addLabel={dict.addSection[lang]} count={data.customSections.length}>
      {data.customSections.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">{dict.emptyCv[lang]}</p>}
      {data.customSections.map((cs, i) => (
        <ItemCard key={cs.id} index={i} lang={lang}
          title={cs.title.ar || cs.title.en}
          expanded onToggle={() => {}} onDelete={() => removeCustomSection(cs.id)}>
          <BiField label={dict.customTitle[lang]} value={cs.title} onChange={(v) => updateCustomSection(cs.id, { title: v })} compact />
          <BiField label={dict.customContent[lang]} value={cs.content} onChange={(v) => updateCustomSection(cs.id, { content: v })} textarea rows={3} compact />
        </ItemCard>
      ))}
    </SectionShell>
  );
}
