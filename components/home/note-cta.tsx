"use client";

import { useProgressDialog } from "@/components/library/progress-dialog-provider";
import { MBButton } from "@/components/mb/button";
import type { LibraryEntry } from "@/lib/library/types";

interface NoteCTAProps {
  entry: LibraryEntry;
}

/** NoteCTA — opens the global NoteDialog for the given entry. */
export function NoteCTA({ entry }: NoteCTAProps) {
  const { openNoteDialog } = useProgressDialog();
  return (
    <MBButton size="sm" color="white" onClick={() => openNoteDialog(entry)}>
      ✎ Nota rápida
    </MBButton>
  );
}
