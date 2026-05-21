import { z } from "zod";

export const entryStatusSchema = z.enum(["to_read", "reading", "read"]);
export type EntryStatusInput = z.infer<typeof entryStatusSchema>;

export const addToLibrarySchema = z.object({
  googleVolumeId: z.string().min(1),
  title: z.string().min(1).max(500),
  authors: z.array(z.string()).default([]),
  thumbnailUrl: z.string().url().nullable().optional(),
  status: entryStatusSchema.optional(),
  totalPages: z.number().int().min(1).nullable().optional(),
  genre: z
    .string()
    .max(200)
    .nullable()
    .optional()
    .transform((s) => (typeof s === "string" ? s.trim().slice(0, 200) || null : (s ?? null))),
  synopsis: z
    .string()
    .nullable()
    .optional()
    .transform((s) => (typeof s === "string" ? s.slice(0, 5000) : (s ?? null))), // silent truncate at 5000 chars
});
// AddToLibraryInput uses z.input<> so callers can omit synopsis (optional before transform)
export type AddToLibraryInput = z.input<typeof addToLibrarySchema>;

export const updateEntryStatusSchema = z.object({
  id: z.string().uuid(),
  status: entryStatusSchema,
});
export type UpdateEntryStatusInput = z.infer<typeof updateEntryStatusSchema>;

export const deleteEntrySchema = z.object({
  id: z.string().uuid(),
});
export type DeleteEntryInput = z.infer<typeof deleteEntrySchema>;

export const updateEntryRatingSchema = z.object({
  id: z.string().uuid(),
  rating: z.number().int().min(1).max(5).nullable(),
});
export type UpdateEntryRatingInput = z.infer<typeof updateEntryRatingSchema>;

export const updateProgressSchema = z
  .object({
    id: z.string().uuid(),
    currentPage: z.number().int().min(0),
    totalPages: z.number().int().min(1).nullable().optional(),
  })
  .refine((data) => data.totalPages == null || data.currentPage <= data.totalPages, {
    message: "La página actual no puede superar el total de páginas",
    path: ["currentPage"],
  });
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
