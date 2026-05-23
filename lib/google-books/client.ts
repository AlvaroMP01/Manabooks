import "server-only";

import { stripHtml } from "@/lib/utils/strip-html";

import type { Book, BooksSearchResult } from "./types";

const BASE_URL = "https://www.googleapis.com/books/v1";

export class GoogleBooksError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string
  ) {
    super(`Google Books API error: ${status}`);
    this.name = "GoogleBooksError";
  }
}

interface RawVolumeInfo {
  title?: string;
  authors?: string[];
  imageLinks?: { thumbnail?: string };
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  language?: string;
  previewLink?: string;
}

interface RawVolume {
  id?: string;
  volumeInfo?: RawVolumeInfo;
}

interface RawGoogleBooksResponse {
  totalItems?: number;
  items?: RawVolume[];
}

/**
 * Invariant: after this function returns, Book.description is plain text.
 * Do not re-sanitize downstream. Do not pass to dangerouslySetInnerHTML.
 */
function mapVolume(raw: RawVolume): Book {
  const info = raw.volumeInfo ?? {};
  return {
    volumeId: raw.id ?? "",
    title: info.title ?? "",
    authors: info.authors ?? [],
    thumbnail: info.imageLinks?.thumbnail ?? null,
    publishedDate: info.publishedDate ?? null,
    description: stripHtml(info.description),
    pageCount: info.pageCount ?? null,
    categories: info.categories ?? [],
    language: info.language ?? null,
    previewLink: info.previewLink ?? null,
  };
}

export async function searchBooks(
  query: string,
  opts: { limit?: number; lang?: string; startIndex?: number } = {}
): Promise<BooksSearchResult> {
  const limit = Math.min(Math.max(opts.limit ?? 10, 1), 40);
  const startIndex = Math.max(opts.startIndex ?? 0, 0);
  const params = new URLSearchParams({
    q: query,
    maxResults: String(limit),
    startIndex: String(startIndex),
    orderBy: "relevance",
    printType: "books",
    key: process.env.GOOGLE_BOOKS_API_KEY!,
  });
  if (opts.lang) params.set("langRestrict", opts.lang);

  const response = await fetch(`${BASE_URL}/volumes?${params.toString()}`, {
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new GoogleBooksError(response.status, await response.text());
  }

  const data = (await response.json()) as RawGoogleBooksResponse;

  return {
    items: (data.items ?? []).map(mapVolume),
    total: data.totalItems ?? 0,
  };
}
