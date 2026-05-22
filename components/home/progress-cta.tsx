"use client";

import { useProgressDialog } from "@/components/library/progress-dialog-provider";
import { MBButton } from "@/components/mb/button";
import type { LibraryEntry } from "@/lib/library/types";

interface ProgressCTAProps {
  entry: LibraryEntry;
}

/** ProgressCTA — opens the global UpdateProgressDialog for the given entry. */
export function ProgressCTA({ entry }: ProgressCTAProps) {
  const { openDialog } = useProgressDialog();
  return (
    <MBButton size="sm" color="pink" onClick={() => openDialog(entry)}>
      ＋ Actualizar progreso
    </MBButton>
  );
}
