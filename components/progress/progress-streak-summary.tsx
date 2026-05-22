import { MBCard } from "@/components/mb/card";

interface ProgressStreakSummaryProps {
  currentStreak: number;
  lastActivityAt: string | null;
}

/** formatLastActivity — UTC calendar diff, matching streak.ts convention. Pure, no imports needed. */
function formatLastActivity(lastActivityAt: string | null): string {
  if (!lastActivityAt) return "aún no actualizaste nada ♡";

  const last = new Date(lastActivityAt);
  const today = new Date();
  const lastUtc = Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate());
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const days = Math.round((todayUtc - lastUtc) / 86_400_000);

  if (days <= 0) return "última actualización: hoy";
  if (days === 1) return "última actualización: ayer";
  return `última actualización: hace ${days} días`;
}

/** ProgressStreakSummary — displays current reading streak. Server component. */
export function ProgressStreakSummary({ currentStreak, lastActivityAt }: ProgressStreakSummaryProps) {
  const subtitle = currentStreak === 1 ? "día leyendo" : "días leyendo";
  const lastActivity = formatLastActivity(lastActivityAt);

  return (
    <MBCard color="#FFD86B" radius={22} className="p-5 lg:p-6">
      <div className="flex flex-col gap-3">
        {/* Eyebrow */}
        <p
          style={{
            fontFamily: "var(--font-sticker)",
            fontSize: 11,
            color: "#3B1F47",
            letterSpacing: "1.5px",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          RACHA DE LECTURA
        </p>

        {/* Big streak number */}
        <div
          aria-label={`Racha actual: ${currentStreak} días`}
          style={{ display: "flex", alignItems: "baseline", gap: 8 }}
        >
          <span
            style={{
              fontFamily: "var(--font-curly)",
              fontSize: 56,
              color: "#3B1F47",
              lineHeight: 1,
            }}
          >
            {currentStreak}
          </span>
          <span
            style={{
              fontFamily: "var(--font-sticker)",
              fontSize: 11,
              color: "#3B1F47",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            {subtitle}
          </span>
        </div>

        {/* Last activity relative date */}
        <p
          style={{
            fontFamily: "var(--font-hand)",
            fontSize: 14,
            color: "#6E4A7A",
            margin: 0,
          }}
        >
          {lastActivity}
        </p>
      </div>
    </MBCard>
  );
}
