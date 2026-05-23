import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LibrarySearchableGrid } from "@/components/library/library-searchable-grid";
import type { LibraryEntry } from "@/lib/library/types";

function makeEntry(overrides: Partial<LibraryEntry>): LibraryEntry {
  return {
    id: overrides.id ?? "id-" + Math.random(),
    googleVolumeId: "vol",
    title: overrides.title ?? "Untitled",
    authors: overrides.authors ?? ["Anon"],
    thumbnailUrl: null,
    status: overrides.status ?? "to_read",
    startedAt: null,
    finishedAt: null,
    createdAt: overrides.createdAt ?? "2026-05-01T00:00:00Z",
    updatedAt: "2026-05-01T00:00:00Z",
    currentPage: 0,
    totalPages: null,
    synopsis: null,
    rating: overrides.rating ?? null,
    genre: null,
    lastProgressAt: null,
    quickNote: null,
  };
}

function getRenderedTitles(): string[] {
  const list = screen.getByRole("list");
  return within(list)
    .getAllByRole("listitem")
    .map((li) => within(li).getByRole("heading", { level: 3 }).textContent ?? "");
}

describe("LibrarySearchableGrid sort", () => {
  it("defaults to recent (createdAt desc) order", () => {
    const entries = [
      makeEntry({ id: "1", title: "Old", createdAt: "2026-01-01T00:00:00Z" }),
      makeEntry({ id: "2", title: "New", createdAt: "2026-05-01T00:00:00Z" }),
      makeEntry({ id: "3", title: "Mid", createdAt: "2026-03-01T00:00:00Z" }),
    ];
    render(<LibrarySearchableGrid entries={entries} />);
    expect(getRenderedTitles()).toEqual(["New", "Mid", "Old"]);
  });

  it("sorts by name A→Z when sort=name selected", () => {
    const entries = [
      makeEntry({ id: "1", title: "Zorro" }),
      makeEntry({ id: "2", title: "Aurora" }),
      makeEntry({ id: "3", title: "Manga" }),
    ];
    render(<LibrarySearchableGrid entries={entries} />);

    fireEvent.change(screen.getByLabelText(/ordenar por/i), { target: { value: "name" } });
    expect(getRenderedTitles()).toEqual(["Aurora", "Manga", "Zorro"]);
  });

  it("sorts by rating desc with NULLs last and ties broken by title", () => {
    const entries = [
      makeEntry({ id: "1", title: "Beta", rating: null, status: "read" }),
      makeEntry({ id: "2", title: "Alpha", rating: 5, status: "read" }),
      makeEntry({ id: "3", title: "Gamma", rating: 3, status: "read" }),
      makeEntry({ id: "4", title: "Delta", rating: null, status: "to_read" }),
      makeEntry({ id: "5", title: "Epsilon", rating: 5, status: "read" }),
    ];
    render(<LibrarySearchableGrid entries={entries} />);

    fireEvent.change(screen.getByLabelText(/ordenar por/i), { target: { value: "rating" } });
    // 5/5 (Alpha < Epsilon by title) → 3/3 → NULLs (Beta < Delta)
    expect(getRenderedTitles()).toEqual(["Alpha", "Epsilon", "Gamma", "Beta", "Delta"]);
  });

  it("combines search filter and sort", () => {
    const entries = [
      makeEntry({ id: "1", title: "Pesadilla" }),
      makeEntry({ id: "2", title: "Perdón" }),
      makeEntry({ id: "3", title: "Plata" }),
      makeEntry({ id: "4", title: "Otro libro" }),
    ];
    render(<LibrarySearchableGrid entries={entries} />);

    const input = screen.getByPlaceholderText(/busca por título o autor/i);
    fireEvent.change(input, { target: { value: "p" } });
    fireEvent.change(screen.getByLabelText(/ordenar por/i), { target: { value: "name" } });

    expect(getRenderedTitles()).toEqual(["Perdón", "Pesadilla", "Plata"]);
  });
});
