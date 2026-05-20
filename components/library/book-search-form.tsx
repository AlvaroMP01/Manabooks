"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { AddToLibraryDialog } from "@/components/library/add-to-library-dialog";
import { MBBookCover } from "@/components/mb/book-cover";
import { MBButton } from "@/components/mb/button";
import { MBCard } from "@/components/mb/card";
import { MBPill } from "@/components/mb/pill";
import type { Book, BooksSearchResult } from "@/lib/google-books/types";

type SearchType = "title" | "author" | "isbn";
type Language = "all" | "es" | "en" | "fr" | "it" | "pt" | "de";

const SEARCH_TYPES: { value: SearchType; label: string; placeholder: string }[] = [
  { value: "title", label: "Título", placeholder: "Título del libro…" },
  { value: "author", label: "Autor", placeholder: "Autor o autora…" },
  { value: "isbn", label: "ISBN", placeholder: "ISBN-10 o ISBN-13…" },
];

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "all", label: "Todos los idiomas" },
  { value: "es", label: "Español" },
  { value: "en", label: "Inglés" },
  { value: "fr", label: "Francés" },
  { value: "it", label: "Italiano" },
  { value: "pt", label: "Portugués" },
  { value: "de", label: "Alemán" },
];

function buildSearchUrl(query: string, type: SearchType, lang: Language): string {
  const trimmed = query.trim();
  if (!trimmed) return "";

  let q = trimmed;
  if (type === "title") q = `intitle:${trimmed}`;
  else if (type === "author") q = `inauthor:${trimmed}`;
  else if (type === "isbn") q = `isbn:${trimmed.replace(/[^0-9Xx]/g, "")}`;

  const params = new URLSearchParams({ q, limit: "40" });
  if (lang !== "all") params.set("lang", lang);
  return `/api/books/search?${params.toString()}`;
}

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

export function BookSearchCard({ book }: { book: Book }) {
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
        {book.description && (
          <p
            className="mt-2 line-clamp-3 text-left"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "#3B1F47",
              lineHeight: 1.4,
            }}
            title={book.description}
          >
            {book.description}
          </p>
        )}
      </div>
      <AddToLibraryDialog book={book} />
    </MBCard>
  );
}

/** BookSearchForm — Google Books search with type + language filters and MB-styled result cards. */
export function BookSearchForm({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<SearchType>("title");
  const [lang, setLang] = useState<Language>("all");
  const [results, setResults] = useState<Book[] | null>(null);
  const [isPending, startTransition] = useTransition();

  const placeholder = useMemo(
    () => SEARCH_TYPES.find((t) => t.value === searchType)?.placeholder ?? "",
    [searchType]
  );

  const runSearch = useCallback((rawQuery: string, type: SearchType, language: Language) => {
    const url = buildSearchUrl(rawQuery, type, language);
    if (!url) return;

    startTransition(async () => {
      const res = await fetch(url);
      if (!res.ok) {
        setResults([]);
        return;
      }
      const json = (await res.json()) as BooksSearchResult;
      setResults(json.items ?? []);
    });
  }, []);

  useEffect(() => {
    if (initialQuery) runSearch(initialQuery, searchType, lang);
    // initialQuery only runs once at mount; type/lang are local choices that take effect on submit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {/* Filter row: search type pills + language select */}
        <div
          role="group"
          aria-label="Filtros de búsqueda"
          className="flex flex-wrap items-center gap-3"
        >
          <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Tipo">
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 700,
                color: "#3B1F47",
              }}
            >
              Buscar por:
            </span>
            {SEARCH_TYPES.map((opt) => (
              <MBPill
                key={opt.value}
                active={searchType === opt.value}
                color="#B967FF"
                onClick={() => setSearchType(opt.value)}
                style={{ textTransform: "none" }}
              >
                {opt.label}
              </MBPill>
            ))}
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <label
              htmlFor="book-search-lang"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 700,
                color: "#3B1F47",
              }}
            >
              Idioma:
            </label>
            <select
              id="book-search-lang"
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              className="focus-visible:ring-mb-pink-deep focus-visible:ring-offset-mb-cream focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              style={{
                borderRadius: 999,
                padding: "6px 14px",
                border: "2px solid #3B1F47",
                boxShadow: "2px 3px 0 #3B1F47",
                background: "var(--color-mb-white)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 700,
                color: "#3B1F47",
                cursor: "pointer",
              }}
            >
              {LANGUAGES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search input + submit */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(query, searchType, lang);
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
            placeholder={placeholder}
            autoComplete="off"
            inputMode={searchType === "isbn" ? "numeric" : "search"}
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
      </div>

      {isPending && <BookSearchSkeleton />}

      {!isPending && results === null && (
        <p
          className="text-center"
          style={{ fontFamily: "var(--font-hand)", fontSize: 18, color: "#3B1F47" }}
        >
          Escribe{" "}
          {searchType === "isbn"
            ? "un ISBN"
            : searchType === "author"
              ? "el nombre de un autor"
              : "el nombre de un libro"}{" "}
          para buscarlo
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
