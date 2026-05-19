"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import { MBBookCover } from "@/components/mb/book-cover";
import { MBButton } from "@/components/mb/button";
import { MBCard } from "@/components/mb/card";
import { MBSticker } from "@/components/mb/sticker";
import type { Book, BooksSearchResult } from "@/lib/google-books/types";

function BookSearchSkeleton() {
  return (
    <ul
      role="list"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Buscando…"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i}>
          <MBCard color="#FFD0E7" radius={18} shadow={false} className="p-4">
            <div className="flex gap-3">
              <div
                style={{
                  width: 70,
                  height: 105,
                  borderRadius: "4px 12px 12px 4px",
                  border: "2px solid #3B1F47",
                  background: "#FFD0E7",
                  flexShrink: 0,
                }}
                className="animate-pulse"
              />
              <div className="flex flex-1 flex-col gap-2 pt-1">
                <div className="h-4 w-full animate-pulse rounded-full bg-mb-pink" />
                <div className="h-4 w-3/4 animate-pulse rounded-full bg-mb-pink-soft" />
              </div>
            </div>
          </MBCard>
        </li>
      ))}
    </ul>
  );
}

function BookSearchCard({ book }: { book: Book }) {
  const author = book.authors?.[0] ?? "Autor desconocido";

  return (
    <MBCard
      color="#FFFCFE"
      radius={18}
      className="relative flex flex-col items-center gap-3 p-4"
    >
      <MBBookCover title={book.title} author={author} width={70} height={105} tilt={-3} />
      <div className="w-full text-center">
        <p
          className="line-clamp-2"
          style={{
            fontFamily: "var(--font-sticker)",
            fontSize: 14,
            color: "#3B1F47",
            margin: 0,
            lineHeight: 1.1,
          }}
          title={book.title}
        >
          {book.title}
        </p>
        <p
          className="mt-1 line-clamp-1"
          style={{ fontFamily: "var(--font-hand)", fontSize: 14, color: "#8B3FE0" }}
        >
          {author}
        </p>
      </div>
      <MBSticker
        color="var(--color-mb-pink-soft)"
        fontSize={12}
        padding="4px 12px"
        aria-disabled="true"
        aria-label={`Agregar "${book.title}" a tu biblioteca (próximamente)`}
        style={{ cursor: "not-allowed", opacity: 0.75 }}
      >
        agregar ✦
      </MBSticker>
    </MBCard>
  );
}

/** BookSearchForm — Google Books search with MB-styled input, button, and result cards. */
export function BookSearchForm({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Book[] | null>(null);
  const [isPending, startTransition] = useTransition();

  const runSearch = useCallback((rawQuery: string) => {
    const trimmed = rawQuery.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(trimmed)}&limit=10`);
      if (!res.ok) {
        setResults([]);
        return;
      }
      const json = (await res.json()) as BooksSearchResult;
      setResults(json.items ?? []);
    });
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      runSearch(query);
    },
    [query, runSearch]
  );

  useEffect(() => {
    if (initialQuery) runSearch(initialQuery);
  }, [initialQuery, runSearch]);

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <label htmlFor="book-search-input" className="sr-only">
          Buscar libros
        </label>
        <input
          id="book-search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Título, autor o ISBN…"
          autoComplete="off"
          className="focus-visible:ring-mb-pink-deep flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-mb-cream"
          style={{
            borderRadius: 999,
            padding: "12px 18px",
            border: "2px solid #3B1F47",
            boxShadow: "2px 3px 0 #3B1F47",
            background: "var(--color-mb-white)",
            fontFamily: "var(--font-body)",
            fontSize: 15,
            color: "#3B1F47",
          }}
        />
        <MBButton type="submit" color="purple" size="md" disabled={isPending || !query.trim()}>
          buscar ✦
        </MBButton>
      </form>

      {isPending && <BookSearchSkeleton />}

      {!isPending && results === null && (
        <p
          className="text-center"
          style={{ fontFamily: "var(--font-hand)", fontSize: 18, color: "#3B1F47" }}
        >
          Escribí el nombre de un libro para buscarlo
        </p>
      )}

      {!isPending && results !== null && results.length === 0 && (
        <p
          className="text-center"
          style={{ fontFamily: "var(--font-hand)", fontSize: 18, color: "#3B1F47" }}
        >
          No encontramos resultados para «{query}»
        </p>
      )}

      {!isPending && results !== null && results.length > 0 && (
        <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((book) => (
            <li key={book.volumeId}>
              <BookSearchCard book={book} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
