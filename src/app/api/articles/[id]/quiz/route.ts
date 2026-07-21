import { NextResponse } from "next/server";

import { apiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { generateQuiz } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

/** Нийтлэлийн хураангуй дээр үндэслэн quiz үүсгэнэ (байвал дахин ашиглана). */
export async function POST(_req: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const article = await prisma.article.findFirst({
      where: { id, userId: user.id },
      include: { quizzes: { orderBy: { createdAt: "asc" } } },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Нийтлэл олдсонгүй." },
        { status: 404 },
      );
    }

    if (article.quizzes.length > 0) {
      return NextResponse.json({ quizCount: article.quizzes.length });
    }

    const questions = await generateQuiz(article.title, article.summary);

    await prisma.quiz.createMany({
      data: questions.map((q) => ({
        question: q.question,
        options: q.options,
        answer: q.answer,
        articleId: article.id,
      })),
    });

    return NextResponse.json({ quizCount: questions.length }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
