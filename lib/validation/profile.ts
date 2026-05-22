import { z } from "zod";

export const updateYearGoalSchema = z.object({
  yearGoal: z.number().int().min(1).max(999),
});

export type UpdateYearGoalInput = z.infer<typeof updateYearGoalSchema>;
