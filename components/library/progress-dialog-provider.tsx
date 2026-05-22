"use client";

import { createContext, type ReactNode, useCallback, useContext, useState } from "react";

import { UpdateProgressDialog } from "@/components/library/update-progress-dialog";
import type { LibraryEntry } from "@/lib/library/types";

/**
 * Provider that hoists the UpdateProgressDialog to a stable level (the (app) layout)
 * so its lifecycle is independent of the entry-listing components that open it.
 *
 * Without this: when an action transitions a book from "reading" to "read", the
 * Server Action auto-refreshes the current route, the entry leaves the reading list,
 * the host component (CurrentlyReadingCard / ReadingRow / EntryDetailActions) unmounts,
 * and the dialog (and its in-flight rating phase) dies with it.
 *
 * With this: the Provider owns the dialog state. Hosts call `openDialog(entry, phase)`
 * via context. The dialog stays mounted at the layout level through any re-render of
 * its caller, so the rating phase has a chance to render and be interacted with.
 */

type DialogInitialPhase = "editing" | "awaiting-complete";

interface ProgressDialogContextValue {
  openDialog: (entry: LibraryEntry, initialPhase?: DialogInitialPhase) => void;
}

const ProgressDialogContext = createContext<ProgressDialogContextValue | null>(null);

export function useProgressDialog(): ProgressDialogContextValue {
  const ctx = useContext(ProgressDialogContext);
  if (!ctx) {
    throw new Error("useProgressDialog must be used inside <ProgressDialogProvider>");
  }
  return ctx;
}

export function ProgressDialogProvider({ children }: { children: ReactNode }) {
  const [entry, setEntry] = useState<LibraryEntry | null>(null);
  const [initialPhase, setInitialPhase] = useState<DialogInitialPhase>("editing");
  // Session counter bumps on every openDialog call. Used as `key` on the dialog so
  // each open remounts the component, letting useState(initialPhase) pick up the
  // current initialPhase without needing a useEffect sync.
  const [session, setSession] = useState(0);

  const openDialog = useCallback(
    (next: LibraryEntry, phase: DialogInitialPhase = "editing") => {
      setEntry(next);
      setInitialPhase(phase);
      setSession((s) => s + 1);
    },
    [],
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) setEntry(null);
  };

  return (
    <ProgressDialogContext.Provider value={{ openDialog }}>
      {children}
      {entry !== null && (
        <UpdateProgressDialog
          key={session}
          entry={entry}
          open={entry !== null}
          onOpenChange={handleOpenChange}
          initialPhase={initialPhase}
        />
      )}
    </ProgressDialogContext.Provider>
  );
}
