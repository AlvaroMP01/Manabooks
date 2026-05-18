"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/library/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="mx-4 flex max-w-md flex-1">
      <label htmlFor="header-search-input" className="sr-only">
        Buscar libros
      </label>
      <input
        id="header-search-input"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar libros…"
        autoComplete="off"
        className="focus-visible:ring-sakura-500 w-full rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm transition-shadow outline-none focus-visible:ring-2"
      />
    </form>
  );
}
