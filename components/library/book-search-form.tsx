"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Book, BooksSearchResult } from "@/lib/google-books/types";

function BookSearchCard({ book }: { book: Book }) {
  const authors = book.authors?.join(", ") ?? "Autor desconocido";

  return (
    <div className="ring-foreground/10 flex items-start gap-4 rounded-xl p-4 ring-1">
      {book.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={book.thumbnail}
          alt=""
          width={64}
          height={96}
          className="rounded-soft h-24 w-16 shrink-0 object-cover"
        />
      ) : (
        <div aria-hidden="true" className="rounded-soft bg-mb-pink-soft h-24 w-16 shrink-0" />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate font-medium" title={book.title}>
          {book.title}
        </p>
        <p className="truncate text-sm text-neutral-700">{authors}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-fit"
          disabled
          aria-label={`Agregar "${book.title}" a tu biblioteca`}
        >
          Agregar
        </Button>
      </div>
    </div>
  );
}

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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="book-search-input" className="sr-only">
          Buscar libros
        </label>
        <input
          id="book-search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Título, autor o ISBN…"
          className="focus-visible:ring-mb-pink-deep flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2"
          autoComplete="off"
        />
        <Button type="submit" disabled={isPending || !query.trim()}>
          Buscar
        </Button>
      </form>

      {isPending && (
        <ul
          role="list"
          className="grid gap-4 sm:grid-cols-2"
          aria-busy="true"
          aria-label="Buscando…"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i}>
              <div className="ring-foreground/10 flex gap-4 rounded-xl p-4 ring-1">
                <Skeleton className="rounded-soft h-24 w-16 shrink-0" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!isPending && results !== null && results.length === 0 && (
        <p className="text-center text-sm text-neutral-500">
          No se encontraron resultados para &ldquo;{query}&rdquo;.
        </p>
      )}

      {!isPending && results !== null && results.length > 0 && (
        <ul role="list" className="grid gap-4 sm:grid-cols-2">
          {results.map((book) => (
            <li key={book.volumeId}>
              <BookSearchCard book={book} />
            </li>
          ))}
        </ul>
      )}

      {results === null && !isPending && (
        <p className="text-center text-sm text-neutral-500">
          Escribí el nombre de un libro para buscarlo.
        </p>
      )}
    </div>
  );
}
