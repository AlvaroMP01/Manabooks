import type { LibraryEntry } from "@/lib/library/types";

import { ProgressEmptyState } from "./progress-empty-state";
import { ReadingRow } from "./reading-row";

interface ReadingListProps {
  entries: LibraryEntry[];
}

/** ReadingList — server wrapper rendering each ReadingRow or ProgressEmptyState when empty. */
export function ReadingList({ entries }: ReadingListProps) {
  if (entries.length === 0) {
    return <ProgressEmptyState />;
  }

  return (
    <ul className="flex flex-col gap-3" style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {entries.map((entry) => (
        <ReadingRow
          key={`${entry.id}-${entry.currentPage}`}
          entry={entry}
        />
      ))}
    </ul>
  );
}
