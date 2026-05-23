import { MBCard } from "@/components/mb/card";
import { MBSparkle } from "@/components/mb/sparkle";

interface ProfileYearChartProps {
  year: number;
  monthlyReadCounts: number[];
  currentMonth: number;
}

const MONTH_LABELS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

const CHART_HEIGHT = 200;
const BAR_AREA_HEIGHT = 150;
const MIN_BAR_HEIGHT = 4;

/** ProfileYearChart — 12-bar reading chart for the current year. Server component. */
export function ProfileYearChart({ year, monthlyReadCounts, currentMonth }: ProfileYearChartProps) {
  const max = Math.max(...monthlyReadCounts, 1);

  return (
    <MBCard color="var(--color-mb-white)" radius={22} className="p-5">
      <div className="mb-4 flex items-center justify-between">
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
          tu año en lectura
        </h3>
        <span
          aria-hidden="true"
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            background: "var(--color-mb-pink)",
            color: "var(--color-mb-white)",
            border: "2px solid #3B1F47",
            boxShadow: "2px 3px 0 #3B1F47",
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {year}
        </span>
      </div>
      <div className="flex items-end gap-1 sm:gap-2" style={{ height: CHART_HEIGHT, marginTop: 8 }}>
        {monthlyReadCounts.map((value, idx) => {
          const isCurrent = idx === currentMonth;
          const heightPct = (value / max) * BAR_AREA_HEIGHT;
          const barHeight = Math.max(heightPct, MIN_BAR_HEIGHT);
          const month = MONTH_LABELS[idx];
          return (
            <div key={month} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <span
                style={{
                  fontFamily: "var(--font-sticker)",
                  fontSize: 12,
                  color: "#3B1F47",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {value}
              </span>
              <div
                role="img"
                aria-label={`${value} ${value === 1 ? "libro" : "libros"} en ${month}`}
                style={{
                  position: "relative",
                  width: "70%",
                  height: barHeight,
                  background: isCurrent
                    ? "var(--color-mb-pink-deep)"
                    : idx % 2 === 0
                      ? "var(--color-mb-purple)"
                      : "var(--color-mb-pink)",
                  border: "2px solid #3B1F47",
                  borderRadius: "8px 8px 4px 4px",
                  boxShadow: "2px 2px 0 #3B1F47",
                }}
              >
                {isCurrent && <MBSparkle size={16} className="absolute -top-2 -right-2" />}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#3B1F47",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {month}
              </span>
            </div>
          );
        })}
      </div>
    </MBCard>
  );
}
