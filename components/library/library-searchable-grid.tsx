"use client";

import { useMemo, useState } from "react";

import { LibraryEntryCard } from "@/components/library/library-entry-card";
import type { LibraryEntry } from "@/lib/library/types";

interface LibrarySearchableGridProps {
  entries: LibraryEntry[];
}

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

/** Library grid with a client-side title/author search filter. */
export function LibrarySearchableGrid({ entries }: LibrarySearchableGridProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return entries;
    return entries.filter((entry) => {
      if (normalize(entry.title).includes(q)) return true;
      return entry.authors.some((author) => normalize(author).includes(q));
    });
  }, [entries, query]);

  const hasQuery = query.trim().length > 0;

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor="library-search" className="flex flex-col gap-1">
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

      {filtered.length > 0 ? (
        <ul
          role="list"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {filtered.map((entry) => (
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
