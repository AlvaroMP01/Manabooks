"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { addToLibrary } from "@/app/(app)/library/_actions";
import { MBButton } from "@/components/mb/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import type { Book } from "@/lib/google-books/types";
import type { EntryStatusInput } from "@/lib/validation/library";

const STATUS_OPTIONS: { value: EntryStatusInput; label: string }[] = [
  { value: "to_read", label: "Por leer" },
  { value: "reading", label: "Leyendo" },
  { value: "read", label: "Leído" },
];

interface Props {
  book: Book;
}

export function AddToLibraryDialog({ book }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<EntryStatusInput>("to_read");
  const [isPending, startTransition] = useTransition();

  const author = book.authors[0] ?? "Autor desconocido";

  function handleSubmit() {
    startTransition(async () => {
      const result = await addToLibrary({
        googleVolumeId: book.volumeId,
        title: book.title,
        authors: book.authors,
        thumbnailUrl: book.thumbnail,
        status,
        totalPages: book.pageCount ?? null,
        synopsis: book.description, // already plain text via mapVolume(); truncated by Zod transform if oversized
      });

      if (result.ok) {
        setOpen(false);
        toast.success("¡Agregado a tu biblioteca! ✦");
      } else if (result.code === "already_added") {
        setOpen(false);
        toast.warning("Este libro ya está en tu biblioteca");
      } else {
        toast.error("No se pudo añadir el libro. Inténtalo de nuevo.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        aria-label={`Agregar "${book.title}" a tu biblioteca`}
        style={{
          padding: "5px 14px",
          background: "var(--color-mb-pink-soft)",
          color: "#3B1F47",
          border: "2px solid #3B1F47",
          borderRadius: 999,
          boxShadow: "2px 3px 0 #3B1F47",
          fontFamily: "var(--font-sticker)",
          fontSize: 13,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Agregar ✦
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle
            style={{ fontFamily: "var(--font-sticker)", fontSize: 18, color: "#3B1F47" }}
          >
            Agregar a tu biblioteca
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <p
              className="line-clamp-2"
              style={{ fontFamily: "var(--font-sticker)", fontSize: 15, color: "#3B1F47" }}
            >
              {book.title}
            </p>
            <p
              className="mt-1 line-clamp-1"
              style={{ fontFamily: "var(--font-hand)", fontSize: 14, color: "#8B3FE0" }}
            >
              {author}
            </p>
            {book.description && (
              <p
                className="mt-3 max-h-48 overflow-y-auto text-left"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  color: "#3B1F47",
                  lineHeight: 1.5,
                }}
              >
                {book.description}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="add-dialog-status"
              style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#3B1F47" }}
            >
              Estado inicial
            </label>
            <Select value={status} onValueChange={(val) => setStatus(val as EntryStatusInput)}>
              <SelectTrigger id="add-dialog-status" className="w-full">
                <span>{STATUS_OPTIONS.find((opt) => opt.value === status)?.label}</span>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <MBButton
              type="button"
              color="white"
              size="sm"
              onClick={() => setOpen(false)}
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
              {isPending ? "Agregando…" : "Agregar ✦"}
            </MBButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
