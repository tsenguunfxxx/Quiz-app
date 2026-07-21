import Link from "next/link";
import { FileText } from "lucide-react";

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

export const metadata = { title: "Нийтлэлийн түүх" };

const dateFormatter = new Intl.DateTimeFormat("mn-MN", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default async function HistoryPage() {
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
      userScores: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { score: true, totalQuestions: true },
      },
    },
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Нийтлэлийн түүх
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Өмнө нь хураангуйлсан нийтлэлүүд.
          </p>
        </div>
        <ButtonLink variant="outline" size="sm" href="/dashboard">
          Шинээр нэмэх
        </ButtonLink>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <FileText className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Одоогоор хураангуйлсан нийтлэл алга.
            </p>
            <ButtonLink size="sm" href="/dashboard">
              Эхний нийтлэлээ нэмэх
            </ButtonLink>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {articles.map((article) => {
            const lastScore = article.userScores[0];

            return (
              <Card key={article.id}>
                <CardHeader>
                  <CardTitle>
                    <Link
                      href={`/articles/${article.id}`}
                      className="hover:underline"
                    >
                      {article.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {article.summary}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{dateFormatter.format(article.createdAt)}</span>
                  {article._count.quizzes > 0 && (
                    <Badge variant="secondary">
                      {article._count.quizzes} асуулт
                    </Badge>
                  )}
                  {lastScore && (
                    <Badge variant="outline">
                      Сүүлийн оноо: {lastScore.score}/{lastScore.totalQuestions}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
