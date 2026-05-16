import { NextResponse, type NextRequest } from "next/server";

import { GoogleBooksError, searchBooks } from "@/lib/google-books/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const limitRaw = searchParams.get("limit");

  if (!q) {
    return NextResponse.json({ error: "missing query" }, { status: 400 });
  }

  const limitNum = limitRaw !== null ? Number(limitRaw) : 10;
  if (Number.isNaN(limitNum)) {
    return NextResponse.json({ error: "invalid limit" }, { status: 400 });
  }
  const limit = Math.min(Math.max(limitNum, 1), 40);

  try {
    const result = await searchBooks(q, { limit });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GoogleBooksError) {
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }
    if (err instanceof Error && err.name === "TimeoutError") {
      return NextResponse.json({ error: "Upstream timeout" }, { status: 504 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
