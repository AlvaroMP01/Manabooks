"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import { AddToLibraryDialog } from "@/components/library/add-to-library-dialog";
import { MBBookCover } from "@/components/mb/book-cover";
import { MBButton } from "@/components/mb/button";
import { MBCard } from "@/components/mb/card";
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
          <MBCard
            color="#FFD0E7"
            radius={18}
            shadow={false}
            className="flex flex-col items-center gap-4 p-5"
          >
            <div
              style={{
                width: 130,
                height: 195,
                borderRadius: "4px 12px 12px 4px",
                border: "2px solid #3B1F47",
                background: "#FFFCFE",
                flexShrink: 0,
              }}
              className="animate-pulse"
            />
            <div className="flex w-full flex-col items-center gap-2">
              <div className="bg-mb-pink h-4 w-full animate-pulse rounded-full" />
              <div className="bg-mb-pink-soft h-4 w-3/4 animate-pulse rounded-full" />
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
    <MBCard color="#FFFCFE" radius={18} className="relative flex flex-col items-center gap-4 p-5">
      <MBBookCover
        title={book.title}
        author={author}
        thumbnail={book.thumbnail}
        width={130}
        height={195}
        tilt={-3}
      />
      <div className="w-full text-center">
        <p
          className="line-clamp-2"
          style={{
            fontFamily: "var(--font-sticker)",
            fontSize: 17,
            color: "#3B1F47",
            margin: 0,
            lineHeight: 1.15,
          }}
          title={book.title}
        >
          {book.title}
        </p>
        <p
          className="mt-1.5 line-clamp-1"
          style={{ fontFamily: "var(--font-hand)", fontSize: 17, color: "#8B3FE0" }}
        >
          {author}
        </p>
      </div>
      <AddToLibraryDialog book={book} />
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
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(trimmed)}&limit=40`);
      if (!res.ok) {
        setResults([]);
        return;
      }
      const json = (await res.json()) as BooksSearchResult;
      setResults(json.items ?? []);
    });
  }, []);

  useEffect(() => {
    if (initialQuery) runSearch(initialQuery);
  }, [initialQuery, runSearch]);

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
        className="flex gap-3"
      >
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
          className="focus-visible:ring-mb-pink-deep focus-visible:ring-offset-mb-cream flex-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
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
          Buscar ✦
        </MBButton>
      </form>

      {isPending && <BookSearchSkeleton />}

      {!isPending && results === null && (
        <p
          className="text-center"
          style={{ fontFamily: "var(--font-hand)", fontSize: 18, color: "#3B1F47" }}
        >
          Escribe el nombre de un libro para buscarlo
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
