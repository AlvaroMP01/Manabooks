import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

/**
 * UserProfile — the public shape consumed by Home/Progress pages.
 * Today only carries year_goal; will grow as profile features land.
 */
export interface UserProfile {
  yearGoal: number;
}

const DEFAULT_YEAR_GOAL = 52;
const DEFAULT_PROFILE: UserProfile = { yearGoal: DEFAULT_YEAR_GOAL };

/**
 * getUserProfile — read the user's profile, creating it on the fly if missing.
 *
 * Strategy:
 *   1. SELECT by user_id.
 *   2. If a row exists, map and return.
 *   3. Otherwise, attempt INSERT with defaults. Return defaults regardless
 *      of insert outcome (race with auth-callback upsert is fine due to
 *      onConflict do nothing; failure means "DB unavailable" and we still
 *      need a usable shape for the UI).
 *
 * NEVER throws. Worst case: defaults.
 */
export async function getUserProfile(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<UserProfile> {
  const { data, error } = await client
    .from("user_profiles")
    .select("year_goal")
    .eq("user_id", userId)
    .maybeSingle();

  if (!error && data) {
    return { yearGoal: data.year_goal };
  }

  // Row missing OR query errored. Try to self-heal with an INSERT.
  // ignoreDuplicates handles the auth-callback race; any other failure
  // falls through to defaults.
  try {
    await client
      .from("user_profiles")
      .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });
  } catch {
    // intentionally swallowed — defaults are always safe to return
  }

  return DEFAULT_PROFILE;
}
