# Article Quiz Generator

Нийтлэлээ Gemini AI-аар хураангуйлж, тэр хураангуй дээрээ үндэслэсэн quiz үүсгээд
өөрийгөө шалгах платформ.

## Технологи

| Давхарга | Технологи |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | shadcn/ui (`base-nova` style, Base UI) + Tailwind v4 |
| Нэвтрэлт | Clerk |
| AI | Google Gemini (`gemini-2.5-flash`) |
| ӨС | PostgreSQL + Prisma 7 (`@prisma/adapter-pg`) |

## Тохиргоо

### 1. Package суулгах

```bash
npm install
```

### 2. Орчны хувьсагч

`.env.example`-ийг хуулж `.env` үүсгээд утгуудаа бөглөнө:

```bash
cp .env.example .env
```

| Хувьсагч | Хаанаас авах |
| --- | --- |
| `DATABASE_URL` | Локал Postgres эсвэл Neon/Supabase |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | https://dashboard.clerk.com → API Keys |
| `GEMINI_API_KEY` | https://aistudio.google.com/apikey |

### 3. Өгөгдлийн сан бэлтгэх

```bash
npx prisma migrate dev --name init
```

### 4. Ажиллуулах

```bash
npm run dev
```

http://localhost:3000 дээр нээнэ.

## Бүтэц

```
src/
  proxy.ts                       # Clerk middleware (Next 16-д proxy.ts нэртэй)
  lib/
    prisma.ts                    # PrismaClient singleton (pg adapter)
    auth.ts                      # requireUser() — Clerk ↔ User хүснэгт sync
    gemini.ts                    # summarizeArticle(), generateQuiz()
    api.ts                       # API алдааны нэгдсэн хариу
  app/
    page.tsx                     # Landing
    dashboard/                   # Нийтлэл оруулах + хураангуйлах
    history/                     # Нийтлэлийн түүх
    articles/[id]/               # Нийтлэлийн дэлгэрэнгүй
    articles/[id]/quiz/          # Quiz өгөх + дүн
    sign-in/, sign-up/           # Clerk хуудсууд
    api/articles/                # POST хураангуйлах / GET түүх
    api/articles/[id]/quiz/      # POST quiz үүсгэх
    api/articles/[id]/quiz/submit/  # POST хариулт шалгах
  components/
    site-header.tsx
    article-generator.tsx        # Хураангуйлах форм (client)
    quiz-runner.tsx              # Quiz өгөх + үр дүн (client)
    generate-quiz-button.tsx
```

## Өгөгдлийн загвар

`User` → `Article` → `Quiz` (асуулт тус бүр нэг мөр), `QuizAttempt`
(хариулт тус бүр), `UserScore` (оролдлого бүрийн нийт оноо).

## Урсгал

1. Clerk-ээр нэвтрэх
2. `/dashboard` дээр гарчиг + агуулга оруулж **Хураангуйлах**
3. Хураангуй харагдана → **Quiz үүсгэх** (максимум 5 асуулт)
4. `/articles/[id]/quiz` дээр хариулж **Хариултаа илгээх**
5. Оноо + буруу хариултын зөв хариулт харагдана
6. `/history` дээр өмнөх нийтлэлүүд болон дүнгээ харна
# Quiz-app
