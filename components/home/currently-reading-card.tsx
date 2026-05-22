import Link from "next/link";

import { MBBookCover } from "@/components/mb/book-cover";
import { MBButton } from "@/components/mb/button";
import { MBCard } from "@/components/mb/card";
import { MBProgress } from "@/components/mb/progress";
import { MBStatus } from "@/components/mb/status";
import { MBSticker } from "@/components/mb/sticker";
import type { LibraryEntry } from "@/lib/library/types";

import { ProgressCTA } from "./progress-cta";

interface CurrentlyReadingCardProps {
  entries: LibraryEntry[]; // 0..2
}

export function CurrentlyReadingCard({ entries }: CurrentlyReadingCardProps) {
  const primary = entries[0];
  const secondary = entries[1];

  return (
    <MBCard color="#FFFCFE" radius={22} className="p-5 lg:p-6">
      <div className="flex flex-col gap-4">
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
          leyendo ahora
        </h2>

        {!primary ? (
          /* Empty state */
          <div className="flex flex-col items-start gap-3">
            <p
              style={{
                fontFamily: "var(--font-curly)",
                fontSize: 20,
                color: "#3B1F47",
                margin: 0,
              }}
            >
              No estás leyendo nada · ¿Empezamos algo?
            </p>
            <Link href="/library/search">
              <MBButton color="pink" size="sm">
                Buscar un libro ✦
              </MBButton>
            </Link>
          </div>
        ) : (
          <>
            {/* Primary book row */}
            <div className="flex gap-4">
              {/* Mobile cover */}
              <MBBookCover
                title={primary.title}
                author={primary.authors[0] ?? ""}
                thumbnail={primary.thumbnailUrl}
                width={100}
                height={148}
                tilt={-4}
                className="block lg:hidden"
              />
              {/* Desktop cover */}
              <MBBookCover
                title={primary.title}
                author={primary.authors[0] ?? ""}
                thumbnail={primary.thumbnailUrl}
                width={150}
                height={220}
                tilt={-4}
                className="hidden lg:block"
              />

              <div className="flex min-w-0 flex-1 flex-col gap-3">
                {/* Title */}
                <p
                  style={{
                    fontFamily: "var(--font-sticker)",
                    fontSize: "clamp(22px, 3vw, 28px)",
                    color: "#3B1F47",
                    margin: 0,
                    lineHeight: 1.15,
                  }}
                >
                  {primary.title}
                </p>

                {/* Author */}
                <p
                  style={{
                    fontFamily: "var(--font-hand)",
                    fontSize: 15,
                    color: "#6E4A7A",
                    margin: 0,
                  }}
                >
                  by {primary.authors[0] ?? ""}
                </p>

                {/* Chip row */}
                <div className="flex flex-wrap items-center gap-2">
                  <MBStatus status="reading" />
                  {primary.genre && (
                    <MBSticker color="#CDEDF6" fontSize={11} padding="4px 10px">
                      {primary.genre}
                    </MBSticker>
                  )}
                </div>

                {/* Progress */}
                {primary.totalPages !== null ? (
                  <div className="flex flex-col gap-2">
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: 13,
                        color: "#3B1F47",
                        margin: 0,
                      }}
                    >
                      pág. {primary.currentPage} de {primary.totalPages}
                      {" · "}
                      {Math.round((primary.currentPage / primary.totalPages) * 100)}%
                    </p>
                    <MBProgress value={primary.currentPage} max={primary.totalPages} />
                  </div>
                ) : (
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      color: "#6E4A7A",
                      margin: 0,
                    }}
                  >
                    Sin total de páginas
                  </p>
                )}

                {/* CTA row */}
                <div className="flex flex-wrap items-center gap-2">
                  <ProgressCTA entry={primary} />
                  <MBButton
                    size="sm"
                    color="white"
                    disabled
                    style={{ opacity: 0.5, cursor: "not-allowed" }}
                  >
                    ✎ Nota rápida
                  </MBButton>
                </div>
              </div>
            </div>

            {/* Mini second-book row */}
            {secondary && (
              <div
                style={{
                  borderTop: "1.5px dashed #FFD0E7",
                  paddingTop: 16,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                {/* Mobile mini cover */}
                <MBBookCover
                  title={secondary.title}
                  author={secondary.authors[0] ?? ""}
                  thumbnail={secondary.thumbnailUrl}
                  width={40}
                  height={60}
                  tilt={2}
                  className="block lg:hidden"
                />
                {/* Desktop mini cover */}
                <MBBookCover
                  title={secondary.title}
                  author={secondary.authors[0] ?? ""}
                  thumbnail={secondary.thumbnailUrl}
                  width={50}
                  height={75}
                  tilt={2}
                  className="hidden lg:block"
                />

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p
                    style={{
                      fontFamily: "var(--font-sticker)",
                      fontSize: 15,
                      color: "#3B1F47",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {secondary.title}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-hand)",
                      fontSize: 14,
                      color: "#6E4A7A",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {secondary.authors[0] ?? ""}
                  </p>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <MBProgress
                        height={9}
                        value={secondary.currentPage}
                        max={secondary.totalPages ?? 100}
                      />
                    </div>
                    {secondary.totalPages !== null && (
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: 11,
                          color: "#3B1F47",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {Math.round((secondary.currentPage / secondary.totalPages) * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MBCard>
  );
}
