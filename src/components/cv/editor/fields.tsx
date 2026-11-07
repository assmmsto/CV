"use client";

import { BiText, Lang } from "@/lib/cv/types";
import { dict } from "@/lib/cv/i18n";
import { Input, Textarea, Button, Label } from "@/components/ui";
import { Upload, Trash2, Copy, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { ChangeEvent } from "react";

/** Two synced inputs (Arabic + English) for one logical field. */
export function BiField({
  label, value, onChange, textarea = false, rows = 3, placeholder, hint, compact = false,
}: {
  label: string;
  value: BiText;
  onChange: (v: BiText) => void;
  textarea?: boolean;
  rows?: number;
  placeholder?: { ar?: string; en?: string };
  hint?: string;
  compact?: boolean;
}) {
  const dir = (s: string) => (/[\u0600-\u06FF]/.test(s) ? "rtl" : "ltr");
  const Cmp = textarea ? Textarea : Input;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Label className="text-sm font-semibold">{label}</Label>
        {hint && !compact && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      <div className={textarea ? "grid gap-2 md:grid-cols-2" : "grid gap-2 md:grid-cols-2"}>
        <div className="relative">
          <span className="absolute top-1.5 inset-inline-start-2 z-10 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 pointer-events-none" style={{ insetInlineStart: 8 }}>
            ع
          </span>
          <Cmp
            dir="rtl"
            value={value.ar}
            rows={textarea ? rows : undefined}
            onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...value, ar: e.target.value })}
            placeholder={placeholder?.ar ?? "النص العربي…"}
            className="ps-9 text-sm"
          />
        </div>
        <div className="relative">
          <span className="absolute top-1.5 z-10 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 pointer-events-none" style={{ insetInlineStart: 8 }}>
            EN
          </span>
          <Cmp
            dir="ltr"
            value={value.en}
            rows={textarea ? rows : undefined}
            onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...value, en: e.target.value })}
            placeholder={placeholder?.en ?? "English text…"}
            className="ps-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

/** Single plain (non-bilingual) field. */
export function PlainField({
  label, value, onChange, type = "text", placeholder, dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold">{label}</Label>
      <Input type={type} dir={dir ?? (type === "email" || type === "tel" || type === "url" ? "ltr" : undefined)} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="text-sm" />
    </div>
  );
}

/** Reusable collapsible card for list items with actions. */
export function ItemCard({
  title, subtitle, expanded, onToggle, onDelete, onDuplicate, onMove, lang, children, index,
}: {
  title: string;
  subtitle?: string;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onMove?: (dir: -1 | 1) => void;
  lang: Lang;
  children: React.ReactNode;
  index: number;
}) {
  const upIcon = lang === "ar" ? ChevronDown : ChevronUp;
  const downIcon = lang === "ar" ? ChevronUp : ChevronDown;
  const Up = upIcon;
  const Down = downIcon;
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center gap-2 p-3 cursor-pointer select-none hover:bg-accent/40" onClick={onToggle} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onToggle()} aria-expanded={expanded}>
        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold shrink-0">{index + 1}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">{title || "—"}</div>
          {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
        </div>
        <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {onMove && (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onMove(-1)} aria-label={dict.moveUp[lang]}><Up className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onMove(1)} aria-label={dict.moveDown[lang]}><Down className="h-4 w-4" /></Button>
            </>
          )}
          {onDuplicate && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDuplicate} aria-label={dict.duplicate[lang]}><Copy className="h-4 w-4" /></Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete} aria-label={dict.delete[lang]}><Trash2 className="h-4 w-4" /></Button>
          <span className="ms-1 text-muted-foreground">{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
        </div>
      </div>
      {expanded && <div className="px-3 pb-4 pt-1 border-t space-y-3">{children}</div>}
    </div>
  );
}
