import type { EntryStatus } from "@/lib/library/types";

type Timestamps = { startedAt: string | null; finishedAt: string | null };

/** Compute auto-set started_at / finished_at on status transitions. Set-on-first-transition only. */
export function computeTimestamps(
  prevStatus: EntryStatus,
  nextStatus: EntryStatus,
  current: Timestamps
): Timestamps {
  const now = new Date().toISOString();
  let { startedAt, finishedAt } = current;
  if (nextStatus === "reading" && startedAt === null) startedAt = now;
  if (nextStatus === "read" && finishedAt === null) finishedAt = now;
  return { startedAt, finishedAt };
}

export type ProgressTransitionInput = {
  prevStatus: EntryStatus;
  currentPage: number;
  totalPages: number | null;
  currentStartedAt: string | null;
};

export type ProgressTransitionResult = {
  autoStatus: EntryStatus | null;
  startedAt: string | null;
  promptComplete: boolean;
};

/** Compute status auto-transitions and completion prompt flag driven by progress updates. Pure function — no side effects. */
export function computeProgressTransition(
  input: ProgressTransitionInput
): ProgressTransitionResult {
  const { prevStatus, currentPage, totalPages, currentStartedAt } = input;
  const now = new Date().toISOString();

  let autoStatus: EntryStatus | null = null;
  let startedAt = currentStartedAt;
  let promptComplete = false;

  // Rule 1: auto-transition to_read → reading when progress moves forward.
  if (prevStatus === "to_read" && currentPage > 0) {
    autoStatus = "reading";
    startedAt = currentStartedAt ?? now;
  }

  // Rule 2: flag completion prompt when currentPage reaches totalPages.
  // Server returns the flag; client decides whether to call updateEntryStatus.
  if (totalPages !== null && currentPage >= totalPages) {
    promptComplete = true;
  }

  // Rule 3 (non-goal): setting currentPage = 0 on a reading entry does NOT
  // revert status to to_read. Status is sticky once forward-transitioned.

  return { autoStatus, startedAt, promptComplete };
}
