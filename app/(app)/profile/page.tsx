import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";

import { MBButton } from "@/components/mb/button";
import { ProfileStatTile } from "@/components/profile/profile-stat-tile";
import { ProfileYearChart } from "@/components/profile/profile-year-chart";
import { ProfileYearGoal } from "@/components/profile/profile-year-goal";
import { extractDisplayName, extractEmail } from "@/lib/auth/display-name";
import { getUserProfile } from "@/lib/library/profile";
import { getProfileStats } from "@/lib/library/profile-stats";
import { getCurrentStreak } from "@/lib/library/streak";
import { createClient } from "@/lib/supabase/server";

const NUMBER_FORMATTER = new Intl.NumberFormat("es-ES");

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();

  if (!authData?.claims) {
    redirect("/login");
  }

  const claims = authData.claims;
  const userId = claims.sub as string;
  const displayName = extractDisplayName(claims);
  const email = extractEmail(claims);
  const headline = displayName ?? email ?? "mi perfil";
  const initial = headline.charAt(0).toUpperCase();

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();
  const [stats, streakResult, profile] = await Promise.all([
    getProfileStats(supabase, userId, currentYear),
    getCurrentStreak(supabase, userId),
    getUserProfile(supabase, userId),
  ]);

  return (
    <section aria-labelledby="profile-heading" className="flex flex-col gap-8">
      <h1 id="profile-heading" className="sr-only">
        Mi perfil
      </h1>

      <header className="flex items-center gap-6">
        <div
          aria-hidden="true"
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "#B967FF",
            border: "2.5px solid #3B1F47",
            boxShadow: "3px 4px 0 #3B1F47",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontFamily: "var(--font-sticker)",
            fontSize: 30,
            color: "#FFFCFE",
          }}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <h2
            style={{
              fontFamily: "var(--font-curly)",
              fontSize: 36,
              color: "#FF3D9A",
              margin: 0,
              lineHeight: 1.1,
              WebkitTextStroke: "2px #3B1F47",
              paintOrder: "stroke fill",
              filter: "drop-shadow(2px 3px 0 #3B1F47)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={headline}
          >
            {headline}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-hand)",
              fontSize: 18,
              color: "#8B3FE0",
              margin: 0,
              marginTop: 4,
            }}
          >
            tu rincón de lectora ✦
          </p>
          {displayName && email && (
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "#6E4A7A",
                margin: 0,
                marginTop: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={email}
            >
              {email}
            </p>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-3">
        <h3
          style={{
            fontFamily: "var(--font-curly)",
            fontSize: 28,
            color: "#FF3D9A",
            margin: 0,
            WebkitTextStroke: "1.8px #3B1F47",
            paintOrder: "stroke fill",
            filter: "drop-shadow(2px 3px 0 #3B1F47)",
          }}
        >
          tu biblioteca en números
        </h3>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ProfileStatTile
            label="libros leídos"
            value={String(stats.totalRead)}
            icon="✦"
            color="var(--color-mb-pink)"
          />
          <ProfileStatTile
            label="páginas totales"
            value={NUMBER_FORMATTER.format(stats.totalPages)}
            icon="◉"
            color="var(--color-mb-sky)"
            valueFontSize={36}
          />
          <ProfileStatTile
            label="rating promedio"
            value={stats.avgRating !== null ? stats.avgRating.toFixed(1) : "—"}
            icon="♡"
            color="var(--color-mb-yellow)"
          />
          <ProfileStatTile
            label="racha actual"
            value={streakResult.currentStreak > 0 ? `${streakResult.currentStreak}🔥` : "0"}
            icon="⚡"
            color="var(--color-mb-mint)"
            valueFontSize={36}
          />
        </dl>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <ProfileYearChart
          year={currentYear}
          monthlyReadCounts={stats.monthlyReadCounts}
          currentMonth={currentMonth}
        />
        <ProfileYearGoal year={currentYear} yearRead={stats.yearRead} yearGoal={profile.yearGoal} />
      </div>

      <div className="flex justify-end">
        <form action="/auth/sign-out" method="post">
          <MBButton type="submit" color="white" size="md">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <LogOut size={14} aria-hidden />
              cerrar sesión
            </span>
          </MBButton>
        </form>
      </div>
    </section>
  );
}
