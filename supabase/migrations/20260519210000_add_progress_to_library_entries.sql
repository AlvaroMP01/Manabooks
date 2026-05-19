-- =====================================================================
-- reading-progress — extend library_entries with per-entry progress
-- Adds: current_page (NOT NULL DEFAULT 0), total_pages (NULL),
-- and a defensive CHECK constraint enforcing bounds.
-- =====================================================================

-- 1. Two new columns.
alter table public.library_entries
  add column current_page integer not null default 0,
  add column total_pages  integer null;

-- 2. Defensive bounds constraint.
--    Server-side Zod validation also enforces these, but DB-level CHECK
--    is the last line of defense against a forged client payload or a
--    future migration that bypasses validation.
alter table public.library_entries
  add constraint library_entries_progress_bounds
  check (
    current_page >= 0
    and (total_pages is null or current_page <= total_pages)
  );

-- 3. No new index.
--    Progress is per-entry lookup (filtered by id PK or by (user_id, status)
--    composite from PR3a). No aggregation query (e.g. SUM(current_page))
--    is in scope — profile stats deferred. Adding an index now would
--    be premature.
