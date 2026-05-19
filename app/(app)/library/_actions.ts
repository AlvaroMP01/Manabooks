"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/library/action-result";
import { computeProgressTransition, computeTimestamps } from "@/lib/library/transitions";
import type { EntryStatus } from "@/lib/library/types";
import { createClient } from "@/lib/supabase/server";
import {
  type AddToLibraryInput,
  addToLibrarySchema,
  type DeleteEntryInput,
  deleteEntrySchema,
  type UpdateEntryStatusInput,
  updateEntryStatusSchema,
  type UpdateProgressInput,
  updateProgressSchema,
} from "@/lib/validation/library";

export async function addToLibrary(
  input: AddToLibraryInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = addToLibrarySchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "invalid_input" };

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) return { ok: false, code: "unauthorized" };

  const userId = claimsData.claims.sub as string;
  const { data, error } = await supabase
    .from("library_entries")
    .insert({
      user_id: userId,
      google_volume_id: parsed.data.googleVolumeId,
      title: parsed.data.title,
      authors: parsed.data.authors,
      thumbnail_url: parsed.data.thumbnailUrl ?? null,
      status: parsed.data.status ?? "to_read",
      total_pages: parsed.data.totalPages ?? null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, code: "already_added" };
    return { ok: false, code: "unknown", message: error.message };
  }

  revalidatePath("/library");
  return { ok: true, data: { id: data.id } };
}

export async function updateEntryStatus(input: UpdateEntryStatusInput): Promise<ActionResult> {
  const parsed = updateEntryStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "invalid_input" };

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) return { ok: false, code: "unauthorized" };

  const { data: current, error: fetchError } = await supabase
    .from("library_entries")
    .select("status, started_at, finished_at")
    .eq("id", parsed.data.id)
    .single();

  if (fetchError || !current) return { ok: false, code: "not_found" };

  const { startedAt, finishedAt } = computeTimestamps(current.status, parsed.data.status, {
    startedAt: current.started_at,
    finishedAt: current.finished_at,
  });

  const { error } = await supabase
    .from("library_entries")
    .update({ status: parsed.data.status, started_at: startedAt, finished_at: finishedAt })
    .eq("id", parsed.data.id);

  if (error) return { ok: false, code: "unknown", message: error.message };
  revalidatePath("/library");
  return { ok: true, data: undefined };
}

export async function deleteEntry(input: DeleteEntryInput): Promise<ActionResult> {
  const parsed = deleteEntrySchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "invalid_input" };

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) return { ok: false, code: "unauthorized" };

  const { error } = await supabase.from("library_entries").delete().eq("id", parsed.data.id);
  if (error) return { ok: false, code: "unknown", message: error.message };
  revalidatePath("/library");
  return { ok: true, data: undefined };
}

export async function updateProgress(
  input: UpdateProgressInput
): Promise<ActionResult<{ promptComplete: boolean }>> {
  // 1. Validate input first — fail fast, no DB round-trip on bad input.
  const parsed = updateProgressSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "invalid_input" };

  // 2. Auth guard via getClaims() — never getSession().
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) return { ok: false, code: "unauthorized" };

  // 3. Fetch current row — RLS scopes to own rows, so forged id yields not_found.
  const { data: current, error: fetchError } = await supabase
    .from("library_entries")
    .select("status, current_page, total_pages, started_at")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (fetchError) return { ok: false, code: "unknown", message: fetchError.message };
  if (!current) return { ok: false, code: "not_found" };

  // 4. Resolve effective totalPages — client may pass new value OR rely on existing.
  const effectiveTotalPages =
    parsed.data.totalPages === undefined ? current.total_pages : parsed.data.totalPages;

  // 5. Compute transition (pure function — no side effects).
  const transition = computeProgressTransition({
    prevStatus: current.status as EntryStatus,
    currentPage: parsed.data.currentPage,
    totalPages: effectiveTotalPages,
    currentStartedAt: current.started_at,
  });

  // 6. Build a single UPDATE payload — only touch status/started_at when auto-transition fires.
  const update: Record<string, unknown> = {
    current_page: parsed.data.currentPage,
    total_pages: effectiveTotalPages,
  };
  if (transition.autoStatus !== null) {
    update.status = transition.autoStatus;
    update.started_at = transition.startedAt;
  }

  const { error: updateError } = await supabase
    .from("library_entries")
    .update(update)
    .eq("id", parsed.data.id);

  if (updateError) return { ok: false, code: "unknown", message: updateError.message };

  revalidatePath("/library");
  return { ok: true, data: { promptComplete: transition.promptComplete } };
}
