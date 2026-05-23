import Link from "next/link";

import { MBBookCover } from "@/components/mb/book-cover";
import { MBCard } from "@/components/mb/card";
import { MBHeart } from "@/components/mb/heart";
import type { LibraryEntry } from "@/lib/library/types";

interface RecentReadsCardProps {
  entries: LibraryEntry[]; // 0..5
}

const tilts = [-3, 2, -1, 3, -2] as const;

export function RecentReadsCard({ entries }: RecentReadsCardProps) {
  return (
    <MBCard color="#FFF1F8" radius={22} className="p-5 lg:p-6">
      <div className="flex flex-col gap-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
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
            tus últimas joyas
          </h2>
          <Link
            href="/library?status=read"
            style={{
              fontFamily: "var(--font-sticker)",
              fontSize: 12,
              fontWeight: 700,
              color: "#6E4A7A",
              textDecoration: "none",
              letterSpacing: 1,
            }}
          >
            VER TODO →
          </Link>
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
            Aquí van tus últimas joyas ✦
          </p>
        ) : (
          <div className="flex flex-row gap-3 overflow-x-auto pb-1">
            {entries.map((entry, i) => (
              <Link
                key={entry.id}
                href={`/library/${entry.id}`}
                aria-label={`Ver detalle de ${entry.title}`}
                className="focus-visible:ring-mb-pink-deep flex flex-col items-center gap-1 rounded-lg no-underline transition-opacity hover:opacity-80 focus-visible:ring-2"
                style={{ flexShrink: 0, color: "inherit" }}
              >
                {/* Mobile cover */}
                <MBBookCover
                  title={entry.title}
                  author={entry.authors[0] ?? ""}
                  thumbnail={entry.thumbnailUrl}
                  width={70}
                  height={105}
                  tilt={tilts[i] ?? 0}
                  className="block lg:hidden"
                />
                {/* Desktop cover */}
                <MBBookCover
                  title={entry.title}
                  author={entry.authors[0] ?? ""}
                  thumbnail={entry.thumbnailUrl}
                  width={92}
                  height={140}
                  tilt={tilts[i] ?? 0}
                  className="hidden lg:block"
                />

                {/* Title */}
                <p
                  style={{
                    fontFamily: "var(--font-sticker)",
                    fontSize: 11,
                    color: "#3B1F47",
                    margin: 0,
                    maxWidth: 80,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textAlign: "center",
                  }}
                >
                  {entry.title}
                </p>

                {/* Rating row */}
                <div
                  role="img"
                  aria-label={
                    entry.rating !== null ? `Valoración: ${entry.rating} de 5` : "Sin valoración"
                  }
                  style={{
                    display: "flex",
                    gap: 1,
                    justifyContent: "center",
                    marginTop: 4,
                  }}
                >
                  {Array.from({ length: 5 }).map((_, j) => (
                    <MBHeart
                      key={j}
                      size={11}
                      color={j < (entry.rating ?? 0) ? "#FF3D9A" : "#FFD0E7"}
                      outline="#3B1F47"
                    />
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MBCard>
  );
}
