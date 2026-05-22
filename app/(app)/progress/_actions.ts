"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/library/action-result";
import { createClient } from "@/lib/supabase/server";
import { type UpdateYearGoalInput, updateYearGoalSchema } from "@/lib/validation/profile";

export async function updateYearGoal(input: UpdateYearGoalInput): Promise<ActionResult> {
  const parsed = updateYearGoalSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "invalid_input" };

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) return { ok: false, code: "unauthorized" };

  const userId = claimsData.claims.sub as string;
  const { error } = await supabase
    .from("user_profiles")
    .update({ year_goal: parsed.data.yearGoal })
    .eq("user_id", userId);

  if (error) return { ok: false, code: "unknown", message: error.message };

  revalidatePath("/");
  revalidatePath("/progress");
  return { ok: true, data: undefined };
}
