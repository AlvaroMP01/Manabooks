"use client";

import { useProgressDialog } from "@/components/library/progress-dialog-provider";
import { MBCard } from "@/components/mb/card";
import type { LibraryEntry } from "@/lib/library/types";

interface EntryNoteProps {
  entry: LibraryEntry;
}

/** EntryNote — detail-page card showing the quick note, with an edit/add affordance. */
export function EntryNote({ entry }: EntryNoteProps) {
  const { openNoteDialog } = useProgressDialog();
  const hasNote = entry.quickNote !== null;

  return (
    <MBCard
      color="#FFF5C2"
      radius={14}
      className="flex flex-col gap-3 p-5"
      style={{ transform: "rotate(-1deg)", boxShadow: "3px 4px 0 #3B1F47" }}
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          style={{
            fontFamily: "var(--font-sticker)",
            fontSize: 14,
            color: "#3B1F47",
            letterSpacing: "1.5px",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          Tu nota
        </h2>
        <button
          type="button"
          onClick={() => openNoteDialog(entry)}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 12,
            fontWeight: 700,
            color: "#6E4A7A",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          {hasNote ? "✎ Editar nota" : "✎ Añadir nota"}
        </button>
      </div>

      {hasNote ? (
        <p
          style={{
            fontFamily: "var(--font-hand)",
            fontSize: 18,
            color: "#3B1F47",
            margin: 0,
            whiteSpace: "pre-wrap",
            lineHeight: 1.4,
          }}
        >
          {entry.quickNote}
        </p>
      ) : (
        <p
          style={{
            fontFamily: "var(--font-hand)",
            fontSize: 16,
            color: "#6E4A7A",
            margin: 0,
            fontStyle: "italic",
          }}
        >
          Aún no escribiste nada aquí ✦
        </p>
      )}
    </MBCard>
  );
}
