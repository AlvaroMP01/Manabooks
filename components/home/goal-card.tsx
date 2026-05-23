import { MBCard } from "@/components/mb/card";
import { MBHeart } from "@/components/mb/heart";

interface GoalCardProps {
  yearGoal: number;
  yearRead: number;
  monthRead: number;
  streak: number;
}

export function GoalCard({ yearGoal, yearRead, monthRead, streak }: GoalCardProps) {
  const year = new Date().getUTCFullYear();
  const filledCount = Math.min(yearRead, 52);

  return (
    <MBCard color="#FFD0E7" radius={22} className="p-5 lg:p-6">
      <div className="flex flex-col gap-4">
        {/* Eyebrow */}
        <p
          style={{
            fontFamily: "var(--font-sticker)",
            fontSize: 12,
            color: "#3B1F47",
            letterSpacing: "2px",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          META {year}
        </p>

        {/* Big counter */}
        <div className="flex items-baseline gap-2">
          <span
            style={{
              fontFamily: "var(--font-curly)",
              fontSize: "clamp(48px, 8vw, 64px)",
              color: "#FF3D9A",
              lineHeight: 1,
              WebkitTextStroke: "2px #3B1F47",
              paintOrder: "stroke fill",
              filter: "drop-shadow(2px 3px 0 #3B1F47)",
            }}
          >
            {yearRead}
          </span>
          <span
            style={{
              fontFamily: "var(--font-sticker)",
              fontSize: 14,
              color: "#3B1F47",
            }}
          >
            /{yearGoal} libros
          </span>
        </div>

        {/* Hardcoded 52 hearts for visual consistency — yearGoal may differ */}
        <div
          aria-hidden="true"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(13, minmax(0, 1fr))",
            gap: 3,
            justifyItems: "center",
          }}
        >
          {Array.from({ length: 52 }).map((_, i) => (
            <MBHeart
              key={i}
              size={18}
              color={i < filledCount ? "#FF3D9A" : "#FFD0E7"}
              outline="#3B1F47"
              className="h-auto w-full max-w-[18px]"
            />
          ))}
        </div>

        {/* Motivational line */}
        <p
          style={{
            fontFamily: "var(--font-hand)",
            fontSize: 18,
            color: "#6E4A7A",
            margin: 0,
          }}
        >
          sigue así reina 👑
        </p>

        {/* Mini stat tiles */}
        <div className="grid grid-cols-2 gap-3">
          {/* Month tile */}
          <div
            style={{
              background: "#FFFCFE",
              border: "2px solid #3B1F47",
              borderRadius: 14,
              boxShadow: "3px 4px 0 #3B1F47",
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-curly)",
                fontSize: 32,
                color: "#FF3D9A",
                lineHeight: 1,
                WebkitTextStroke: "1.5px #3B1F47",
                paintOrder: "stroke fill",
              }}
            >
              {monthRead}
            </span>
            <span
              style={{
                fontFamily: "var(--font-sticker)",
                fontSize: 10,
                color: "#3B1F47",
                letterSpacing: "1.5px",
              }}
            >
              ESTE MES
            </span>
          </div>

          {/* Streak tile */}
          <div
            style={{
              background: "#FFD86B",
              border: "2px solid #3B1F47",
              borderRadius: 14,
              boxShadow: "3px 4px 0 #3B1F47",
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-curly)",
                fontSize: 32,
                color: "#3B1F47",
                lineHeight: 1,
              }}
            >
              {streak}
            </span>
            <span
              style={{
                fontFamily: "var(--font-sticker)",
                fontSize: 10,
                color: "#3B1F47",
                letterSpacing: "1.5px",
              }}
            >
              LA RACHA PUTA
            </span>
          </div>
        </div>
      </div>
    </MBCard>
  );
}
