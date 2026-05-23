-- Add quick_note column for the book-notes feature.
-- Single nullable text column with a server-side length guard mirroring the
-- Zod validation layer (`updateEntryNoteSchema` in lib/validation/library.ts).
alter table public.library_entries
  add column quick_note text null
  check (quick_note is null or char_length(quick_note) <= 500);
