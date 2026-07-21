import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GenerateQuizButton } from "@/components/generate-quiz-button";

type Props = { params: Promise<{ id: string }> };

const dateFormatter = new Intl.DateTimeFormat("mn-MN", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default async function ArticlePage({ params }: Props) {
  const user = await requireUser();
  const { id } = await params;

  const article = await prisma.article.findFirst({
    where: { id, userId: user.id },
    include: {
      _count: { select: { quizzes: true } },
      userScores: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!article) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">{article.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {dateFormatter.format(article.createdAt)}
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Хураангуй</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {article.summary}
          </p>

          {article._count.quizzes > 0 ? (
            <ButtonLink
              className="self-start"
              href={`/articles/${article.id}/quiz`}
            >
              Quiz өгөх ({article._count.quizzes} асуулт)
            </ButtonLink>
          ) : (
            <GenerateQuizButton articleId={article.id} />
          )}
        </CardContent>
      </Card>

      {article.userScores.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Өмнөх дүнгүүд</CardTitle>
            <CardDescription>Сүүлийн 5 оролдлого</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {article.userScores.map((s) => (
              <Badge key={s.id} variant="secondary">
                {s.score}/{s.totalQuestions} · {dateFormatter.format(s.createdAt)}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Эх нийтлэл</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
            {article.content}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
