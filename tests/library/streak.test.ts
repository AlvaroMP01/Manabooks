import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Database } from "@/lib/database.types";
import { _internal, getCurrentStreak } from "@/lib/library/streak";
import { STREAK_TIMEZONE } from "@/lib/library/streak-dates";

// ---------------------------------------------------------------------------
// Mock helper
// ---------------------------------------------------------------------------

type StreakRow = { last_progress_at: string | null };

/**
 * mockSupabaseForStreak — build a minimal Supabase client whose
 * `.from("library_entries")` chain resolves with the supplied rows.
 *
 * Why a thenable?
 * Supabase query builders are NOT Promises — they are "thenable" objects.
 * When you `await` a query, JS calls `.then()` on the object. `Promise.all`
 * also calls `.then()` on each element. So the mock must expose a `.then`
 * method rather than a plain resolved Promise.
 *
 * All chainable methods (select, eq, order, not) return the same query object
 * so that any ordering of calls works transparently.
 *
 * Mirrors the pattern from tests/home.test.tsx (`makeQuery`).
 */
function mockSupabaseForStreak(rows: StreakRow[]): SupabaseClient<Database> {
  const query: Record<string, unknown> = {};
  const methods = ["select", "eq", "order", "not"] as const;
  for (const m of methods) {
    query[m] = vi.fn(() => query);
  }
  query["then"] = (resolve: (v: unknown) => unknown) =>
    Promise.resolve({ data: rows, error: null }).then(resolve);

  return {
    from: vi.fn(() => query),
  } as unknown as SupabaseClient<Database>;
}

// ---------------------------------------------------------------------------
// _internal.toStreakDate
// ---------------------------------------------------------------------------

describe("_internal.toStreakDate", () => {
  it("converts a standard ISO timestamp with time component", () => {
    expect(_internal.toStreakDate("2026-03-15T14:30:00.000Z")).toBe("2026-03-15");
  });

  it("converts midnight UTC correctly", () => {
    expect(_internal.toStreakDate("2026-06-01T00:00:00.000Z")).toBe("2026-06-01");
  });

  it("converts near year-end (Dec 31 23:59:59.999Z) — Madrid is already Jan 1 (CET, UTC+1)", () => {
    expect(_internal.toStreakDate("2026-12-31T23:59:59.999Z")).toBe("2027-01-01");
  });

  it("converts edge of month (Jan 31 noon UTC)", () => {
    expect(_internal.toStreakDate("2026-01-31T12:00:00.000Z")).toBe("2026-01-31");
  });

  // Summer (CEST, UTC+2): 22:30 UTC = 00:30 Madrid next day.
  it("summer: 22:30 UTC rolls over to the next Madrid day (CEST, UTC+2)", () => {
    expect(_internal.toStreakDate("2026-07-15T22:30:00Z")).toBe("2026-07-16");
  });

  // Summer (CEST, UTC+2): 21:00 UTC = 23:00 Madrid same day.
  it("summer: 21:00 UTC stays on the same Madrid day (CEST, UTC+2)", () => {
    expect(_internal.toStreakDate("2026-07-15T21:00:00Z")).toBe("2026-07-15");
  });

  // Winter (CET, UTC+1): 23:30 UTC = 00:30 Madrid next day.
  it("winter: 23:30 UTC rolls over to the next Madrid day (CET, UTC+1)", () => {
    expect(_internal.toStreakDate("2026-01-15T23:30:00Z")).toBe("2026-01-16");
  });
});

// ---------------------------------------------------------------------------
// _internal.daysBetween
// ---------------------------------------------------------------------------

describe("_internal.daysBetween", () => {
  it("returns 0 for the same date", () => {
    expect(_internal.daysBetween("2026-03-15", "2026-03-15")).toBe(0);
  });

  it("returns 1 for consecutive dates", () => {
    expect(_internal.daysBetween("2026-03-16", "2026-03-15")).toBe(1);
  });

  it("handles leap year: 2024-03-01 to 2024-02-28 is 2 days apart", () => {
    // Feb 29, 2024 exists — so 28 Feb → 1 Mar = 2 calendar days
    expect(_internal.daysBetween("2024-03-01", "2024-02-28")).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// getCurrentStreak — integration tests via thenable Supabase mock
// ---------------------------------------------------------------------------
//
// The clock is frozen to a fixed Madrid-noon-ish instant so these tests don't
// depend on real wall-clock time near the Europe/Madrid midnight boundary.
// Date fixtures below are built off this pinned "now" (at UTC noon, so
// converting to Europe/Madrid, UTC+1 or UTC+2, never crosses a calendar-day
// boundary), keeping the "consecutive day" gaps intentional.

describe("getCurrentStreak", () => {
  const FIXED_NOW = new Date("2026-07-15T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("ensures STREAK_TIMEZONE is Europe/Madrid (guards against accidental changes)", () => {
    expect(STREAK_TIMEZONE).toBe("Europe/Madrid");
  });

  it("returns streak 3 for three consecutive days", async () => {
    const today = FIXED_NOW;
    const yesterday = new Date(today.getTime() - 86_400_000);
    const twoDaysAgo = new Date(today.getTime() - 2 * 86_400_000);

    const client = mockSupabaseForStreak([
      { last_progress_at: today.toISOString() },
      { last_progress_at: yesterday.toISOString() },
      { last_progress_at: twoDaysAgo.toISOString() },
    ]);

    const result = await getCurrentStreak(client, "user-1");
    expect(result.currentStreak).toBe(3);
    expect(result.lastActivityAt).toBe(today.toISOString());
  });

  it("continues streak when gap between two entries is exactly 2 days (≤ MAX_GAP_DAYS)", async () => {
    const today = FIXED_NOW;
    const twoDaysAgo = new Date(today.getTime() - 2 * 86_400_000);

    const client = mockSupabaseForStreak([
      { last_progress_at: today.toISOString() },
      { last_progress_at: twoDaysAgo.toISOString() },
    ]);

    const result = await getCurrentStreak(client, "user-1");
    expect(result.currentStreak).toBe(2);
  });

  it("breaks streak when gap between two entries is 3 days (> MAX_GAP_DAYS)", async () => {
    const today = FIXED_NOW;
    const threeDaysAgo = new Date(today.getTime() - 3 * 86_400_000);

    const client = mockSupabaseForStreak([
      { last_progress_at: today.toISOString() },
      { last_progress_at: threeDaysAgo.toISOString() },
    ]);

    const result = await getCurrentStreak(client, "user-1");
    // Only the "today" entry is counted — the gap breaks the chain
    expect(result.currentStreak).toBe(1);
  });

  it("returns streak 0 when latest activity is more than 2 days ago", async () => {
    const today = FIXED_NOW;
    const threeDaysAgo = new Date(today.getTime() - 3 * 86_400_000);

    const client = mockSupabaseForStreak([{ last_progress_at: threeDaysAgo.toISOString() }]);

    const result = await getCurrentStreak(client, "user-1");
    expect(result.currentStreak).toBe(0);
    expect(result.lastActivityAt).toBe(threeDaysAgo.toISOString());
  });

  it("returns { currentStreak: 0, lastActivityAt: null } for empty data", async () => {
    const client = mockSupabaseForStreak([]);

    const result = await getCurrentStreak(client, "user-1");
    expect(result.currentStreak).toBe(0);
    expect(result.lastActivityAt).toBeNull();
  });
});
