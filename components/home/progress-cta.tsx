"use client";

import { useState } from "react";

import { UpdateProgressDialog } from "@/components/library/update-progress-dialog";
import { MBButton } from "@/components/mb/button";
import type { LibraryEntry } from "@/lib/library/types";

interface ProgressCTAProps {
  entry: LibraryEntry;
}

export function ProgressCTA({ entry }: ProgressCTAProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <MBButton size="sm" color="pink" onClick={() => setOpen(true)}>
        ＋ Actualizar progreso
      </MBButton>
      <UpdateProgressDialog entry={entry} open={open} onOpenChange={setOpen} />
    </>
  );
}
