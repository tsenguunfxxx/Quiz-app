import { Show, SignUpButton } from "@clerk/nextjs";
import { BrainCircuit, FileText, ListChecks } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: FileText,
    title: "Нийтлэл хураангуйлах",
    description:
      "Урт нийтлэлээ буулгахад Gemini AI гол санааг нь товч хураангуй болгож өгнө.",
  },
  {
    icon: BrainCircuit,
    title: "Quiz үүсгэх",
    description:
      "Хураангуй дээр үндэслэн 5 хүртэл асуулттай сонголттой шалгалт автоматаар үүснэ.",
  },
  {
    icon: ListChecks,
    title: "Оноо ба зөв хариулт",
    description:
      "Шалгалт өгсний дараа оноогоо хараад, буруу хариулсан асуултын зөв хариултыг үзнэ.",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16">
      <section className="flex flex-col items-center text-center">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Уншсанаа хураангуйлж, мэдлэгээ шалга
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground text-pretty">
          Нийтлэлээ оруулаад AI-аар хураангуйл. Дараа нь тэр хураангуй дээрээ
          үндэслэсэн quiz өгч, юу ойлгосноо шалгаарай.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Show when="signed-in">
            <ButtonLink size="lg" href="/dashboard">
              Эхлэх
            </ButtonLink>
            <ButtonLink size="lg" variant="outline" href="/history">
              Миний нийтлэлүүд
            </ButtonLink>
          </Show>

          <Show when="signed-out">
            <SignUpButton mode="modal">
              <Button size="lg">Үнэгүй бүртгүүлэх</Button>
            </SignUpButton>
            <ButtonLink size="lg" variant="outline" href="/sign-in">
              Нэвтрэх
            </ButtonLink>
          </Show>
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="size-5 text-primary" />
              <CardTitle className="mt-2">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </section>
    </main>
  );
}
