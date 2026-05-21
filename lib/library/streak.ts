import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

export interface StreakResult {
  currentStreak: number;
  lastActivityAt: string | null;
}

/**
 * MAX_GAP_DAYS — the maximum number of calendar days between two adjacent
 * activity dates that still counts as "consecutive" for streak purposes.
 *
 * gap = 0 → same day (deduplicated, doesn't add to streak)
 * gap = 1 → consecutive days (continues)
 * gap = 2 → ONE day skipped (still continues per spec)
 * gap >= 3 → streak breaks
 *
 * Also applied to "today vs latest activity": if MORE than 2 days have passed
 * since the most recent activity, the streak is considered broken (returns 0).
 */
const MAX_GAP_DAYS = 2;

/**
 * Normalize an ISO timestamp to a UTC calendar date string (YYYY-MM-DD).
 * UTC is intentional — see streak timezone tradeoff in the proposal.
 */
function toUtcDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Calendar days between two UTC date strings (YYYY-MM-DD).
 * Positive when laterUtc > earlierUtc; zero when same; negative if reversed.
 */
function daysBetween(laterUtc: string, earlierUtc: string): number {
  const laterParts = laterUtc.split("-");
  const earlierParts = earlierUtc.split("-");
  const ly = Number(laterParts[0]);
  const lm = Number(laterParts[1]);
  const ld = Number(laterParts[2]);
  const ey = Number(earlierParts[0]);
  const em = Number(earlierParts[1]);
  const ed = Number(earlierParts[2]);
  const laterMs = Date.UTC(ly, lm - 1, ld);
  const earlierMs = Date.UTC(ey, em - 1, ed);
  return Math.round((laterMs - earlierMs) / 86_400_000); // 86_400_000 = ms in a day
}

/**
 * getCurrentStreak — compute the user's current reading streak in pure TS.
 *
 * Query: all non-null last_progress_at values for the user, descending.
 * Algorithm:
 *   1. Empty result → { 0, null }.
 *   2. Dedupe to UTC calendar dates (preserves desc order via Set semantics).
 *   3. If today - latest > 2 days → streak broken, return { 0, lastActivityAt }.
 *   4. Walk pairs; gap <= 2 → continue, gap > 2 → break.
 *
 * NEVER throws. Returns { 0, null } on query error.
 */
export async function getCurrentStreak(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<StreakResult> {
  const { data, error } = await client
    .from("library_entries")
    .select("last_progress_at")
    .eq("user_id", userId)
    .not("last_progress_at", "is", null)
    .order("last_progress_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return { currentStreak: 0, lastActivityAt: null };
  }

  const firstRow = data[0];
  const lastActivityAt = firstRow?.last_progress_at ?? null;
  if (!lastActivityAt) {
    return { currentStreak: 0, lastActivityAt: null };
  }

  // Dedupe by calendar date. Set preserves insertion order, and the input
  // is already desc, so dates ends up desc-and-unique.
  const dates = Array.from(
    new Set(
      data
        .map((r) => r.last_progress_at)
        .filter((v): v is string => v !== null)
        .map(toUtcDate),
    ),
  );

  const today = toUtcDate(new Date().toISOString());
  const latestDate = dates[0];
  if (!latestDate || daysBetween(today, latestDate) > MAX_GAP_DAYS) {
    return { currentStreak: 0, lastActivityAt };
  }

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = dates[i - 1];
    const curr = dates[i];
    if (!prev || !curr) break;
    const gap = daysBetween(prev, curr);
    if (gap <= MAX_GAP_DAYS) {
      streak += 1;
    } else {
      break;
    }
  }

  return { currentStreak: streak, lastActivityAt };
}

// Internal helpers exported for future Vitest unit tests. Not part of the
// public API — consumers must use getCurrentStreak.
export const _internal = { toUtcDate, daysBetween, MAX_GAP_DAYS };
