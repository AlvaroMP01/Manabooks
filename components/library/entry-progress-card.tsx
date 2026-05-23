import { MBCard } from "@/components/mb/card";
import { MBProgress } from "@/components/mb/progress";
import type { LibraryEntry } from "@/lib/library/types";
import { formatReadingDate } from "@/lib/library/utils";

export function EntryStats({ entry }: { entry: LibraryEntry }) {
  const startedFmt = formatReadingDate(entry.startedAt);
  const finishedFmt = formatReadingDate(entry.finishedAt);
  const hasProgress = entry.totalPages !== null;
  const showSection = hasProgress || entry.currentPage > 0 || startedFmt || finishedFmt;

  if (!showSection) return null;

  return (
    <MBCard color="#FFFCFE" className="flex flex-col gap-4 p-6">
      {hasProgress && (
        <div className="space-y-2">
          <MBProgress value={entry.currentPage} max={entry.totalPages!} height={14} />
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#3B1F47" }}>
            página {entry.currentPage} de {entry.totalPages} ·{" "}
            {Math.round((entry.currentPage / entry.totalPages!) * 100)}%
          </p>
        </div>
      )}
      {!hasProgress && entry.currentPage > 0 && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#3B1F47" }}>
          página {entry.currentPage}
        </p>
      )}
      {startedFmt && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#3B1F47" }}>
          empezado: {startedFmt}
        </p>
      )}
      {finishedFmt && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#3B1F47" }}>
          terminado: {finishedFmt}
        </p>
      )}
    </MBCard>
  );
}
