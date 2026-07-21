import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

/**
 * Clerk-ээр нэвтэрсэн хэрэглэгчийг локал User хүснэгттэй тааруулж,
 * байхгүй бол шинээр үүсгэнэ. Нэвтрээгүй бол алдаа шидэнэ.
 */
export async function requireUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;

  const clerkUser = await currentUser();
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("Хэрэглэгчийн имэйл олдсонгүй.");
  }

  const name =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
    clerkUser?.username ||
    null;

  return prisma.user.upsert({
    where: { clerkId: userId },
    update: { email, name },
    create: { clerkId: userId, email, name },
  });
}
