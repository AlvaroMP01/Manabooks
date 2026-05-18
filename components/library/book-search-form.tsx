"use client";

import { useCallback, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Book, BooksSearchResult } from "@/lib/google-books/types";

function BookSearchCard({ book }: { book: Book }) {
  const authors = book.authors?.join(", ") ?? "Autor desconocido";

  return (
    <div className="flex items-start gap-4 rounded-xl p-4 ring-1 ring-foreground/10">
      {book.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={book.thumbnail}
          alt=""
          width={64}
          height={96}
          className="h-24 w-16 shrink-0 rounded-soft object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="h-24 w-16 shrink-0 rounded-soft bg-sakura-100"
        />
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

export function BookSearchForm() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[] | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;

      startTransition(async () => {
        const res = await fetch(
          `/api/books/search?q=${encodeURIComponent(query.trim())}&limit=10`,
        );
        if (!res.ok) {
          setResults([]);
          return;
        }
        const json = (await res.json()) as BooksSearchResult;
        setResults(json.items ?? []);
      });
    },
    [query],
  );

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
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sakura-500"
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
              <div className="flex gap-4 rounded-xl p-4 ring-1 ring-foreground/10">
                <Skeleton className="h-24 w-16 shrink-0 rounded-soft" />
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
