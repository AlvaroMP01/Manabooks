import { type NextRequest, NextResponse } from "next/server";

import { GoogleBooksError, searchBooks } from "@/lib/google-books/client";

const ALLOWED_LANGS = new Set(["es", "en", "fr", "it", "pt", "de"]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const limitRaw = searchParams.get("limit");
  const langRaw = searchParams.get("lang")?.trim().toLowerCase();
  const startIndexRaw = searchParams.get("startIndex");

  if (!q) {
    return NextResponse.json({ error: "missing query" }, { status: 400 });
  }

  const limitNum = limitRaw !== null ? Number(limitRaw) : 10;
  if (Number.isNaN(limitNum)) {
    return NextResponse.json({ error: "invalid limit" }, { status: 400 });
  }
  const limit = Math.min(Math.max(limitNum, 1), 40);
  const lang = langRaw && ALLOWED_LANGS.has(langRaw) ? langRaw : null;

  let startIndex = 0;
  if (startIndexRaw !== null) {
    const parsed = Number(startIndexRaw);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1000) {
      return NextResponse.json({ error: "invalid startIndex" }, { status: 400 });
    }
    startIndex = Math.floor(parsed);
  }

  try {
    const opts: { limit: number; lang?: string; startIndex?: number } = { limit };
    if (lang) opts.lang = lang;
    if (startIndex > 0) opts.startIndex = startIndex;
    const result = await searchBooks(q, opts);
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
