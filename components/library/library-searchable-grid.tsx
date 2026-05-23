"use client";

import { useMemo, useState } from "react";

import { LibraryEntryCard } from "@/components/library/library-entry-card";
import type { LibraryEntry } from "@/lib/library/types";

interface LibrarySearchableGridProps {
  entries: LibraryEntry[];
}

type SortBy = "recent" | "name" | "rating";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "recent", label: "Más recientes" },
  { value: "name", label: "Nombre A→Z" },
  { value: "rating", label: "Valoración" },
];

/**
 * Normalize for diacritic-insensitive substring search.
 * "Perdón" → "perdon" so users searching "perdon" still match.
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function sortEntries(entries: LibraryEntry[], sortBy: SortBy): LibraryEntry[] {
  const copy = [...entries];
  if (sortBy === "name") {
    copy.sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: "base", numeric: true })
    );
  } else if (sortBy === "rating") {
    copy.sort((a, b) => {
      const ar = a.rating ?? -1;
      const br = b.rating ?? -1;
      if (ar !== br) return br - ar;
      return a.title.localeCompare(b.title, undefined, {
        sensitivity: "base",
        numeric: true,
      });
    });
  } else {
    copy.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  }
  return copy;
}

/** Library grid with a client-side title/author search filter + sort selector. */
export function LibrarySearchableGrid({ entries }: LibrarySearchableGridProps) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("recent");

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return entries;
    return entries.filter((entry) => {
      if (normalize(entry.title).includes(q)) return true;
      return entry.authors.some((author) => normalize(author).includes(q));
    });
  }, [entries, query]);

  const sorted = useMemo(() => sortEntries(filtered, sortBy), [filtered, sortBy]);

  const hasQuery = query.trim().length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <label htmlFor="library-search" className="flex-1">
          <span className="sr-only">Buscar en mi biblioteca</span>
          <input
            id="library-search"
            type="search"
            inputMode="search"
            value={query}
            placeholder="Busca por título o autor…"
            onChange={(e) => setQuery(e.target.value)}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              color: "#3B1F47",
              border: "2px solid #3B1F47",
              borderRadius: 999,
              padding: "10px 18px",
              width: "100%",
              boxShadow: "3px 4px 0 #3B1F47",
              outline: "none",
              background: "#FFFCFE",
            }}
          />
        </label>
        <label
          htmlFor="library-sort"
          className="flex items-center gap-2 self-start sm:self-auto"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 700,
            color: "#3B1F47",
          }}
        >
          Ordenar por:
          <select
            id="library-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="focus-visible:ring-mb-pink-deep focus-visible:ring-offset-mb-cream focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            style={{
              borderRadius: 999,
              padding: "8px 14px",
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
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {sorted.length > 0 ? (
        <ul
          role="list"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {sorted.map((entry) => (
            <li key={entry.id}>
              <LibraryEntryCard entry={entry} />
            </li>
          ))}
        </ul>
      ) : hasQuery ? (
        <p
          style={{
            fontFamily: "var(--font-hand)",
            fontSize: 20,
            color: "#6E4A7A",
            margin: 0,
            padding: "16px 0",
          }}
        >
          No encontré nada para «{query.trim()}» ✦
        </p>
      ) : null}
    </div>
  );
}
