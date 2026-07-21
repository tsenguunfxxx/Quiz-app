"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Буцах товч харуулахгүй нийтийн замууд. */
const PUBLIC_PATHS = ["/", "/sign-in", "/sign-up"];

/**
 * Зүүн талын нарийн багана дахь буцах товч.
 * Нэвтэрсэн хэрэглэгчийн бүх дотоод хуудсанд харагдана.
 */
export function BackRail() {
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (isPublic) return null;

  return (
    <aside className="flex w-14 shrink-0 justify-center border-r pt-4 sm:w-16">
      <Button
        variant="outline"
        size="icon"
        aria-label="Буцах"
        onClick={() => router.back()}
      >
        <ChevronLeft />
      </Button>
    </aside>
  );
}
