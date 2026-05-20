"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteEntry, updateEntryStatus } from "@/app/(app)/library/_actions";
import { UpdateProgressDialog } from "@/components/library/update-progress-dialog";
import { MBButton } from "@/components/mb/button";
import type { EntryStatus, LibraryEntry } from "@/lib/library/types";

const STATUS_LABELS: Record<EntryStatus, string> = {
  to_read: "marcar como por leer",
  reading: "marcar como leyendo",
  read: "marcar como leído",
};

export function EntryDetailActions({ entry }: { entry: LibraryEntry }) {
  const router = useRouter();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(entry.status);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleStatusChange(next: EntryStatus) {
    const prev = optimisticStatus;
    startTransition(async () => {
      setOptimisticStatus(next);
      const result = await updateEntryStatus({ id: entry.id, status: next });
      if (!result.ok) {
        setOptimisticStatus(prev);
        toast.error("No se pudo actualizar el estado. Intentá de nuevo.");
      }
    });
  }

  function handleDelete() {
    if (!window.confirm("¿Eliminar este libro de tu biblioteca?")) return;
    startTransition(async () => {
      const result = await deleteEntry({ id: entry.id });
      if (!result.ok) {
        toast.error("No se pudo eliminar el libro.");
        return;
      }
      toast.success("Libro eliminado");
      router.replace("/library");
    });
  }

  const otherStatuses = (["to_read", "reading", "read"] as EntryStatus[]).filter(
    (s) => s !== optimisticStatus
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <MBButton color="pink" onClick={() => setDialogOpen(true)} disabled={isPending}>
        actualizar progreso
      </MBButton>
      {otherStatuses.map((s) => (
        <MBButton key={s} color="purple" onClick={() => handleStatusChange(s)} disabled={isPending}>
          {STATUS_LABELS[s]}
        </MBButton>
      ))}
      <MBButton color="white" onClick={handleDelete} disabled={isPending}>
        eliminar
      </MBButton>
      <UpdateProgressDialog entry={entry} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
