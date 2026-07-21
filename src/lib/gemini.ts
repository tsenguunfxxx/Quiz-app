import { GoogleGenAI, Type } from "@google/genai";

export const MAX_QUIZ_QUESTIONS = 5;

const MODEL = "gemini-2.5-flash";

function client() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY тохируулаагүй байна. .env файлаа шалгана уу.");
  }
  return new GoogleGenAI({ apiKey });
}

/** Нийтлэлийг монголоор хураангуйлна. */
export async function summarizeArticle(title: string, content: string) {
  const res = await client().models.generateContent({
    model: MODEL,
    contents: `Дараах нийтлэлийг монгол хэлээр товч, ойлгомжтой хураангуйл.
Хамгийн чухал санаануудыг 4-6 өгүүлбэрт багтаа. Зөвхөн хураангуйг буцаа.

Гарчиг: ${title}

Нийтлэл:
${content}`,
  });

  const summary = res.text?.trim();
  if (!summary) {
    throw new Error("Gemini-ээс хураангуй буцаж ирсэнгүй.");
  }
  return summary;
}

export type GeneratedQuestion = {
  question: string;
  options: string[];
  answer: string;
};

/** Хураангуй дээр үндэслэн максимум 5 асуулттай сонголттой quiz үүсгэнэ. */
export async function generateQuiz(
  title: string,
  summary: string,
): Promise<GeneratedQuestion[]> {
  const res = await client().models.generateContent({
    model: MODEL,
    contents: `Дараах нийтлэлийн хураангуйд тулгуурлан монгол хэл дээр
хамгийн ихдээ ${MAX_QUIZ_QUESTIONS} асуулттай сонголттой (multiple choice) шалгалт үүсгэ.
Асуулт бүр яг 4 сонголттой байх ба "answer" талбар нь "options"-ын аль нэгтэй ҮГ ҮСГИЙН ХУВЬД ЯГ ИЖИЛ байх ёстой.

Гарчиг: ${title}

Хураангуй:
${summary}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING },
          },
          required: ["question", "options", "answer"],
        },
      },
    },
  });

  const raw = res.text?.trim();
  if (!raw) {
    throw new Error("Gemini-ээс quiz буцаж ирсэнгүй.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Gemini-ийн хариуг JSON болгож уншиж чадсангүй.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Gemini буруу форматтай хариу буцаалаа.");
  }

  const questions = parsed
    .filter((q): q is GeneratedQuestion => {
      if (typeof q !== "object" || q === null) return false;
      const c = q as Partial<GeneratedQuestion>;
      return (
        typeof c.question === "string" &&
        typeof c.answer === "string" &&
        Array.isArray(c.options) &&
        c.options.length >= 2 &&
        c.options.every((o) => typeof o === "string") &&
        c.options.includes(c.answer)
      );
    })
    .slice(0, MAX_QUIZ_QUESTIONS);

  if (questions.length === 0) {
    throw new Error("Хүчинтэй асуулт үүсгэж чадсангүй. Дахин оролдоно уу.");
  }

  return questions;
}
