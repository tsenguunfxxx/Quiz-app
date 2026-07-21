"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Sparkles, Type } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Article = {
  id: string;
  title: string;
  summary: string;
};

export function ArticleGenerator() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [article, setArticle] = useState<Article | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [creatingQuiz, startQuiz] = useTransition();

  async function handleSummarize() {
    if (!title.trim()) {
      toast.error("Нийтлэлийн гарчгаа оруулна уу.");
      return;
    }
    if (content.trim().length < 200) {
      toast.error("Нийтлэлийн агуулга дор хаяж 200 тэмдэгт байх ёстой.");
      return;
    }

    setSummarizing(true);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Хураангуйлахад алдаа гарлаа.");
        return;
      }

      setArticle(data.article);
      toast.success("Хураангуй бэлэн боллоо.");
    } catch {
      toast.error("Сүлжээний алдаа гарлаа.");
    } finally {
      setSummarizing(false);
    }
  }

  function handleCreateQuiz() {
    if (!article) return;

    startQuiz(async () => {
      try {
        const res = await fetch(`/api/articles/${article.id}/quiz`, {
          method: "POST",
        });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error ?? "Quiz үүсгэхэд алдаа гарлаа.");
          return;
        }

        router.push(`/articles/${article.id}/quiz`);
      } catch {
        toast.error("Сүлжээний алдаа гарлаа.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Нийтлэл оруулах
          </CardTitle>
          <CardDescription>
            Хураангуйлуулах нийтлэлийнхээ гарчиг, агуулгыг бичнэ үү.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title" className="flex items-center gap-1.5">
              <Type className="size-3.5 text-muted-foreground" />
              Гарчиг
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Нийтлэлийн гарчгаа оруулна уу..."
              disabled={summarizing}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="content" className="flex items-center gap-1.5">
              <FileText className="size-3.5 text-muted-foreground" />
              Агуулга
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Нийтлэлийн эх бичвэрээ энд буулгана уу..."
              className="min-h-56"
              disabled={summarizing}
            />
            <p className="text-xs text-muted-foreground">
              {content.trim().length} тэмдэгт (хамгийн багадаа 200)
            </p>
          </div>

          <Button
            onClick={handleSummarize}
            disabled={summarizing}
            className="self-start"
          >
            {summarizing ? (
              <>
                <Loader2 className="animate-spin" />
                Хураангуйлж байна...
              </>
            ) : (
              "Хураангуйлах"
            )}
          </Button>
        </CardContent>
      </Card>

      {article && (
        <Card>
          <CardHeader>
            <CardTitle>Хураангуй</CardTitle>
            <CardDescription>{article.title}</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {article.summary}
            </p>

            <Button
              onClick={handleCreateQuiz}
              disabled={creatingQuiz}
              className="self-start"
            >
              {creatingQuiz ? (
                <>
                  <Loader2 className="animate-spin" />
                  Quiz үүсгэж байна...
                </>
              ) : (
                "Quiz үүсгэх"
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
