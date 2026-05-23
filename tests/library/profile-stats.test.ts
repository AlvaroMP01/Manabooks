import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import type { Database } from "@/lib/database.types";
import {
  computeAchievements,
  getProfileStats,
  type ProfileStats,
} from "@/lib/library/profile-stats";

type StatsRow = {
  rating: number | null;
  total_pages: number | null;
  finished_at: string | null;
};

function mockSupabaseForStats(rows: StatsRow[], error: unknown = null): SupabaseClient<Database> {
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

const EMPTY: ProfileStats = {
  totalRead: 0,
  totalPages: 0,
  avgRating: null,
  ratedCount: 0,
  monthlyReadCounts: Array(12).fill(0),
  yearRead: 0,
};

describe("computeAchievements", () => {
  it("returns 8 badges in stable order with all locked for greenfield stats", () => {
    const badges = computeAchievements({ stats: EMPTY, currentStreak: 0, yearGoal: 0 });
    expect(badges).toHaveLength(8);
    expect(badges.map((b) => b.id)).toEqual([
      "streak-7",
      "read-10",
      "read-50",
      "read-100",
      "critic",
      "pages-10k",
      "month-5",
      "goal-done",
    ]);
    expect(badges.every((b) => !b.unlocked)).toBe(true);
  });

  it("unlocks streak-7 at exactly 7 days", () => {
    const a = computeAchievements({ stats: EMPTY, currentStreak: 6, yearGoal: 0 });
    const b = computeAchievements({ stats: EMPTY, currentStreak: 7, yearGoal: 0 });
    expect(a.find((x) => x.id === "streak-7")?.unlocked).toBe(false);
    expect(b.find((x) => x.id === "streak-7")?.unlocked).toBe(true);
  });

  it("unlocks read-10/50/100 at thresholds", () => {
    const badges = computeAchievements({
      stats: { ...EMPTY, totalRead: 60 },
      currentStreak: 0,
      yearGoal: 0,
    });
    expect(badges.find((b) => b.id === "read-10")?.unlocked).toBe(true);
    expect(badges.find((b) => b.id === "read-50")?.unlocked).toBe(true);
    expect(badges.find((b) => b.id === "read-100")?.unlocked).toBe(false);
  });

  it("unlocks critic at ratedCount >= 10", () => {
    const badges = computeAchievements({
      stats: { ...EMPTY, ratedCount: 10 },
      currentStreak: 0,
      yearGoal: 0,
    });
    expect(badges.find((b) => b.id === "critic")?.unlocked).toBe(true);
  });

  it("unlocks pages-10k at 10000 pages", () => {
    const badges = computeAchievements({
      stats: { ...EMPTY, totalPages: 10000 },
      currentStreak: 0,
      yearGoal: 0,
    });
    expect(badges.find((b) => b.id === "pages-10k")?.unlocked).toBe(true);
  });

  it("unlocks month-5 when any month reaches 5 reads", () => {
    const months = Array(12).fill(0);
    months[3] = 5;
    const badges = computeAchievements({
      stats: { ...EMPTY, monthlyReadCounts: months },
      currentStreak: 0,
      yearGoal: 0,
    });
    expect(badges.find((b) => b.id === "month-5")?.unlocked).toBe(true);
  });

  it("unlocks goal-done only when yearGoal > 0 AND yearRead >= yearGoal", () => {
    const locked = computeAchievements({
      stats: { ...EMPTY, yearRead: 5 },
      currentStreak: 0,
      yearGoal: 0,
    });
    expect(locked.find((b) => b.id === "goal-done")?.unlocked).toBe(false);

    const unlocked = computeAchievements({
      stats: { ...EMPTY, yearRead: 24 },
      currentStreak: 0,
      yearGoal: 24,
    });
    expect(unlocked.find((b) => b.id === "goal-done")?.unlocked).toBe(true);
  });
});
