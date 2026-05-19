import { EntryActionsMenu } from "@/components/library/entry-actions-menu";
import { MBBookCover } from "@/components/mb/book-cover";
import { MBCard } from "@/components/mb/card";
import { MBStatus } from "@/components/mb/status";
import { MBSticker } from "@/components/mb/sticker";
import type { LibraryEntry } from "@/lib/library/types";
import { dbStatusToMBKey } from "@/lib/library/utils";

/** LibraryEntryCard — book card with MB cover, title, author and status chip. */
export function LibraryEntryCard({ entry }: { entry: LibraryEntry }) {
  const mbStatus = dbStatusToMBKey(entry.status);

  return (
    <MBCard
      color="#FFFCFE"
      radius={18}
      className="relative flex flex-col items-center gap-3 p-4"
      aria-label={`${entry.title}${entry.authors.length ? `, ${entry.authors.join(", ")}` : ""}`}
    >
      {entry.status === "reading" && (
        <MBSticker
          color="#FF6FB5"
          fontSize={11}
          padding="3px 9px"
          rotate={-6}
          style={{ position: "absolute", top: -8, right: -6 }}
          aria-label="Leyendo ahora"
        >
          NOW
        </MBSticker>
      )}
      <MBBookCover
        title={entry.title}
        author={entry.authors[0] ?? ""}
        width={120}
        height={180}
        tilt={-2}
      />
      <div className="w-full text-center">
        <h3
          className="line-clamp-2"
          style={{
            fontFamily: "var(--font-sticker)",
            fontSize: 14,
            color: "#3B1F47",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {entry.title}
        </h3>
        {entry.authors[0] && (
          <p
            className="mt-1 line-clamp-1"
            style={{ fontFamily: "var(--font-hand)", fontSize: 14, color: "#8B3FE0" }}
          >
            {entry.authors[0]}
          </p>
        )}
      </div>
      <div className="flex w-full items-center justify-between gap-2">
        <MBStatus status={mbStatus} />
        <EntryActionsMenu entry={entry} />
      </div>
    </MBCard>
  );
}
