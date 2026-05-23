import { MBCard } from "@/components/mb/card";
import { MBProgress } from "@/components/mb/progress";
import { MBSticker } from "@/components/mb/sticker";
import type { LibraryEntry } from "@/lib/library/types";

export function EntryProgressCard({ entry }: { entry: LibraryEntry }) {
  const hasTotal = entry.totalPages !== null;
  const pct =
    hasTotal && entry.totalPages! > 0
      ? Math.round((entry.currentPage / entry.totalPages!) * 100)
      : 0;

  return (
    <MBCard color="var(--color-mb-cream)" radius={20} className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <MBSticker color="var(--color-mb-white)" fontSize={11} padding="4px 10px" rotate={-2}>
          TU PROGRESO
        </MBSticker>
        {hasTotal && (
          <span
            style={{
              fontFamily: "var(--font-curly)",
              fontSize: 28,
              color: "var(--color-mb-pink-deep)",
              WebkitTextStroke: "1.5px #3B1F47",
              paintOrder: "stroke fill",
              lineHeight: 0.9,
            }}
          >
            {pct}%
          </span>
        )}
      </div>
      <MBProgress
        value={entry.currentPage}
        max={hasTotal ? entry.totalPages! : Math.max(entry.currentPage, 1)}
        height={20}
      />
      <div className="mt-3">
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 700,
            color: "#3B1F47",
          }}
        >
          {hasTotal
            ? `pág. ${entry.currentPage} de ${entry.totalPages}`
            : `${entry.currentPage} págs. leídas`}
        </span>
      </div>
    </MBCard>
  );
}
