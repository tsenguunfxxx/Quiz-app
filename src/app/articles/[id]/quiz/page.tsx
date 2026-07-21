import { notFound, redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuizRunner } from "@/components/quiz-runner";

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Quiz өгөх" };

export default async function QuizPage({ params }: Props) {
  const user = await requireUser();
  const { id } = await params;

  const article = await prisma.article.findFirst({
    where: { id, userId: user.id },
    include: { quizzes: { orderBy: { createdAt: "asc" } } },
  });

  if (!article) notFound();
  if (article.quizzes.length === 0) redirect(`/articles/${article.id}`);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <QuizRunner
        articleId={article.id}
        articleTitle={article.title}
        questions={article.quizzes.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options,
        }))}
      />
    </main>
  );
}
