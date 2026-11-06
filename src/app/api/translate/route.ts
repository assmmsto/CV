import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const maxDuration = 120;

interface TranslateItem {
  key: string;
  text: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      items: TranslateItem[];
      target: "ar" | "en";
    };
    const items = body.items?.filter((i) => i.text && i.text.trim()) ?? [];
    if (!items.length) {
      return NextResponse.json({ ok: true, translations: {} });
    }

    const zai = await ZAI.create();
    const sourceLang = body.target === "ar" ? "English" : "Arabic";
    const targetLang = body.target === "ar" ? "Arabic" : "English";

    const numbered = items
      .map((i, idx) => `[${idx}] ${i.text.replace(/\n/g, "⏎")}`)
      .join("\n");

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content: `You are a professional CV/resume translator. Translate ${sourceLang} text to ${targetLang} for use in a professional resume. Keep the tone formal and professional. Preserve line structure: every newline is marked as ⏎ and must be kept as a real newline in the output. Keep numbers, dates, company/product names, and technical terms (software names, job platforms) intact unless a well-known translation exists. NEVER add explanations. Respond ONLY with valid JSON object mapping indices to translations, format: {"0":"...","1":"..."}`,
        },
        {
          role: "user",
          content: numbered,
        },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    // Extract JSON object from the response
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start < 0 || end < 0) {
      return NextResponse.json({ ok: false, error: "bad-format" }, { status: 200 });
    }
    const parsed = JSON.parse(raw.slice(start, end + 1)) as Record<string, string>;

    const translations: Record<string, string> = {};
    items.forEach((item, idx) => {
      const v = parsed[String(idx)];
      if (typeof v === "string" && v.trim()) {
        translations[item.key] = v.replace(/⏎/g, "\n").trim();
      }
    });

    return NextResponse.json({ ok: true, translations });
  } catch (e) {
    console.error("translate error:", e);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
}
