import { redirect } from "next/navigation";

import { MBSparkle } from "@/components/mb/sparkle";
import { ProgressStreakSummary } from "@/components/progress/progress-streak-summary";
import { ReadingList } from "@/components/progress/reading-list";
import { YearGoalCard } from "@/components/progress/year-goal-card";
import { getUserProfile } from "@/lib/library/profile";
import { getCurrentStreak } from "@/lib/library/streak";
import { type LibraryEntry,rowToEntry } from "@/lib/library/types";
import { createClient } from "@/lib/supabase/server";

// Local view-model — not exported
type HomeProgressData = {
  yearGoal: number;
  yearRead: number;
  currentReading: LibraryEntry[];
  currentStreak: number;
  lastActivityAt: string | null;
};

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();

  if (!authData?.claims) {
    redirect("/login");
  }

  const userId = authData.claims.sub as string;

  const [profile, currentReadingRes, yearReadRes, streakResult] = await Promise.all([
    getUserProfile(supabase, userId),
    supabase
      .from("library_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "reading")
      .order("updated_at", { ascending: false }),
    supabase
      .from("library_entries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "read"),
    getCurrentStreak(supabase, userId),
  ]);

  const currentReading = (currentReadingRes.data ?? []).map(rowToEntry);
  const yearRead = yearReadRes.count ?? 0;

  const data: HomeProgressData = {
    yearGoal: profile.yearGoal,
    yearRead,
    currentReading,
    currentStreak: streakResult.currentStreak,
    lastActivityAt: streakResult.lastActivityAt,
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Inline page header */}
      <header className="relative">
        <MBSparkle
          size={28}
          twinkle
          className="absolute -top-1 left-24"
        />
        <MBSparkle
          size={18}
          twinkle
          className="absolute top-10 -left-4"
        />
        <h1
          style={{
            fontFamily: "var(--font-curly)",
            fontSize: 52,
            color: "#FF3D9A",
            margin: 0,
            lineHeight: 0.95,
            WebkitTextStroke: "2.5px #3B1F47",
            paintOrder: "stroke fill",
            filter: "drop-shadow(3px 4px 0 #3B1F47)",
          }}
        >
          tu progreso
        </h1>
        <p
          style={{
            fontFamily: "var(--font-hand)",
            fontSize: 22,
            color: "#8B3FE0",
            marginTop: 12,
            marginBottom: 0,
          }}
        >
          actualiza dónde vas y mantén la racha viva ♡
        </p>
      </header>

      {/* Top row: goal card + streak summary */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <YearGoalCard yearGoal={data.yearGoal} />
        <ProgressStreakSummary
          currentStreak={data.currentStreak}
          lastActivityAt={data.lastActivityAt}
        />
      </div>

      {/* Reading list (or empty state) */}
      <div>
        <ReadingList entries={data.currentReading} />
      </div>
    </div>
  );
}
