"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateEntryNote } from "@/app/(app)/library/_actions";
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

interface Props {
  entry: LibraryEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_NOTE_LENGTH = 500;

export function NoteDialog({ entry, open, onOpenChange }: Props) {
  const [noteText, setNoteText] = useState(entry.quickNote ?? "");
  const [isPending, startTransition] = useTransition();

  const trimmedCurrent = (entry.quickNote ?? "").trim();
  const trimmedNext = noteText.trim();
  const isUnchanged = trimmedNext === trimmedCurrent;
  const canRemove = entry.quickNote !== null;
  const isSaveDisabled = isPending || isUnchanged;

  function handleSave() {
    startTransition(async () => {
      const result = await updateEntryNote({ id: entry.id, note: noteText });
      if (!result.ok) {
        toast.error("No se pudo guardar la nota. Inténtalo de nuevo.");
        return;
      }
      toast.success("Nota guardada ✦");
      onOpenChange(false);
    });
  }

  function handleClear() {
    startTransition(async () => {
      const result = await updateEntryNote({ id: entry.id, note: null });
      if (!result.ok) {
        toast.error("No se pudo guardar la nota. Inténtalo de nuevo.");
        return;
      }
      toast.success("Nota eliminada.");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle
            style={{ fontFamily: "var(--font-sticker)", fontSize: 16, color: "#3B1F47" }}
          >
            Nota rápida
          </DialogTitle>
          <DialogDescription
            style={{ fontFamily: "var(--font-hand)", fontSize: 14, color: "#8B3FE0" }}
          >
            ¿Qué quieres recordar de «{entry.title}»?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`note-textarea-${entry.id}`} className="sr-only">
            Tu nota
          </label>
          <textarea
            id={`note-textarea-${entry.id}`}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            maxLength={MAX_NOTE_LENGTH}
            placeholder="Escribe aquí lo que quieras recordar…"
            autoFocus
            rows={5}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "#3B1F47",
              border: "2px solid #3B1F47",
              borderRadius: 12,
              padding: "10px 12px",
              boxShadow: "2px 2px 0 #3B1F47",
              outline: "none",
              background: "#FFFCFE",
              resize: "vertical",
              minHeight: 100,
              width: "100%",
            }}
          />
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              color: "#6E4A7A",
              textAlign: "right",
            }}
          >
            {noteText.length}/{MAX_NOTE_LENGTH}
          </div>
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
          {canRemove && (
            <MBButton
              type="button"
              color="white"
              size="sm"
              onClick={handleClear}
              disabled={isPending}
            >
              Quitar nota
            </MBButton>
          )}
          <MBButton
            type="button"
            color="pink"
            size="sm"
            onClick={handleSave}
            disabled={isSaveDisabled}
          >
            {isPending ? "Guardando…" : "Guardar"}
          </MBButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
