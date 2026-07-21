import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { summarizeArticle } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().trim().min(1, "Нийтлэлийн гарчгаа оруулна уу."),
  content: z
    .string()
    .trim()
    .min(200, "Нийтлэлийн агуулга дор хаяж 200 тэмдэгт байх ёстой."),
});

/** Нийтлэлийн түүх. */
export async function GET() {
  try {
    const user = await requireUser();

    const articles = await prisma.article.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        summary: true,
        createdAt: true,
        _count: { select: { quizzes: true } },
      },
    });

    return NextResponse.json({ articles });
  } catch (error) {
    return apiError(error);
  }
}

/** Шинэ нийтлэл хураангуйлж хадгална. */
export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { title, content } = parsed.data;
    const summary = await summarizeArticle(title, content);

    const article = await prisma.article.create({
      data: { title, content, summary, userId: user.id },
      select: { id: true, title: true, summary: true, createdAt: true },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
