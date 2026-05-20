import { MBBookCover } from "@/components/mb/book-cover";
import { MBCard } from "@/components/mb/card";
import { MBStatus } from "@/components/mb/status";
import type { LibraryEntry } from "@/lib/library/types";
import { dbStatusToMBKey } from "@/lib/library/utils";

export function EntryHero({ entry }: { entry: LibraryEntry }) {
  return (
    <MBCard
      color="#FFFCFE"
      className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start sm:gap-6"
    >
      <MBBookCover
        title={entry.title}
        author={entry.authors[0] ?? ""}
        thumbnail={entry.thumbnailUrl}
        width={120}
        height={180}
      />
      <div className="flex-1 text-center sm:text-left">
        <h1
          style={{
            fontFamily: "var(--font-curly)",
            fontSize: 36,
            color: "#3B1F47",
            margin: 0,
            wordBreak: "break-word",
          }}
        >
          {entry.title}
        </h1>
        {entry.authors.length > 0 && (
          <p style={{ fontFamily: "var(--font-hand)", fontSize: 20, color: "#8B3FE0" }}>
            {entry.authors.join(", ")}
          </p>
        )}
        <div className="mt-3 inline-block">
          <MBStatus status={dbStatusToMBKey(entry.status)} />
        </div>
      </div>
    </MBCard>
  );
}
