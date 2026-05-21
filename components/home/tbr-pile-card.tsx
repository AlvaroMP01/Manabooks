import { MBBookCover } from "@/components/mb/book-cover";
import { MBCard } from "@/components/mb/card";
import { MBSticker } from "@/components/mb/sticker";
import type { LibraryEntry } from "@/lib/library/types";

interface TBRPileCardProps {
  entries: LibraryEntry[]; // 0..4
}

export function TBRPileCard({ entries }: TBRPileCardProps) {
  return (
    <MBCard color="#FFFCFE" radius={22} className="p-5 lg:p-6">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <h2
            style={{
              fontFamily: "var(--font-curly)",
              fontSize: 26,
              color: "#FF3D9A",
              margin: 0,
              WebkitTextStroke: "1.5px #3B1F47",
              paintOrder: "stroke fill",
            }}
          >
            tbr pile
          </h2>
          <MBSticker color="#FFD86B" fontSize={12} padding="4px 10px">
            {entries.length}
          </MBSticker>
        </div>

        {entries.length === 0 ? (
          <p
            style={{
              fontFamily: "var(--font-hand)",
              fontSize: 18,
              color: "#6E4A7A",
              margin: 0,
            }}
          >
            Tu pila está vacía ♡
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry, idx) => (
              <div key={entry.id} className="flex items-center gap-3">
                {/* Rank */}
                <span
                  style={{
                    fontFamily: "var(--font-curly)",
                    fontSize: 20,
                    color: "#3B1F47",
                    minWidth: "1.5rem",
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </span>

                {/* Cover — single render, fixed small size */}
                <MBBookCover
                  title={entry.title}
                  author={entry.authors[0] ?? ""}
                  thumbnail={entry.thumbnailUrl}
                  width={28}
                  height={42}
                />

                {/* Title + author */}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#3B1F47",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {entry.title}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-hand)",
                      fontSize: 12,
                      color: "#6E4A7A",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {entry.authors[0] ?? ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MBCard>
  );
}
