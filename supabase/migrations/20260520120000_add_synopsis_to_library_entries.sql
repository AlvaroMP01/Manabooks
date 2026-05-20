-- =====================================================================
-- book-synopsis — capture the Google Books description on add-to-library
-- Adds: synopsis (TEXT, nullable, no default, no index, no CHECK).
-- Why no defaults / index / CHECK:
--   * nullable + no default keeps "absent" distinct from "empty".
--   * No CHECK because Zod transform (truncate at 5000) normalizes at the
--     application layer; a DB constraint would either duplicate or conflict.
--   * No index because full-text search over synopsis is out of scope;
--     Postgres TOAST handles large text storage out-of-line automatically.
-- =====================================================================

alter table public.library_entries
  add column synopsis text null;
