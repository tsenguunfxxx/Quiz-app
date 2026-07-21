import { ArticleGenerator } from "@/components/article-generator";

export const metadata = { title: "Нийтлэл хураангуйлах" };

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Нийтлэл хураангуйлах
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Гарчиг болон агуулгаа оруулаад хураангуйлуулна уу.
        </p>
      </div>

      <ArticleGenerator />
    </main>
  );
}
