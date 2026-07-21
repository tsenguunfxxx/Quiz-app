import { NextResponse } from "next/server";

/** API route-уудын алдааг нэг мөрөөр хариу болгож хувиргана. */
export function apiError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ error: "Нэвтрээгүй байна." }, { status: 401 });
  }

  const message =
    error instanceof Error ? error.message : "Тодорхойгүй алдаа гарлаа.";

  console.error("[api]", error);
  return NextResponse.json({ error: message }, { status: 500 });
}
