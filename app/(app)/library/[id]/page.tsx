import { notFound } from "next/navigation";

import { DetailBreadcrumb } from "@/components/library/detail-breadcrumb";
import { EntryDetailActions } from "@/components/library/entry-detail-actions";
import { EntryNote } from "@/components/library/entry-note";
import { EntryProgressCard } from "@/components/library/entry-progress-card";
import { EntryRatingEditor } from "@/components/library/entry-rating-editor";
import { EntrySynopsis } from "@/components/library/entry-synopsis";
import { MBBookCover } from "@/components/mb/book-cover";
import { MBSparkle } from "@/components/mb/sparkle";
import { MBStatus } from "@/components/mb/status";
import { MBSticker } from "@/components/mb/sticker";
import { rowToEntry } from "@/lib/library/types";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ id: string }>;

export default async function LibraryEntryDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("library_entries")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) notFound();

  const entry = rowToEntry(data);

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb row */}
      <DetailBreadcrumb status={entry.status} title={entry.title} />

      {/* 2-column grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[300px_1fr]">
        {/* LEFT: cover + actions */}
        <div className="flex flex-col items-center gap-6 md:items-stretch">
          {/* Desktop cover with sparkle */}
          <div className="relative hidden md:block">
            <MBBookCover
              title={entry.title}
              author={entry.authors[0] ?? ""}
              thumbnail={entry.thumbnailUrl}
              width={280}
              height={420}
              tilt={-3}
            />
            <MBSparkle
              size={36}
              color="var(--color-mb-pink-deep)"
              style={{ position: "absolute", bottom: -10, left: -16 }}
            />
          </div>
          {/* Mobile cover */}
          <MBBookCover
            title={entry.title}
            author={entry.authors[0] ?? ""}
            thumbnail={entry.thumbnailUrl}
            width={160}
            height={240}
            tilt={-3}
            className="md:hidden"
          />
          <EntryDetailActions entry={entry} />
        </div>

        {/* RIGHT: hero + meta + progress + synopsis + note */}
        <div className="flex min-w-0 flex-col gap-6">
          {/* Inline hero */}
          <div>
            {entry.genre && (
              <MBSticker color="var(--color-mb-pink)" fontSize={11} padding="4px 12px" rotate={-2}>
                {entry.genre.toUpperCase()}
              </MBSticker>
            )}
            <h1
              style={{
                fontFamily: "var(--font-curly)",
                fontSize: 64,
                color: "var(--color-mb-pink-deep)",
                margin: "14px 0 4px",
                lineHeight: 0.95,
                WebkitTextStroke: "2.5px #3B1F47",
                paintOrder: "stroke fill",
                filter: "drop-shadow(3px 4px 0 #3B1F47)",
              }}
            >
              {entry.title}
            </h1>
            <div style={{ fontFamily: "var(--font-hand)", fontSize: 28, color: "#8B3FE0" }}>
              de {entry.authors.length > 0 ? entry.authors.join(", ") : "autor desconocido"}
            </div>

            {/* Meta row */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <MBStatus status={entry.status} />
              <EntryRatingEditor entryId={entry.id} initialRating={entry.rating} />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  color: "#6E4A7A",
                  fontWeight: 600,
                }}
              >
                {entry.totalPages !== null ? `${entry.totalPages} págs.` : "sin paginación"}
              </span>
            </div>
          </div>

          <EntryProgressCard entry={entry} />
          <EntrySynopsis synopsis={entry.synopsis} />
          <EntryNote entry={entry} />
        </div>
      </div>
    </div>
  );
}
