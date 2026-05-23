import { MBCard } from "@/components/mb/card";
import { MBDiamond } from "@/components/mb/diamond";
import { MBProgress } from "@/components/mb/progress";

interface ProfileYearGoalProps {
  year: number;
  yearRead: number;
  yearGoal: number;
}

/** ProfileYearGoal — read-only display of the user's reading goal. Server component. */
export function ProfileYearGoal({ year, yearRead, yearGoal }: ProfileYearGoalProps) {
  const reached = yearGoal > 0 && yearRead >= yearGoal;
  const remaining = Math.max(yearGoal - yearRead, 0);

  return (
    <MBCard color="var(--color-mb-pink-soft)" radius={22} className="relative overflow-hidden p-5">
      <span
        aria-hidden="true"
        className="absolute top-3 right-3"
        style={{ transform: "rotate(12deg)" }}
      >
        <MBDiamond size={48} />
      </span>

      <p
        style={{
          fontFamily: "var(--font-sticker)",
          fontSize: 11,
          color: "#3B1F47",
          letterSpacing: "2px",
          margin: 0,
          textTransform: "uppercase",
        }}
      >
        META {year}
      </p>

      <div
        aria-label={`${yearRead} de ${yearGoal} libros`}
        style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "8px 0 12px" }}
      >
        <span
          style={{
            fontFamily: "var(--font-curly)",
            fontSize: 56,
            color: "#FF3D9A",
            lineHeight: 0.95,
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
            fontSize: 22,
            color: "#3B1F47",
          }}
        >
          /{yearGoal}
        </span>
      </div>

      <MBProgress value={yearRead} max={Math.max(yearGoal, 1)} height={14} />

      <p
        style={{
          fontFamily: "var(--font-hand)",
          fontSize: 17,
          color: "#3B1F47",
          marginTop: 12,
          marginBottom: 0,
        }}
      >
        {reached ? (
          "¡meta cumplida!"
        ) : (
          <>
            te quedan{" "}
            <strong style={{ color: "#FF3D9A" }}>
              {remaining} {remaining === 1 ? "libro" : "libros"}
            </strong>
          </>
        )}
      </p>
    </MBCard>
  );
}
