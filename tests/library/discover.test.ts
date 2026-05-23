import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Database } from "@/lib/database.types";
import { DISCOVERY_SUBJECTS, getDiscoveryBooks, pickSubject } from "@/lib/library/discover";

vi.mock("@/lib/google-books/client", () => ({
  searchBooks: vi.fn(),
}));

const { searchBooks } = await import("@/lib/google-books/client");
const mockedSearchBooks = vi.mocked(searchBooks);

afterEach(() => {
  vi.clearAllMocks();
});

function makeBook(volumeId: string) {
  return {
    volumeId,
    title: `Title ${volumeId}`,
    authors: ["Author"],
    thumbnail: null,
    publishedDate: null,
    description: null,
    pageCount: null,
    categories: [],
    language: null,
    previewLink: null,
  };
}

type VolumeRow = { google_volume_id: string };

function mockSupabaseForLibrary(
  rows: VolumeRow[],
  error: unknown = null
): SupabaseClient<Database> {
  const query: Record<string, unknown> = {};
  for (const m of ["select", "eq"] as const) {
    query[m] = vi.fn(() => query);
  }
  query["then"] = (resolve: (v: unknown) => unknown) =>
    Promise.resolve({ data: error ? null : rows, error }).then(resolve);
  return {
    from: vi.fn(() => query),
  } as unknown as SupabaseClient<Database>;
}

describe("pickSubject", () => {
  it("returns a known subject for any input date", () => {
    const subjects = new Set(DISCOVERY_SUBJECTS);
    for (let day = 0; day < 365; day++) {
      const date = new Date(Date.UTC(2026, 0, 1 + day));
      expect(subjects.has(pickSubject(date))).toBe(true);
    }
  });

  it("is deterministic — same UTC day returns same subject", () => {
    const morning = new Date("2026-03-15T03:00:00Z");
    const evening = new Date("2026-03-15T23:00:00Z");
    expect(pickSubject(morning)).toBe(pickSubject(evening));
  });

  it("rotates through all subjects across a 5-day window", () => {
    const seen = new Set<string>();
    for (let day = 0; day < DISCOVERY_SUBJECTS.length; day++) {
      const date = new Date(Date.UTC(2026, 0, 1 + day));
      seen.add(pickSubject(date));
    }
    expect(seen.size).toBe(DISCOVERY_SUBJECTS.length);
  });
});

describe("getDiscoveryBooks", () => {
  it("returns up to 8 items excluding books already in the user library", async () => {
    mockedSearchBooks.mockResolvedValue({
      items: ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"].map(makeBook),
      total: 100,
    });
    const client = mockSupabaseForLibrary([{ google_volume_id: "v2" }, { google_volume_id: "v5" }]);

    const result = await getDiscoveryBooks(client, "user-1");
    const ids = result.map((b) => b.volumeId);
    expect(result).toHaveLength(8);
    expect(ids).not.toContain("v2");
    expect(ids).not.toContain("v5");
  });

  it("returns at most 8 books even if Google Books returns more", async () => {
    mockedSearchBooks.mockResolvedValue({
      items: Array.from({ length: 12 }, (_, i) => makeBook(`v${i}`)),
      total: 100,
    });
    const client = mockSupabaseForLibrary([]);

    const result = await getDiscoveryBooks(client, "user-1");
    expect(result).toHaveLength(8);
  });

  it("returns [] when searchBooks throws", async () => {
    mockedSearchBooks.mockRejectedValue(new Error("boom"));
    const client = mockSupabaseForLibrary([]);

    const result = await getDiscoveryBooks(client, "user-1");
    expect(result).toEqual([]);
  });

  it("does not throw and falls back to no-filtering when Supabase errors", async () => {
    mockedSearchBooks.mockResolvedValue({
      items: [makeBook("v1"), makeBook("v2")],
      total: 2,
    });
    const client = mockSupabaseForLibrary([], { message: "rls" });

    const result = await getDiscoveryBooks(client, "user-1");
    expect(result.map((b) => b.volumeId)).toEqual(["v1", "v2"]);
  });

  it("returns [] when searchBooks returns no items", async () => {
    mockedSearchBooks.mockResolvedValue({ items: [], total: 0 });
    const client = mockSupabaseForLibrary([]);

    const result = await getDiscoveryBooks(client, "user-1");
    expect(result).toEqual([]);
  });
});
