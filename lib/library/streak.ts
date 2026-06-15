import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import { daysBetween, MAX_GAP_DAYS, toStreakDate } from "@/lib/library/streak-dates";

export interface StreakResult {
  currentStreak: number;
  lastActivityAt: string | null;
}

/**
 * getCurrentStreak — compute the user's current reading streak in pure TS.
 *
 * Query: all non-null last_progress_at values for the user, descending.
 * Algorithm:
 *   1. Empty result → { 0, null }.
 *   2. Dedupe to Europe/Madrid calendar dates (preserves desc order via Set semantics).
 *   3. If today - latest > 2 days → streak broken, return { 0, lastActivityAt }.
 *   4. Walk pairs; gap <= 2 → continue, gap > 2 → break.
 *
 * NEVER throws. Returns { 0, null } on query error.
 */
export async function getCurrentStreak(
  client: SupabaseClient<Database>,
  userId: string
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
        .map(toStreakDate)
    )
  );

  const today = toStreakDate(new Date().toISOString());
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
export const _internal = { toStreakDate, daysBetween, MAX_GAP_DAYS };
