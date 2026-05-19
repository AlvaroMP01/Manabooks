import { z } from "zod";

export const entryStatusSchema = z.enum(["to_read", "reading", "read"]);
export type EntryStatusInput = z.infer<typeof entryStatusSchema>;

export const addToLibrarySchema = z.object({
  googleVolumeId: z.string().min(1),
  title: z.string().min(1).max(500),
  authors: z.array(z.string()).default([]),
  thumbnailUrl: z.string().url().nullable().optional(),
  status: entryStatusSchema.optional(),
});
export type AddToLibraryInput = z.infer<typeof addToLibrarySchema>;

export const updateEntryStatusSchema = z.object({
  id: z.string().uuid(),
  status: entryStatusSchema,
});
export type UpdateEntryStatusInput = z.infer<typeof updateEntryStatusSchema>;

export const deleteEntrySchema = z.object({
  id: z.string().uuid(),
});
export type DeleteEntryInput = z.infer<typeof deleteEntrySchema>;
