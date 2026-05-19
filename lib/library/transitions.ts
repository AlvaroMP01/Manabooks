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
