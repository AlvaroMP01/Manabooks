"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { updateEntryStatus, updateProgress } from "@/app/(app)/library/_actions";
import { MBBookCover } from "@/components/mb/book-cover";
import { MBButton } from "@/components/mb/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LibraryEntry } from "@/lib/library/types";

/** UpdateProgressDialog — two-phase dialog for updating reading progress and optionally marking as read. */

type Phase = "editing" | "awaiting-complete";

interface Props {
  entry: LibraryEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateProgressDialog({ entry, open, onOpenChange }: Props) {
  const [currentPage, setCurrentPage] = useState<number>(entry.currentPage);
  const [totalPages, setTotalPages] = useState<number | null>(entry.totalPages);
  const [phase, setPhase] = useState<Phase>("editing");
  const [isPending, startTransition] = useTransition();

  // Re-sync local state when dialog opens on a fresh entry.
  useEffect(() => {
    if (open) {
      setCurrentPage(entry.currentPage);
      setTotalPages(entry.totalPages);
      setPhase("editing");
    }
  }, [open, entry.currentPage, entry.totalPages]);

  function handleSubmit() {
    startTransition(async () => {
      const result = await updateProgress({
        id: entry.id,
        currentPage,
        totalPages: totalPages ?? undefined,
      });
      if (!result.ok) {
        toast.error("No se pudo actualizar el progreso. Intentá de nuevo.");
        return;
      }
      toast.success("Progreso actualizado ✦");
      if (result.data.promptComplete) {
        setPhase("awaiting-complete");
      } else {
        onOpenChange(false);
      }
    });
  }

  function handleConfirmComplete() {
    startTransition(async () => {
      const result = await updateEntryStatus({ id: entry.id, status: "read" });
      if (!result.ok) {
        toast.error("No se pudo marcar como leído. Intentá de nuevo.");
        return;
      }
      toast.success("¡Marcado como leído! ♡");
      onOpenChange(false);
    });
  }

  function handleCancelComplete() {
    // Progress was already saved — just close without changing status.
    onOpenChange(false);
  }

  const sliderMax = totalPages ?? 0;
  const pctDisplay =
    totalPages !== null && totalPages > 0
      ? Math.round((currentPage / totalPages) * 100)
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        {phase === "editing" ? (
          <>
            <DialogHeader>
              <div className="flex items-start gap-3">
                <MBBookCover
                  title={entry.title}
                  author={entry.authors[0] ?? ""}
                  thumbnail={entry.thumbnailUrl}
                  width={64}
                  height={96}
                  tilt={-2}
                />
                <div className="flex flex-col gap-1">
                  <DialogTitle
                    style={{ fontFamily: "var(--font-sticker)", fontSize: 16, color: "#3B1F47" }}
                  >
                    Actualizar progreso
                  </DialogTitle>
                  <DialogDescription
                    style={{ fontFamily: "var(--font-hand)", fontSize: 13, color: "#8B3FE0" }}
                  >
                    {entry.title}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              {/* Numeric input for currentPage */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="progress-current-page"
                  style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#3B1F47" }}
                >
                  Página actual{pctDisplay !== null ? ` · ${pctDisplay}%` : ""}
                </label>
                <input
                  id="progress-current-page"
                  type="number"
                  min={0}
                  max={totalPages ?? undefined}
                  value={currentPage}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    setCurrentPage(totalPages !== null ? Math.min(val, totalPages) : val);
                  }}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 15,
                    color: "#3B1F47",
                    border: "2px solid #3B1F47",
                    borderRadius: 8,
                    padding: "8px 12px",
                    width: "100%",
                    boxShadow: "2px 2px 0 #3B1F47",
                    outline: "none",
                    background: "#FFFCFE",
                  }}
                />
              </div>

              {/* Slider — only when totalPages is known */}
              {totalPages !== null && (
                <div className="flex flex-col gap-1">
                  <input
                    aria-label={`Deslizá para ajustar la página actual (máximo ${totalPages})`}
                    type="range"
                    min={0}
                    max={sliderMax}
                    value={currentPage}
                    onChange={(e) => setCurrentPage(parseInt(e.target.value, 10))}
                    style={{ width: "100%", accentColor: "#FF6FB5" }}
                  />
                  <div
                    className="flex justify-between"
                    style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#6E4A7A" }}
                  >
                    <span>0</span>
                    <span>{totalPages}</span>
                  </div>
                </div>
              )}

              {/* Secondary input for totalPages when null */}
              {totalPages === null && (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="progress-total-pages"
                    style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#3B1F47" }}
                  >
                    ¿Cuántas páginas tiene?
                  </label>
                  <input
                    id="progress-total-pages"
                    type="number"
                    min={1}
                    placeholder="Opcional"
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setTotalPages(isNaN(val) || val < 1 ? null : val);
                    }}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 15,
                      color: "#3B1F47",
                      border: "2px solid #3B1F47",
                      borderRadius: 8,
                      padding: "8px 12px",
                      width: "100%",
                      boxShadow: "2px 2px 0 #3B1F47",
                      outline: "none",
                      background: "#FFFCFE",
                    }}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <MBButton
                type="button"
                color="white"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </MBButton>
              <MBButton
                type="button"
                color="pink"
                size="sm"
                onClick={handleSubmit}
                disabled={isPending}
              >
                {isPending ? "Guardando…" : "Guardar"}
              </MBButton>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle
                style={{ fontFamily: "var(--font-sticker)", fontSize: 16, color: "#3B1F47" }}
              >
                ¿Marcarlo como leído?
              </DialogTitle>
              <DialogDescription
                style={{ fontFamily: "var(--font-hand)", fontSize: 14, color: "#8B3FE0" }}
              >
                Llegaste al final de &ldquo;{entry.title}&rdquo;. ¿Querés marcarlo como leído?
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <MBButton
                type="button"
                color="white"
                size="sm"
                onClick={handleCancelComplete}
                disabled={isPending}
              >
                Ahora no
              </MBButton>
              <MBButton
                type="button"
                color="purple"
                size="sm"
                onClick={handleConfirmComplete}
                disabled={isPending}
              >
                {isPending ? "Guardando…" : "Marcar como leído ♡"}
              </MBButton>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
