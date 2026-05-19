"use client";

import { MoreHorizontalIcon } from "lucide-react";
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
          {/* Progress item — visible for all statuses, positioned first */}
          <DropdownMenuItem onClick={() => setProgressDialogOpen(true)}>
            Actualizar progreso
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {optimisticStatus !== "to_read" && (
            <DropdownMenuItem onClick={() => handleStatusChange("to_read")}>
              {STATUS_LABELS.to_read}
            </DropdownMenuItem>
          )}
          {optimisticStatus !== "reading" && (
            <DropdownMenuItem onClick={() => handleStatusChange("reading")}>
              {STATUS_LABELS.reading}
            </DropdownMenuItem>
          )}
          {optimisticStatus !== "read" && (
            <DropdownMenuItem onClick={() => handleStatusChange("read")}>
              {STATUS_LABELS.read}
            </DropdownMenuItem>
          )}
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
