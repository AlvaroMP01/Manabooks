import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

export interface ProfileStats {
  totalRead: number;
  totalPages: number;
  avgRating: number | null;
  ratedCount: number;
  monthlyReadCounts: number[];
  yearRead: number;
}

const EMPTY_STATS: ProfileStats = {
  totalRead: 0,
  totalPages: 0,
  avgRating: null,
  ratedCount: 0,
  monthlyReadCounts: Array(12).fill(0),
  yearRead: 0,
};

/**
 * getProfileStats — aggregate stats over the user's `read` library entries.
 * Single query, processed in TS. NEVER throws.
 */
export async function getProfileStats(
  client: SupabaseClient<Database>,
  userId: string,
  year: number
): Promise<ProfileStats> {
  const { data, error } = await client
    .from("library_entries")
    .select("rating, total_pages, finished_at")
    .eq("user_id", userId)
    .eq("status", "read");

  if (error || !data) return EMPTY_STATS;

  const monthlyReadCounts = Array(12).fill(0);
  let totalPages = 0;
  let ratingSum = 0;
  let ratedCount = 0;
  let yearRead = 0;

  for (const row of data) {
    totalPages += row.total_pages ?? 0;
    if (row.rating !== null) {
      ratingSum += row.rating;
      ratedCount += 1;
    }
    if (row.finished_at) {
      const finished = new Date(row.finished_at);
      if (finished.getUTCFullYear() === year) {
        yearRead += 1;
        monthlyReadCounts[finished.getUTCMonth()] += 1;
      }
    }
  }

  const avgRating = ratedCount > 0 ? Math.round((ratingSum / ratedCount) * 10) / 10 : null;

  return {
    totalRead: data.length,
    totalPages,
    avgRating,
    ratedCount,
    monthlyReadCounts,
    yearRead,
  };
}

export type AchievementId =
  | "streak-7"
  | "read-10"
  | "read-50"
  | "read-100"
  | "critic"
  | "pages-10k"
  | "month-5"
  | "goal-done";

export interface Achievement {
  id: AchievementId;
  emoji: string;
  label: string;
  color: string;
  unlocked: boolean;
}

interface ComputeAchievementsArgs {
  stats: ProfileStats;
  currentStreak: number;
  yearGoal: number;
}

/**
 * computeAchievements — derive the 8 achievement badges from current stats.
 * Order is stable so the grid layout doesn't shuffle between renders.
 */
export function computeAchievements({
  stats,
  currentStreak,
  yearGoal,
}: ComputeAchievementsArgs): Achievement[] {
  const maxMonthly = stats.monthlyReadCounts.length > 0 ? Math.max(...stats.monthlyReadCounts) : 0;

  return [
    {
      id: "streak-7",
      emoji: "🔥",
      label: "7 días",
      color: "var(--color-mb-yellow)",
      unlocked: currentStreak >= 7,
    },
    {
      id: "read-10",
      emoji: "✦",
      label: "10 libros",
      color: "var(--color-mb-pink-soft)",
      unlocked: stats.totalRead >= 10,
    },
    {
      id: "read-50",
      emoji: "📚",
      label: "50 libros",
      color: "var(--color-mb-sky)",
      unlocked: stats.totalRead >= 50,
    },
    {
      id: "read-100",
      emoji: "👑",
      label: "100 libros",
      color: "var(--color-mb-yellow)",
      unlocked: stats.totalRead >= 100,
    },
    {
      id: "critic",
      emoji: "⭐",
      label: "crítica",
      color: "var(--color-mb-purple)",
      unlocked: stats.ratedCount >= 10,
    },
    {
      id: "pages-10k",
      emoji: "📖",
      label: "10k págs",
      color: "var(--color-mb-mint)",
      unlocked: stats.totalPages >= 10000,
    },
    {
      id: "month-5",
      emoji: "🦋",
      label: "mes top",
      color: "var(--color-mb-pink)",
      unlocked: maxMonthly >= 5,
    },
    {
      id: "goal-done",
      emoji: "💜",
      label: "meta ✓",
      color: "var(--color-mb-purple-deep)",
      unlocked: yearGoal > 0 && stats.yearRead >= yearGoal,
    },
  ];
}
