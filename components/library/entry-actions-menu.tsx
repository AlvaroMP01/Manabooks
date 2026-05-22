"use client";

import { MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteEntry, updateEntryStatus } from "@/app/(app)/library/_actions";
import { UpdateProgressDialog } from "@/components/library/update-progress-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EntryStatus, LibraryEntry } from "@/lib/library/types";

interface Props {
  entry: LibraryEntry;
}

const STATUS_LABELS: Record<EntryStatus, string> = {
  to_read: "Marcar como por leer",
  reading: "Marcar como leyendo",
  read: "Marcar como leído",
  paused: "Marcar como pausado",
  abandoned: "Marcar como abandonado",
};

const RELEVANT_NEXT_STATUSES: Record<EntryStatus, EntryStatus[]> = {
  to_read: ["reading", "read", "abandoned"],
  reading: ["read", "paused", "abandoned"],
  read: ["reading", "paused", "abandoned"],
  paused: ["reading", "read", "abandoned"],
  abandoned: ["reading", "read"],
};

export function EntryActionsMenu({ entry }: Props) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(entry.status);
  const [isPending, startTransition] = useTransition();
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);

  function handleStatusChange(nextStatus: EntryStatus) {
    const prevStatus = optimisticStatus;
    startTransition(async () => {
      setOptimisticStatus(nextStatus);
      const result = await updateEntryStatus({ id: entry.id, status: nextStatus });
      if (!result.ok) {
        setOptimisticStatus(prevStatus);
        toast.error("No se pudo actualizar el estado. Intentá de nuevo.");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteEntry({ id: entry.id });
      if (!result.ok) {
        toast.error("No se pudo eliminar el libro. Intentá de nuevo.");
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Acciones del libro"
          disabled={isPending}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 999,
            border: "1.5px solid #3B1F47",
            background: "var(--color-mb-white)",
            cursor: "pointer",
            boxShadow: "1px 2px 0 #3B1F47",
          }}
        >
          <MoreHorizontalIcon size={14} />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {/* Detail link — first item for quick navigation */}
          <DropdownMenuItem>
            <Link href={`/library/${entry.id}`} className="w-full">
              Ver detalle
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* Progress item — visible for all statuses */}
          <DropdownMenuItem onClick={() => setProgressDialogOpen(true)}>
            Actualizar progreso
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {RELEVANT_NEXT_STATUSES[optimisticStatus].map((s) => (
            <DropdownMenuItem key={s} onClick={() => handleStatusChange(s)}>
              {STATUS_LABELS[s]}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            Eliminar de la biblioteca
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog mounted outside DropdownMenu so it survives menu close */}
      <UpdateProgressDialog
        entry={entry}
        open={progressDialogOpen}
        onOpenChange={setProgressDialogOpen}
      />
    </>
  );
}
