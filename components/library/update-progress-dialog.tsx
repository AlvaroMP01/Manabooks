"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateEntryRating, updateEntryStatus, updateProgress } from "@/app/(app)/library/_actions";
import { MBBookCover } from "@/components/mb/book-cover";
import { MBButton } from "@/components/mb/button";
import { MBHeartRating } from "@/components/mb/heart-rating";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LibraryEntry } from "@/lib/library/types";

/** UpdateProgressDialog — three-phase dialog for updating reading progress, optionally marking as read, and rating. */

type Phase = "editing" | "awaiting-complete" | "rating";

interface Props {
  entry: LibraryEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPhase?: Phase;
}

interface InnerProps extends Props {
  phase: Phase;
  setPhase: (phase: Phase) => void;
  rating: number;
  setRating: (rating: number) => void;
}

function parsePositiveInt(raw: string): number | null {
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function UpdateProgressDialogInner({
  entry,
  open,
  onOpenChange,
  phase,
  setPhase,
  rating,
  setRating,
}: InnerProps) {
  const [currentPageStr, setCurrentPageStr] = useState<string>(() =>
    String(entry.currentPage ?? 0)
  );
  const [totalPagesStr, setTotalPagesStr] = useState<string>(() =>
    entry.totalPages !== null ? String(entry.totalPages) : ""
  );
  const [isPending, startTransition] = useTransition();

  // Derived numeric values (always safe — never NaN, never negative).
  const totalPagesParsed = parsePositiveInt(totalPagesStr);
  const totalPages = totalPagesParsed !== null && totalPagesParsed >= 1 ? totalPagesParsed : null;

  const rawCurrentPage = parsePositiveInt(currentPageStr) ?? 0;
  const currentPage = totalPages !== null ? Math.min(rawCurrentPage, totalPages) : rawCurrentPage;

  const pctDisplay =
    totalPages !== null && totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : null;

  function handleSubmit() {
    startTransition(async () => {
      const result = await updateProgress({
        id: entry.id,
        currentPage,
        totalPages: totalPages ?? undefined,
      });
      if (!result.ok) {
        toast.error("No se pudo actualizar el progreso. Inténtalo de nuevo.");
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
        toast.error("No se pudo marcar como leído. Inténtalo de nuevo.");
        return;
      }
      toast.success("¡Marcado como leído! ♡");
      setPhase("rating"); // advance to rating phase — do NOT close yet
    });
  }

  function handleSaveRating() {
    if (rating < 1 || rating > 5) return; // guard, shouldn't happen due to disabled button
    startTransition(async () => {
      const result = await updateEntryRating({ id: entry.id, rating });
      if (!result.ok) {
        toast.error("No se pudo guardar la valoración.");
        return;
      }
      toast.success("¡Gracias por tu valoración! ✦");
      onOpenChange(false);
    });
  }

  function handleSkipRating() {
    onOpenChange(false);
  }

  function handleClose() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        {phase === "editing" && (
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
              {/* Total pages FIRST — establishes the range for current page + slider */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="progress-total-pages"
                  style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#3B1F47" }}
                >
                  Total de páginas
                </label>
                <input
                  id="progress-total-pages"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={totalPagesStr}
                  placeholder="ej. 320"
                  onChange={(e) => setTotalPagesStr(e.target.value)}
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

              {/* Current page input — string-backed so empty / partial input never produces NaN */}
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
                  inputMode="numeric"
                  min={0}
                  max={totalPages ?? undefined}
                  value={currentPageStr}
                  onChange={(e) => setCurrentPageStr(e.target.value)}
                  onBlur={() => setCurrentPageStr(String(currentPage))}
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

              {/* Slider — visual scrubbing once total is known */}
              {totalPages !== null && totalPages > 0 ? (
                <div className="flex flex-col gap-1">
                  <input
                    aria-label={`Desliza para ajustar la página actual (máximo ${totalPages})`}
                    type="range"
                    min={0}
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const val = Number.parseInt(e.target.value, 10);
                      if (Number.isFinite(val)) setCurrentPageStr(String(val));
                    }}
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
              ) : (
                <p
                  style={{
                    fontFamily: "var(--font-hand)",
                    fontSize: 14,
                    color: "#8B3FE0",
                    margin: 0,
                  }}
                >
                  Indica el total de páginas arriba para ver el slider ✦
                </p>
              )}
            </div>

            <DialogFooter>
              <MBButton
                type="button"
                color="white"
                size="sm"
                onClick={handleClose}
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
        )}

        {phase === "awaiting-complete" && (
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
                Llegaste al final de &ldquo;{entry.title}&rdquo;. ¿Quieres marcarlo como leído?
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <MBButton
                type="button"
                color="white"
                size="sm"
                onClick={handleClose}
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

        {phase === "rating" && (
          <>
            <DialogHeader>
              <DialogTitle
                style={{ fontFamily: "var(--font-sticker)", fontSize: 16, color: "#3B1F47" }}
              >
                ¿Cómo te pareció?
              </DialogTitle>
              <DialogDescription
                style={{ fontFamily: "var(--font-hand)", fontSize: 14, color: "#8B3FE0" }}
              >
                Dejale una valoración a &ldquo;{entry.title}&rdquo; ♡
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-center py-2">
              <MBHeartRating value={rating} onChange={setRating} max={5} size={32} />
            </div>

            <DialogFooter>
              <MBButton
                type="button"
                color="white"
                size="sm"
                onClick={handleSkipRating}
                disabled={isPending}
              >
                Ahora no
              </MBButton>
              <MBButton
                type="button"
                color="pink"
                size="sm"
                onClick={handleSaveRating}
                disabled={isPending || rating < 1}
              >
                {isPending ? "Guardando…" : "Guardar"}
              </MBButton>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function UpdateProgressDialog(props: Props) {
  // `phase` and `rating` live in the OUTER so they survive inner remounts. The inner
  // remounts when entry.currentPage / entry.totalPages change (via revalidatePath after
  // updateProgress). If these lived inside the inner, that mid-flow remount would reset
  // them back to defaults, killing the "Marcar como leído?" and "rating" phases.
  // This is the same outer-phase ownership pattern from commit 00d3905 (PR #18).
  const initialPhase = props.initialPhase ?? "editing";
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [rating, setRating] = useState<number>(0); // 0 = no rating chosen yet

  // Reset to initialPhase (and clear rating) when the dialog signals close — covers Cancel,
  // click-outside, Esc, and post-confirm close.
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setPhase(initialPhase);
      setRating(0);
    }
    props.onOpenChange(next);
  };

  // Remount the inner only when the underlying data changes — NOT on every open toggle.
  // This avoids the setState-in-effect lint rule and keeps base-ui's Dialog close animation intact.
  const remountKey = `${props.entry.id}-${props.entry.currentPage}-${props.entry.totalPages ?? "null"}`;
  return (
    <UpdateProgressDialogInner
      key={remountKey}
      {...props}
      onOpenChange={handleOpenChange}
      phase={phase}
      setPhase={setPhase}
      rating={rating}
      setRating={setRating}
    />
  );
}
