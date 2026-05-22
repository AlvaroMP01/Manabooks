"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateEntryRating } from "@/app/(app)/library/_actions";
import { MBCard } from "@/components/mb/card";
import { MBHeartRating } from "@/components/mb/heart-rating";

interface EntryRatingEditorProps {
  entryId: string;
  initialRating: number | null;
}

/** EntryRatingEditor — editable heart rating, available regardless of entry status. */
export function EntryRatingEditor({ entryId, initialRating }: EntryRatingEditorProps) {
  const [rating, setRating] = useState<number>(initialRating ?? 0);
  const [isPending, startTransition] = useTransition();

  function persist(next: number | null) {
    const previous = rating;
    setRating(next ?? 0);
    startTransition(async () => {
      const result = await updateEntryRating({ id: entryId, rating: next });
      if (!result.ok) {
        setRating(previous);
        toast.error("No se pudo guardar la valoración.");
        return;
      }
      toast.success(next === null ? "Valoración eliminada." : "Valoración actualizada ✦");
    });
  }

  function handleClear() {
    if (rating === 0) return;
    persist(null);
  }

  return (
    <MBCard color="#FFFCFE" className="flex flex-col gap-3 p-5">
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
          Tu valoración
        </h2>
        {rating > 0 && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isPending}
            aria-label="Quitar valoración"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 700,
              color: "#6E4A7A",
              background: "transparent",
              border: "none",
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.5 : 1,
              padding: 0,
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            Quitar
          </button>
        )}
      </div>
      <div role="img" aria-label={rating === 0 ? "Sin valoración" : `Valoración: ${rating} de 5`}>
        <MBHeartRating
          value={rating}
          max={5}
          size={32}
          onChange={(v) => {
            if (!isPending) persist(v);
          }}
        />
      </div>
    </MBCard>
  );
}
