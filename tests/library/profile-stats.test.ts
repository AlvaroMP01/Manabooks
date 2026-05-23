import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import type { Database } from "@/lib/database.types";
import { getProfileStats } from "@/lib/library/profile-stats";

type StatsRow = {
  rating: number | null;
  total_pages: number | null;
  finished_at: string | null;
};

function mockSupabaseForStats(
  rows: StatsRow[],
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

describe("getProfileStats", () => {
  it("returns empty stats when there are no read entries", async () => {
    const client = mockSupabaseForStats([]);
    const stats = await getProfileStats(client, "user-1", 2026);

    expect(stats.totalRead).toBe(0);
    expect(stats.totalPages).toBe(0);
    expect(stats.avgRating).toBeNull();
    expect(stats.ratedCount).toBe(0);
    expect(stats.yearRead).toBe(0);
    expect(stats.monthlyReadCounts).toEqual(Array(12).fill(0));
  });

  it("returns empty stats when the query errors", async () => {
    const client = mockSupabaseForStats([], { message: "boom" });
    const stats = await getProfileStats(client, "user-1", 2026);

    expect(stats.totalRead).toBe(0);
    expect(stats.totalPages).toBe(0);
    expect(stats.avgRating).toBeNull();
  });

  it("sums total_pages and coalesces NULL to 0", async () => {
    const client = mockSupabaseForStats([
      { rating: null, total_pages: 320, finished_at: null },
      { rating: null, total_pages: null, finished_at: null },
      { rating: null, total_pages: 480, finished_at: null },
    ]);

    const stats = await getProfileStats(client, "user-1", 2026);
    expect(stats.totalRead).toBe(3);
    expect(stats.totalPages).toBe(800);
  });

  it("computes avgRating rounded to 1 decimal and counts rated entries", async () => {
    const client = mockSupabaseForStats([
      { rating: 4, total_pages: null, finished_at: null },
      { rating: 5, total_pages: null, finished_at: null },
      { rating: 3, total_pages: null, finished_at: null },
      { rating: null, total_pages: null, finished_at: null },
    ]);

    const stats = await getProfileStats(client, "user-1", 2026);
    expect(stats.avgRating).toBe(4);
    expect(stats.ratedCount).toBe(3);
  });

  it("buckets finished_at by UTC month for the target year only", async () => {
    const client = mockSupabaseForStats([
      { rating: null, total_pages: null, finished_at: "2026-01-15T10:00:00Z" },
      { rating: null, total_pages: null, finished_at: "2026-01-20T10:00:00Z" },
      { rating: null, total_pages: null, finished_at: "2026-05-02T10:00:00Z" },
      { rating: null, total_pages: null, finished_at: "2025-12-31T23:59:59Z" },
      { rating: null, total_pages: null, finished_at: null },
    ]);

    const stats = await getProfileStats(client, "user-1", 2026);
    expect(stats.yearRead).toBe(3);
    expect(stats.monthlyReadCounts[0]).toBe(2);
    expect(stats.monthlyReadCounts[4]).toBe(1);
    expect(stats.monthlyReadCounts[11]).toBe(0);
  });
});
