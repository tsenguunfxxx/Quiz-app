import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL тохируулаагүй байна. .env файлаа шалгана уу.",
    );
  }

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getPrismaClient() {
  const client = globalForPrisma.prisma ?? createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

/**
 * Prisma client-ийг ЭХНИЙ ХЭРЭГЛЭХ үед л үүсгэнэ.
 *
 * Модуль ачаалагдмагц үүсгэвэл `next build`-ийн "Collecting page data" үе
 * шатанд DATABASE_URL шаардаад build уначихдаг. Залхуу үүсгэснээр орчны
 * хувьсагч зөвхөн жинхэнэ query явуулах үед хэрэгтэй болно.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient();
    return Reflect.get(client, property, client);
  },
});
