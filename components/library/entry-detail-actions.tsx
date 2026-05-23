"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

import { deleteEntry, updateEntryStatus } from "@/app/(app)/library/_actions";
import { useProgressDialog } from "@/components/library/progress-dialog-provider";
import { MBButton } from "@/components/mb/button";
import type { EntryStatus, LibraryEntry } from "@/lib/library/types";

const STATUS_LABELS: Record<EntryStatus, string> = {
  to_read: "marcar como por leer",
  reading: "marcar como leyendo",
  read: "marcar como leído",
  paused: "marcar como pausado",
  abandoned: "marcar como abandonado",
};

const RELEVANT_NEXT_STATUSES: Record<EntryStatus, EntryStatus[]> = {
  to_read: ["reading", "read", "abandoned"],
  reading: ["read", "paused", "abandoned"],
  read: ["reading", "paused", "abandoned"],
  paused: ["reading", "read", "abandoned"],
  abandoned: ["reading", "read"],
};

export function EntryDetailActions({ entry }: { entry: LibraryEntry }) {
  const router = useRouter();
  const { openDialog } = useProgressDialog();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(entry.status);
  const [isPending, startTransition] = useTransition();

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

  const nextStatuses = RELEVANT_NEXT_STATUSES[optimisticStatus];

  return (
    <div className="flex w-full flex-col gap-3">
      <MBButton
        color="pink"
        className="w-full"
        onClick={() => openDialog(entry)}
        disabled={isPending}
      >
        actualizar progreso
      </MBButton>
      {nextStatuses.map((s) => (
        <MBButton
          key={s}
          color="purple"
          className="w-full"
          onClick={() => handleStatusChange(s)}
          disabled={isPending}
        >
          {STATUS_LABELS[s]}
        </MBButton>
      ))}
      <MBButton color="white" className="w-full" onClick={handleDelete} disabled={isPending}>
        eliminar
      </MBButton>
    </div>
  );
}
