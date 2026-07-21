"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function GenerateQuizButton({ articleId }: { articleId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleClick() {
    start(async () => {
      try {
        const res = await fetch(`/api/articles/${articleId}/quiz`, {
          method: "POST",
        });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error ?? "Quiz үүсгэхэд алдаа гарлаа.");
          return;
        }

        router.push(`/articles/${articleId}/quiz`);
      } catch {
        toast.error("Сүлжээний алдаа гарлаа.");
      }
    });
  }

  return (
    <Button onClick={handleClick} disabled={pending} className="self-start">
      {pending ? (
        <>
          <Loader2 className="animate-spin" />
          Quiz үүсгэж байна...
        </>
      ) : (
        "Quiz үүсгэх"
      )}
    </Button>
  );
}
