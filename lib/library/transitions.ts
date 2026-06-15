import type { EntryStatus } from "@/lib/library/types";

export type StatusChangeInput = {
  prevStatus: EntryStatus;
  nextStatus: EntryStatus;
  startedAt: string | null;
  finishedAt: string | null;
  currentPage: number;
  totalPages: number | null;
};

export type StatusChangeResult = {
  startedAt: string | null;
  finishedAt: string | null;
  currentPage: number;
};

/**
 * Compute auto-set started_at / finished_at / current_page on manual status changes.
 * Timestamps are set-on-first-transition only. When marking as "read" with a known
 * total_pages, current_page is bumped to total_pages so progress mirrors completion.
 */
export function computeStatusChange(input: StatusChangeInput): StatusChangeResult {
  const { nextStatus, currentPage, totalPages } = input;
  const now = new Date().toISOString();
  let { startedAt, finishedAt } = input;
  let nextCurrentPage = currentPage;

  if (nextStatus === "reading" && startedAt === null) startedAt = now;
  if (nextStatus === "read" && finishedAt === null) finishedAt = now;

  if (nextStatus === "read" && totalPages !== null && currentPage < totalPages) {
    nextCurrentPage = totalPages;
  }

  // read → paused | abandoned clears finishedAt to avoid "finished but paused" state.
  // Mirrors the existing rule 1b for read → reading in computeProgressTransition.
  if (input.prevStatus === "read" && (nextStatus === "paused" || nextStatus === "abandoned")) {
    finishedAt = null;
  }

  return { startedAt, finishedAt, currentPage: nextCurrentPage };
}

export type ProgressTransitionInput = {
  prevStatus: EntryStatus;
  currentPage: number;
  totalPages: number | null;
  currentStartedAt: string | null;
  currentFinishedAt: string | null;
};

export type ProgressTransitionResult = {
  autoStatus: EntryStatus | null;
  startedAt: string | null;
  finishedAt: string | null;
  promptComplete: boolean;
};

export type ProgressTimestampBumpInput = {
  prevStatus: EntryStatus;
  autoStatus: EntryStatus | null;
  currentPage: number;
  previousPage: number;
};

/**
 * Decide whether last_progress_at should bump on a progress update.
 *
 * Bump when the page changed AND the entry is being read now OR is
 * transitioning into reading; this counts the first reading day on a
 * freshly-added book, and still counts the day a book is finished
 * (reading → read).
 *
 * Re-engaging a non-reading book — paused/abandoned → reading (rule 1c) or
 * read → reading re-read (rule 1b) — counts toward the streak WHEN pages
 * are added (currentPage changes). Updating progress without a page change
 * does NOT count (no pages read = no streak credit).
 *
 * Pure function — no side effects.
 */
export function shouldBumpProgressTimestamp(input: ProgressTimestampBumpInput): boolean {
  const { prevStatus, autoStatus, currentPage, previousPage } = input;
  return currentPage !== previousPage && (prevStatus === "reading" || autoStatus === "reading");
}

/** Compute status auto-transitions and completion prompt flag driven by progress updates. Pure function — no side effects. */
export function computeProgressTransition(
  input: ProgressTransitionInput
): ProgressTransitionResult {
  const { prevStatus, currentPage, totalPages, currentStartedAt, currentFinishedAt } = input;
  const now = new Date().toISOString();

  let autoStatus: EntryStatus | null = null;
  let startedAt = currentStartedAt;
  let finishedAt = currentFinishedAt;
  let promptComplete = false;

  // Rule 1: auto-transition to_read → reading when progress moves forward.
  if (prevStatus === "to_read" && currentPage > 0) {
    autoStatus = "reading";
    startedAt = currentStartedAt ?? now;
  }

  // Rule 1c: paused/abandoned → reading on forward progress (re-engagement).
  // Preserves startedAt — do not reset on re-engagement. Does not set finishedAt.
  if ((prevStatus === "paused" || prevStatus === "abandoned") && currentPage > 0) {
    autoStatus = "reading";
  }

  // Rule 1b: auto-transition read → reading on backward progress (re-read scenario).
  // Preserves the original startedAt and clears finishedAt so the entry doesn't sit
  // in an inconsistent "reading but already finished" state.
  if (prevStatus === "read" && totalPages !== null && currentPage < totalPages) {
    autoStatus = "reading";
    finishedAt = null;
  }

  // Rule 2: flag completion prompt when currentPage reaches totalPages.
  // Server returns the flag; client decides whether to call updateEntryStatus.
  if (totalPages !== null && currentPage >= totalPages) {
    promptComplete = true;
  }

  // Rule 3 (non-goal): setting currentPage = 0 on a reading entry does NOT
  // revert status to to_read. Status is sticky once forward-transitioned from to_read.

  return { autoStatus, startedAt, finishedAt, promptComplete };
}
