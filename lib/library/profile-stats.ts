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
