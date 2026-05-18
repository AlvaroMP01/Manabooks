-- 1. Enum
create type public.entry_status as enum ('to_read', 'reading', 'read');

-- 2. updated_at trigger function (idempotent if re-run via reset)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3. Table
create table public.library_entries (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  google_volume_id  text not null,
  title             text not null,
  authors           text[] not null default '{}',
  thumbnail_url     text,
  status            public.entry_status not null default 'to_read',
  started_at        timestamptz,
  finished_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint library_entries_user_volume_unique unique (user_id, google_volume_id)
);

-- 4. Index for list view query (user + status filter + date sort)
create index library_entries_user_status_created_idx
  on public.library_entries (user_id, status, created_at desc);

-- 5. Trigger
create trigger library_entries_set_updated_at
  before update on public.library_entries
  for each row execute function public.set_updated_at();

-- 6. RLS
alter table public.library_entries enable row level security;

create policy library_entries_select_own
  on public.library_entries for select
  to authenticated
  using (auth.uid() = user_id);

create policy library_entries_insert_own
  on public.library_entries for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy library_entries_update_own
  on public.library_entries for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy library_entries_delete_own
  on public.library_entries for delete
  to authenticated
  using (auth.uid() = user_id);
