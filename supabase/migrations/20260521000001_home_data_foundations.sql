-- =====================================================================
-- home-data-foundations — schema rails for the Home redesign
-- Additions:
--   * library_entries.rating       (smallint, nullable, CHECK 1..5)
--   * library_entries.genre        (text, nullable)
--   * library_entries.last_progress_at (timestamptz, nullable) + index
--   * user_profiles                (table + RLS + reused updated_at trigger)
-- All additions are nullable or have defaults — no backfill, no data loss
-- path. Rollback: drop the columns and the table.
-- =====================================================================

-- 1. Rating column on library_entries.
--    smallint = int2 — rating is 1..5 so 16 bits is plenty.
--    CHECK accepts NULL (unrated) OR 1..5; matches Zod validation.
alter table public.library_entries
  add column rating smallint
    constraint library_entries_rating_bounds
    check (rating is null or (rating >= 1 and rating <= 5));

-- 2. Genre column.
--    No DB-level length cap — Zod enforces .max(200).trim() at the app layer.
--    No index — full-text search over genre is out of scope.
alter table public.library_entries
  add column genre text;

-- 3. last_progress_at column.
--    Set ONLY by the updateProgress action when status='reading' AND page
--    actually changed. The set_updated_at trigger does NOT touch this column.
alter table public.library_entries
  add column last_progress_at timestamptz;

-- 4. Index for streak query: per-user scan ordered by recency.
--    Covers `where user_id = $1 and last_progress_at is not null order by last_progress_at desc`.
create index library_entries_user_last_progress_idx
  on public.library_entries (user_id, last_progress_at desc);

-- 5. user_profiles table.
--    PK is the FK to auth.users — one profile per user, cascade on user delete.
--    year_goal default 52 = one book per week; editable in a later SDD.
create table public.user_profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  year_goal    smallint not null default 52,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 6. Reuse existing set_updated_at() function (defined in 20260516180000).
create trigger user_profiles_set_updated_at
  before update on public.user_profiles
  for each row execute function public.set_updated_at();

-- 7. RLS on user_profiles. Mirror library_entries policy style.
alter table public.user_profiles enable row level security;

create policy user_profiles_select_own
  on public.user_profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy user_profiles_insert_own
  on public.user_profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy user_profiles_update_own
  on public.user_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
-- No DELETE policy: cascade from auth.users handles cleanup.
