import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import { searchBooks } from "@/lib/google-books/client";
import type { Book } from "@/lib/google-books/types";

export const DISCOVERY_SUBJECTS = ["fiction", "romance", "manga", "fantasy", "history"] as const;

const DISCOVERY_LIMIT = 12;
const RESULT_LIMIT = 8;

/**
 * pickSubject — choose one DISCOVERY_SUBJECT deterministically based on the
 * UTC day-of-year. Same day = same subject across all users (cache-friendly).
 */
export function pickSubject(date: Date): (typeof DISCOVERY_SUBJECTS)[number] {
  const year = date.getUTCFullYear();
  const startOfYear = Date.UTC(year, 0, 1);
  const todayUtc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const dayOfYear = Math.floor((todayUtc - startOfYear) / 86_400_000);
  return DISCOVERY_SUBJECTS[dayOfYear % DISCOVERY_SUBJECTS.length]!;
}

/**
 * getDiscoveryBooks — fetch a small curated list of books to show in the search
 * empty state. Filters out books the user already has in their library.
 *
 * NEVER throws. Returns [] on any error (Google Books unreachable, Supabase
 * error, etc.) so the consuming page can render an empty discovery section.
 */
export async function getDiscoveryBooks(
  client: SupabaseClient<Database>,
  userId: string,
  now: Date = new Date()
): Promise<Book[]> {
  const subject = pickSubject(now);

  let items: Book[];
  try {
    const result = await searchBooks(`subject:${subject}`, { limit: DISCOVERY_LIMIT });
    items = result.items;
  } catch {
    return [];
  }

  if (items.length === 0) return [];

  let knownVolumeIds: Set<string>;
  try {
    const { data, error } = await client
      .from("library_entries")
      .select("google_volume_id")
      .eq("user_id", userId);
    knownVolumeIds = !error && data ? new Set(data.map((r) => r.google_volume_id)) : new Set();
  } catch {
    knownVolumeIds = new Set();
  }

  return items.filter((b) => !knownVolumeIds.has(b.volumeId)).slice(0, RESULT_LIMIT);
}
