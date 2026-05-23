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

const PAGE_SIZE = 20;

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

function buildSearchUrl(
  query: string,
  type: SearchType,
  lang: Language,
  startIndex: number
): string {
  const trimmed = query.trim();
  if (!trimmed) return "";

  let q = trimmed;
  if (type === "title") q = `intitle:${trimmed}`;
  else if (type === "author") q = `inauthor:${trimmed}`;
  else if (type === "isbn") q = `isbn:${trimmed.replace(/[^0-9Xx]/g, "")}`;

  const params = new URLSearchParams({ q, limit: String(PAGE_SIZE) });
  if (lang !== "all") params.set("lang", lang);
  if (startIndex > 0) params.set("startIndex", String(startIndex));
  return `/api/books/search?${params.toString()}`;
}

function parseYear(publishedDate: string | null): string | null {
  if (!publishedDate) return null;
  const candidate = publishedDate.slice(0, 4);
  return /^\d{4}$/.test(candidate) ? candidate : null;
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
  const year = parseYear(book.publishedDate);
  const pages = book.pageCount;
  const hasMeta = year !== null || pages !== null;

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
        {hasMeta && (
          <p
            className="mt-1"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              color: "#6E4A7A",
              margin: 0,
            }}
          >
            {year}
            {year && pages !== null ? " · " : ""}
            {pages !== null ? `${pages} págs` : ""}
          </p>
        )}
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

interface BookSearchFormProps {
  initialQuery?: string;
  discoveryBooks?: Book[];
}

type FetchKind = "replace" | "append";

/** BookSearchForm — Google Books search with type + language filters, pagination, and discovery fallback. */
export function BookSearchForm({ initialQuery = "", discoveryBooks = [] }: BookSearchFormProps) {
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<SearchType>("title");
  const [lang, setLang] = useState<Language>("all");
  const [results, setResults] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const placeholder = useMemo(
    () => SEARCH_TYPES.find((t) => t.value === searchType)?.placeholder ?? "",
    [searchType]
  );

  const runSearch = useCallback(
    (
      rawQuery: string,
      type: SearchType,
      language: Language,
      kind: FetchKind,
      startIndex: number
    ) => {
      const url = buildSearchUrl(rawQuery, type, language, startIndex);
      if (!url) return;

      startTransition(async () => {
        const res = await fetch(url);
        if (!res.ok) {
          if (kind === "replace") {
            setResults([]);
            setTotal(0);
          }
          setHasSearched(true);
          return;
        }
        const json = (await res.json()) as BooksSearchResult;
        const items = json.items ?? [];
        setResults((prev) => (kind === "replace" ? items : [...prev, ...items]));
        setTotal(json.total ?? 0);
        setHasSearched(true);
      });
    },
    []
  );

  useEffect(() => {
    if (initialQuery) runSearch(initialQuery, searchType, lang, "replace", 0);
    // initialQuery only runs once at mount; type/lang are local choices that take effect on submit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const hasMore = !isPending && results.length > 0 && results.length < total;
  const showDiscovery = !hasSearched && !isPending && discoveryBooks.length > 0;

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
            runSearch(query, searchType, lang, "replace", 0);
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

      {isPending && results.length === 0 && <BookSearchSkeleton />}

      {showDiscovery && (
        <section aria-labelledby="discovery-heading" className="flex flex-col gap-3">
          <h2
            id="discovery-heading"
            style={{
              fontFamily: "var(--font-curly)",
              fontSize: 28,
              color: "#FF3D9A",
              margin: 0,
              WebkitTextStroke: "1.8px #3B1F47",
              paintOrder: "stroke fill",
              filter: "drop-shadow(2px 3px 0 #3B1F47)",
            }}
          >
            para descubrir ✦
          </h2>
          <p
            style={{
              fontFamily: "var(--font-hand)",
              fontSize: 16,
              color: "#6E4A7A",
              margin: 0,
            }}
          >
            Libros que quizás no conoces todavía
          </p>
          <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {discoveryBooks.map((book) => (
              <li key={book.volumeId}>
                <BookSearchCard book={book} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasSearched && !isPending && results.length === 0 && (
        <p
          className="text-center"
          style={{ fontFamily: "var(--font-hand)", fontSize: 18, color: "#3B1F47" }}
        >
          No encontramos resultados para «{query}»
        </p>
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-4" aria-live="polite">
          <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((book, idx) => (
              <li key={`${book.volumeId}-${idx}`}>
                <BookSearchCard book={book} />
              </li>
            ))}
          </ul>
          {hasMore && (
            <div className="flex justify-center pt-2">
              <MBButton
                type="button"
                color="purple"
                size="sm"
                onClick={() => runSearch(query, searchType, lang, "append", results.length)}
                disabled={isPending}
              >
                ver más resultados ✦
              </MBButton>
            </div>
          )}
          {isPending && results.length > 0 && (
            <p
              className="text-center"
              style={{ fontFamily: "var(--font-hand)", fontSize: 15, color: "#6E4A7A" }}
            >
              cargando más libros…
            </p>
          )}
        </div>
      )}
    </div>
  );
}
