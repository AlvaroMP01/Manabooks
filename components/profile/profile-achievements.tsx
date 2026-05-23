import { MBCard } from "@/components/mb/card";
import type { Achievement } from "@/lib/library/profile-stats";

interface ProfileAchievementsProps {
  achievements: Achievement[];
}

/** ProfileAchievements — 4×2 grid of achievement badges with locked/unlocked state. Server component. */
export function ProfileAchievements({ achievements }: ProfileAchievementsProps) {
  return (
    <MBCard color="var(--color-mb-cream)" radius={22} className="p-5">
      <h3
        style={{
          fontFamily: "var(--font-curly)",
          fontSize: 26,
          color: "#FF3D9A",
          margin: "0 0 14px",
          WebkitTextStroke: "1.5px #3B1F47",
          paintOrder: "stroke fill",
          filter: "drop-shadow(1.5px 2px 0 #3B1F47)",
        }}
      >
        logros
      </h3>
      <ul
        role="list"
        className="grid grid-cols-4 gap-2.5"
        style={{ listStyle: "none", padding: 0, margin: 0 }}
      >
        {achievements.map((a) => {
          const status = a.unlocked ? "desbloqueado" : "bloqueado";
          return (
            <li
              key={a.id}
              aria-label={`${a.label} — ${status}`}
              style={{
                aspectRatio: "1 / 1",
                background: a.unlocked ? a.color : "var(--color-mb-pink-soft)",
                border: "2px solid #3B1F47",
                borderRadius: 14,
                boxShadow: "2px 3px 0 #3B1F47",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                opacity: a.unlocked ? 1 : 0.45,
                filter: a.unlocked ? "none" : "grayscale(0.6)",
              }}
            >
              <span aria-hidden="true" style={{ fontSize: 22, lineHeight: 1 }}>
                {a.emoji}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#3B1F47",
                  marginTop: 4,
                  textAlign: "center",
                  lineHeight: 1.1,
                }}
              >
                {a.label}
              </span>
            </li>
          );
        })}
      </ul>
    </MBCard>
  );
}
