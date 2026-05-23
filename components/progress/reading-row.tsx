"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateProgress } from "@/app/(app)/library/_actions";
import { useProgressDialog } from "@/components/library/progress-dialog-provider";
import { MBBookCover } from "@/components/mb/book-cover";
import { MBButton } from "@/components/mb/button";
import { MBCard } from "@/components/mb/card";
import type { LibraryEntry } from "@/lib/library/types";

interface ReadingRowProps {
  entry: LibraryEntry;
}

/** ReadingRow — per-book inline progress updater. Delegates dialog to the global Provider. */
export function ReadingRow({ entry }: ReadingRowProps) {
  const [currentPageStr, setCurrentPageStr] = useState(String(entry.currentPage));
  const [isPending, startTransition] = useTransition();
  const { openDialog, openNoteDialog } = useProgressDialog();

  const currentPage = Math.max(0, Number.parseInt(currentPageStr, 10) || 0);
  const isSaveDisabled = isPending || currentPageStr === String(entry.currentPage);

  function handleSave() {
    startTransition(async () => {
      const result = await updateProgress({
        id: entry.id,
        currentPage,
      });

      if (!result.ok) {
        toast.error("No se pudo actualizar el progreso. Inténtalo de nuevo.");
        return;
      }

      toast.success("Progreso actualizado ✦");

      if (result.data.promptComplete) {
        // Hand off to the global dialog so the awaiting-complete + rating phases
        // survive the auto-route-refresh that follows any Server Action.
        openDialog(entry, "awaiting-complete");
      }
    });
  }

  function handleOpenFullDialog() {
    openDialog(entry, "editing");
  }

  return (
    <li>
      <MBCard color="#FFFCFE" radius={18} className="p-4 lg:p-5">
        <div className="flex gap-4">
          {/* Cover — two renders for responsive sizing */}
          <MBBookCover
            title={entry.title}
            author={entry.authors[0] ?? ""}
            thumbnail={entry.thumbnailUrl}
            width={60}
            height={90}
            tilt={-2}
            className="block flex-shrink-0 lg:hidden"
          />
          <MBBookCover
            title={entry.title}
            author={entry.authors[0] ?? ""}
            thumbnail={entry.thumbnailUrl}
            width={80}
            height={120}
            tilt={-2}
            className="hidden flex-shrink-0 lg:block"
          />

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {/* Title + author */}
            <div>
              <p
                style={{
                  fontFamily: "var(--font-sticker)",
                  fontSize: 16,
                  color: "#3B1F47",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {entry.title}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-hand)",
                  fontSize: 14,
                  color: "#6E4A7A",
                  margin: "2px 0 0",
                }}
              >
                {entry.authors[0] ?? ""}
              </p>
            </div>

            {/* Inline progress controls */}
            <div className="flex flex-col gap-2">
              {entry.totalPages !== null ? (
                <>
                  {/* Slider */}
                  <input
                    type="range"
                    min={0}
                    max={entry.totalPages}
                    step={1}
                    value={currentPage}
                    aria-label={`Página actual de ${entry.title}`}
                    aria-valuemin={0}
                    aria-valuemax={entry.totalPages}
                    aria-valuenow={currentPage}
                    onChange={(e) => {
                      const val = Number.parseInt(e.target.value, 10);
                      if (Number.isFinite(val)) setCurrentPageStr(String(val));
                    }}
                    style={{ width: "100%", accentColor: "#FF6FB5" }}
                  />

                  {/* Label */}
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 12,
                      color: "#6E4A7A",
                      margin: 0,
                    }}
                  >
                    pág. {currentPage} de {entry.totalPages}
                  </p>
                </>
              ) : (
                <p
                  style={{
                    fontFamily: "var(--font-hand)",
                    fontSize: 13,
                    color: "#8B3FE0",
                    margin: 0,
                  }}
                >
                  (sin total de páginas)
                </p>
              )}

              {/* Number input */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor={`page-input-${entry.id}`}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    color: "#3B1F47",
                    whiteSpace: "nowrap",
                  }}
                >
                  Página actual
                </label>
                <input
                  id={`page-input-${entry.id}`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={entry.totalPages ?? undefined}
                  value={currentPageStr}
                  onChange={(e) => setCurrentPageStr(e.target.value)}
                  onBlur={() => setCurrentPageStr(String(currentPage))}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    color: "#3B1F47",
                    border: "2px solid #3B1F47",
                    borderRadius: 8,
                    padding: "6px 10px",
                    width: 80,
                    boxShadow: "2px 2px 0 #3B1F47",
                    outline: "none",
                    background: "#FFFCFE",
                  }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <MBButton
                type="button"
                color="pink"
                size="sm"
                aria-label={`Guardar progreso de ${entry.title}`}
                aria-busy={isPending}
                onClick={handleSave}
                disabled={isSaveDisabled}
                style={{
                  opacity: isSaveDisabled ? 0.5 : 1,
                  cursor: isSaveDisabled ? "not-allowed" : "pointer",
                  ...(isSaveDisabled ? { boxShadow: "none" } : {}),
                }}
              >
                {isPending ? "Guardando…" : "Guardar"}
              </MBButton>

              <MBButton
                type="button"
                color="white"
                size="sm"
                aria-label={`Ver detalles de actualización para ${entry.title}`}
                onClick={handleOpenFullDialog}
              >
                Ver más ✦
              </MBButton>

              <MBButton
                type="button"
                color="white"
                size="sm"
                aria-label={`Editar nota de ${entry.title}`}
                onClick={() => openNoteDialog(entry)}
              >
                ✎ Nota
              </MBButton>
            </div>
          </div>
        </div>
      </MBCard>
    </li>
  );
}
