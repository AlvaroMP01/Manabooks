import { redirect } from "next/navigation";

import { CurrentlyReadingCard } from "@/components/home/currently-reading-card";
import { GoalCard } from "@/components/home/goal-card";
import { HomeEmptyState } from "@/components/home/home-empty-state";
import { HomeTopBar } from "@/components/home/home-top-bar";
import { RecentReadsCard } from "@/components/home/recent-reads-card";
import { TBRPileCard } from "@/components/home/tbr-pile-card";
import { extractDisplayName, extractEmail } from "@/lib/auth/display-name";
import { getUserProfile } from "@/lib/library/profile";
import { getCurrentStreak } from "@/lib/library/streak";
import { type LibraryEntry, rowToEntry } from "@/lib/library/types";
import { createClient } from "@/lib/supabase/server";

// Local view-model — not exported
type HomeData = {
  name: string;
  totalCount: number;
  currentReading: LibraryEntry[];
  recentReads: LibraryEntry[];
  tbrEntries: LibraryEntry[];
  yearRead: number;
  monthRead: number;
  yearGoal: number;
  streak: number;
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();

  if (!authData?.claims) {
    redirect("/login");
  }

  const userId = authData.claims.sub as string;

  // UTC-aligned year and month starts — matches streak.ts UTC convention
  const now = new Date();
  const yearStartUTC = new Date(Date.UTC(now.getUTCFullYear(), 0, 1)).toISOString();
  const monthStartUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();

  const [
    totalCountRes,
    currentReadingRes,
    recentReadsRes,
    tbrRes,
    yearReadRes,
    monthReadRes,
    profile,
    streakResult,
  ] = await Promise.all([
    supabase
      .from("library_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("library_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "reading")
      .order("updated_at", { ascending: false })
      .limit(2),
    supabase
      .from("library_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "read")
      .order("finished_at", { ascending: false, nullsFirst: false })
      .limit(5),
    supabase
      .from("library_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "to_read")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("library_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "read")
      .gte("finished_at", yearStartUTC),
    supabase
      .from("library_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "read")
      .gte("finished_at", monthStartUTC),
    getUserProfile(supabase, userId),
    getCurrentStreak(supabase, userId),
  ]);

  // Unwrap counts and map rows
  const totalCount = totalCountRes.count ?? 0;
  const yearRead = yearReadRes.count ?? 0;
  const monthRead = monthReadRes.count ?? 0;
  const currentReading = (currentReadingRes.data ?? []).map(rowToEntry);
  const recentReads = (recentReadsRes.data ?? []).map(rowToEntry);
  const tbrEntries = (tbrRes.data ?? []).map(rowToEntry);
  const yearGoal = profile.yearGoal;
  const streak = streakResult.currentStreak;

  // Display name — resolved from claims directly (getUserProfile only returns yearGoal)
  const displayName = extractDisplayName(authData.claims);
  const email = extractEmail(authData.claims);
  const name = displayName ?? (email ? email.split("@")[0] : null) ?? "lectora";

  const data: HomeData = {
    name,
    totalCount,
    currentReading,
    recentReads,
    tbrEntries,
    yearRead,
    monthRead,
    yearGoal,
    streak,
  };

  const isCompletelyEmpty = data.totalCount === 0;

  return (
    <div className="flex flex-col gap-5">
      <HomeTopBar name={data.name} totalCount={data.totalCount} />

      {isCompletelyEmpty ? (
        <HomeEmptyState name={data.name} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
            <CurrentlyReadingCard entries={data.currentReading} />
            <GoalCard
              yearGoal={data.yearGoal}
              yearRead={data.yearRead}
              monthRead={data.monthRead}
              streak={data.streak}
            />
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
            <RecentReadsCard entries={data.recentReads} />
            <TBRPileCard entries={data.tbrEntries} />
          </div>
        </>
      )}
    </div>
  );
}
