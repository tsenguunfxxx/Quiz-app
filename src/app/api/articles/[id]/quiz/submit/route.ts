import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

const submitSchema = z.object({
  answers: z.record(z.string(), z.string()),
});

/** Quiz-ийн хариултыг шалгаж, оноо болон зөв хариултыг буцаана. */
export async function POST(req: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const parsed = submitSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Хариултын өгөгдөл буруу байна." },
        { status: 400 },
      );
    }

    const article = await prisma.article.findFirst({
      where: { id, userId: user.id },
      include: { quizzes: { orderBy: { createdAt: "asc" } } },
    });

    if (!article || article.quizzes.length === 0) {
      return NextResponse.json({ error: "Quiz олдсонгүй." }, { status: 404 });
    }

    const { answers } = parsed.data;

    const results = article.quizzes.map((quiz) => {
      const selectedAnswer = answers[quiz.id] ?? "";
      return {
        quizId: quiz.id,
        question: quiz.question,
        selectedAnswer,
        correctAnswer: quiz.answer,
        isCorrect: selectedAnswer === quiz.answer,
      };
    });

    const score = results.filter((r) => r.isCorrect).length;

    await prisma.$transaction([
      prisma.quizAttempt.createMany({
        data: results.map((r) => ({
          userId: user.id,
          quizId: r.quizId,
          selectedAnswer: r.selectedAnswer,
          isCorrect: r.isCorrect,
        })),
      }),
      prisma.userScore.create({
        data: {
          userId: user.id,
          articleId: article.id,
          score,
          totalQuestions: article.quizzes.length,
        },
      }),
    ]);

    return NextResponse.json({
      score,
      totalQuestions: article.quizzes.length,
      results,
    });
  } catch (error) {
    return apiError(error);
  }
}
