"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

type Question = {
  id: string;
  question: string;
  options: string[];
};

type Result = {
  quizId: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

type Submission = {
  score: number;
  totalQuestions: number;
  results: Result[];
};

export function QuizRunner({
  articleId,
  articleTitle,
  questions,
}: {
  articleId: string;
  articleTitle: string;
  questions: Question[];
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  async function handleSubmit() {
    if (answeredCount < questions.length) {
      toast.error("Бүх асуултад хариулна уу.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Илгээхэд алдаа гарлаа.");
        return;
      }

      setSubmission(data);
    } catch {
      toast.error("Сүлжээний алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    setAnswers({});
    setSubmission(null);
  }

  if (submission) {
    return (
      <ResultView
        articleId={articleId}
        submission={submission}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Quiz</h1>
        <p className="mt-1 text-sm text-muted-foreground">{articleTitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <Progress value={progress} className="flex-1" />
        <span className="text-xs text-muted-foreground tabular-nums">
          {answeredCount}/{questions.length}
        </span>
      </div>

      {questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader>
            <CardDescription>Асуулт {index + 1}</CardDescription>
            <CardTitle>{question.question}</CardTitle>
          </CardHeader>

          <CardContent>
            <RadioGroup
              value={answers[question.id] ?? null}
              onValueChange={(value) =>
                setAnswers((prev) => ({ ...prev, [question.id]: String(value) }))
              }
            >
              {question.options.map((option) => {
                const optionId = `${question.id}-${option}`;
                return (
                  <Label
                    key={optionId}
                    htmlFor={optionId}
                    className="flex items-start gap-3 rounded-lg border p-3 font-normal hover:bg-muted/50 has-data-checked:border-primary has-data-checked:bg-primary/5"
                  >
                    <RadioGroupItem
                      id={optionId}
                      value={option}
                      className="mt-0.5"
                    />
                    <span className="text-sm leading-snug">{option}</span>
                  </Label>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}

      <Button
        onClick={handleSubmit}
        disabled={submitting}
        size="lg"
        className="self-start"
      >
        {submitting ? (
          <>
            <Loader2 className="animate-spin" />
            Шалгаж байна...
          </>
        ) : (
          "Хариултаа илгээх"
        )}
      </Button>
    </div>
  );
}

function ResultView({
  articleId,
  submission,
  onRetry,
}: {
  articleId: string;
  submission: Submission;
  onRetry: () => void;
}) {
  const { score, totalQuestions, results } = submission;
  const percent = Math.round((score / totalQuestions) * 100);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Дүн</CardTitle>
          <CardDescription>Таны оноо</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <p className="text-4xl font-semibold tabular-nums">
            {score} / {totalQuestions}
          </p>
          <Progress value={percent} />
          <p className="text-sm text-muted-foreground">
            {percent}% зөв хариуллаа.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Хариултын дэлгэрэнгүй</CardTitle>
          <CardDescription>
            Буруу хариулсан асуултын зөв хариултыг доор харууллаа.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {results.map((result, index) => (
            <div key={result.quizId} className="flex flex-col gap-2">
              {index > 0 && <Separator className="mb-2" />}

              <div className="flex items-start gap-2">
                {result.isCorrect ? (
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                ) : (
                  <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                )}
                <p className="text-sm font-medium">{result.question}</p>
              </div>

              <div className="ml-6 flex flex-col gap-1 text-sm">
                <p
                  className={
                    result.isCorrect ? "text-primary" : "text-destructive"
                  }
                >
                  Таны хариулт: {result.selectedAnswer || "—"}
                </p>
                {!result.isCorrect && (
                  <p className="text-muted-foreground">
                    Зөв хариулт: {result.correctAnswer}
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button onClick={onRetry}>Дахин өгөх</Button>
        <ButtonLink variant="outline" href={`/articles/${articleId}`}>
          Нийтлэл рүү буцах
        </ButtonLink>
        <ButtonLink variant="ghost" href="/dashboard">
          Шинэ нийтлэл
        </ButtonLink>
      </div>
    </div>
  );
}
