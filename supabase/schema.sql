-- Cheer Playbook Beta: database setup for Supabase.
-- Run this once in the Supabase dashboard: SQL Editor > New query > paste this file > Run.
-- It is safe to run again; it only creates what is missing and replaces the functions.

-- ---------- tables ----------
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- who belongs to which program: owner (manages coaches) or coach (edits routines)
create table if not exists public.members (
  program_id uuid not null references public.programs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  role text not null default 'coach' check (role in ('owner','coach')),
  created_at timestamptz not null default now(),
  primary key (program_id, user_id)
);

-- coaches invited by email; they join the program the first time they sign in with that email
create table if not exists public.invites (
  program_id uuid not null references public.programs(id) on delete cascade,
  email text not null check (email = lower(email)),
  role text not null default 'coach' check (role in ('owner','coach')),
  invited_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (program_id, email)
);

-- the playbook itself: one row per document (pb/meta, routines/<id>, versions/<id>, templates/<id>, teams/<id>)
-- body is { at, data } exactly as the app writes it. Deletes are soft so every device hears about them.
create sequence if not exists public.docs_rev;
create table if not exists public.docs (
  program_id uuid not null references public.programs(id) on delete cascade,
  coll text not null check (coll in ('pb','routines','versions','templates','teams')),
  id text not null check (id ~ '^[A-Za-z0-9_-]{1,40}$'),
  body jsonb,
  deleted boolean not null default false,
  rev bigint not null default nextval('public.docs_rev'),
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid(),
  primary key (program_id, coll, id),
  constraint docs_body_size check (body is null or pg_column_size(body) < 600000)
);
create index if not exists docs_program_rev on public.docs (program_id, rev);

-- team links for the athlete live view: anyone holding the token can read that team's routines, nothing else
create table if not exists public.team_links (
  token text primary key check (token ~ '^[A-Za-z0-9_-]{12,64}$'),
  program_id uuid not null references public.programs(id) on delete cascade,
  team_id text not null,
  enabled boolean not null default true,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists team_links_team on public.team_links (program_id, team_id);

-- every write gets a new revision number, so devices can ask for "everything newer than what I have"
create or replace function public.docs_touch() returns trigger language plpgsql as $$
begin
  new.rev := nextval('public.docs_rev');
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;
drop trigger if exists docs_touch on public.docs;
create trigger docs_touch before insert or update on public.docs for each row execute function public.docs_touch();

-- ---------- membership checks ----------
create or replace function public.is_member(p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members m where m.program_id = p and m.user_id = auth.uid())
$$;
create or replace function public.is_owner(p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members m where m.program_id = p and m.user_id = auth.uid() and m.role = 'owner')
$$;
-- storage paths are "<program id>/<file id>"; this reads the program id safely
create or replace function public.path_program(name text) returns uuid
language plpgsql immutable as $$
begin
  return split_part(name, '/', 1)::uuid;
exception when others then
  return null;
end $$;

-- ---------- row level security ----------
alter table public.programs enable row level security;
alter table public.members enable row level security;
alter table public.invites enable row level security;
alter table public.docs enable row level security;
alter table public.team_links enable row level security;

drop policy if exists programs_read on public.programs;
create policy programs_read on public.programs for select to authenticated using (public.is_member(id));
drop policy if exists programs_rename on public.programs;
create policy programs_rename on public.programs for update to authenticated using (public.is_owner(id)) with check (public.is_owner(id));

drop policy if exists members_read on public.members;
create policy members_read on public.members for select to authenticated using (public.is_member(program_id));
drop policy if exists members_remove on public.members;
-- owners remove coaches; anyone can leave; the last owner can't be removed (see trigger below)
create policy members_remove on public.members for delete to authenticated using (public.is_owner(program_id) or user_id = auth.uid());

drop policy if exists invites_read on public.invites;
create policy invites_read on public.invites for select to authenticated using (public.is_member(program_id));
drop policy if exists invites_write on public.invites;
create policy invites_write on public.invites for insert to authenticated with check (public.is_owner(program_id));
drop policy if exists invites_update on public.invites;
create policy invites_update on public.invites for update to authenticated using (public.is_owner(program_id)) with check (public.is_owner(program_id));
drop policy if exists invites_delete on public.invites;
create policy invites_delete on public.invites for delete to authenticated using (public.is_owner(program_id));

drop policy if exists docs_read on public.docs;
create policy docs_read on public.docs for select to authenticated using (public.is_member(program_id));
drop policy if exists docs_insert on public.docs;
create policy docs_insert on public.docs for insert to authenticated with check (public.is_member(program_id));
drop policy if exists docs_update on public.docs;
create policy docs_update on public.docs for update to authenticated using (public.is_member(program_id)) with check (public.is_member(program_id));
-- no delete policy: documents are soft-deleted

drop policy if exists links_read on public.team_links;
create policy links_read on public.team_links for select to authenticated using (public.is_member(program_id));
drop policy if exists links_insert on public.team_links;
create policy links_insert on public.team_links for insert to authenticated with check (public.is_member(program_id));
drop policy if exists links_update on public.team_links;
create policy links_update on public.team_links for update to authenticated using (public.is_member(program_id)) with check (public.is_member(program_id));

-- keep at least one owner in every program
create or replace function public.keep_owner() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.role = 'owner' and not exists (select 1 from public.members where program_id = old.program_id and role = 'owner' and user_id <> old.user_id)
     and exists (select 1 from public.programs where id = old.program_id) then
    raise exception 'A program needs at least one owner';
  end if;
  return old;
end $$;
drop trigger if exists keep_owner on public.members;
create trigger keep_owner before delete on public.members for each row execute function public.keep_owner();

-- ---------- functions the app calls ----------
create or replace function public.create_program(p_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  insert into public.programs (name, created_by) values (left(trim(p_name), 80), auth.uid()) returning id into pid;
  insert into public.members (program_id, user_id, email, role) values (pid, auth.uid(), lower(auth.jwt() ->> 'email'), 'owner');
  return pid;
end $$;

create or replace function public.accept_invites() returns integer
language plpgsql security definer set search_path = public as $$
declare n integer := 0; em text := lower(auth.jwt() ->> 'email');
begin
  if auth.uid() is null or em is null then return 0; end if;
  insert into public.members (program_id, user_id, email, role)
    select i.program_id, auth.uid(), em, i.role from public.invites i where i.email = em
    on conflict (program_id, user_id) do nothing;
  get diagnostics n = row_count;
  delete from public.invites where email = em;
  return n;
end $$;

create or replace function public.my_programs() returns table (id uuid, name text, role text)
language sql stable security definer set search_path = public as $$
  select p.id, p.name, m.role from public.members m join public.programs p on p.id = m.program_id
  where m.user_id = auth.uid() order by p.created_at
$$;

-- cheap check the athlete view polls every few seconds: changes whenever the team's routines change
create or replace function public.athlete_stamp(p_token text) returns bigint
language sql stable security definer set search_path = public as $$
  select coalesce(max(d.rev), 0) from public.docs d join public.team_links l on l.program_id = d.program_id
  where l.token = p_token and l.enabled and d.coll in ('routines', 'teams', 'pb')
$$;

-- athlete live view: the team's current routines, cut down to what an athlete needs (no scoresheet, versions, skills or coach notes about athletes)
create or replace function public.athlete_feed(p_token text) returns jsonb
language sql stable security definer set search_path = public as $$
  with l as (select program_id, team_id from public.team_links where token = p_token and enabled),
  meta as (select d.body -> 'data' as m from public.docs d join l on d.program_id = l.program_id where d.coll = 'pb' and d.id = 'meta' and not d.deleted),
  tm as (select d.body -> 'data' as t from public.docs d join l on d.program_id = l.program_id where d.coll = 'teams' and d.id = l.team_id and not d.deleted),
  rs as (
    select d.body -> 'data' as r from public.docs d join l on d.program_id = l.program_id
    where d.coll = 'routines' and not d.deleted
      and d.body -> 'data' ->> 'teamId' = l.team_id
      and (d.body -> 'data' ->> 'deletedAt') is null
      and coalesce(d.body -> 'data' ->> 'archived', 'false') <> 'true'
  )
  select case when not exists (select 1 from l) then null else jsonb_build_object(
    'program', (select program_id from l),
    'programName', coalesce((select m -> 'profile' ->> 'program' from meta), (select p.name from public.programs p join l on p.id = l.program_id)),
    'logo', (select m -> 'profile' -> 'logo' ->> 'id' from meta),
    'team', (select jsonb_build_object('id', l.team_id, 'name', coalesce((select t ->> 'name' from tm), 'Team')) from l),
    'order', coalesce((select m -> 'order' from meta), '[]'::jsonb),
    'routines', coalesce((select jsonb_agg(jsonb_build_object(
        'id', r ->> 'id', 'name', r -> 'name', 'bpm', r -> 'bpm', 'musicStart', r -> 'musicStart', 'audio', r -> 'audio',
        'athletes', r -> 'athletes', 'groups', r -> 'groups', 'sections', r -> 'sections', 'teamId', r -> 'teamId', 'updated', r -> 'updated')) from rs), '[]'::jsonb),
    'stamp', public.athlete_stamp(p_token)::text
  ) end
$$;

revoke all on function public.create_program(text) from public, anon;
revoke all on function public.accept_invites() from public, anon;
revoke all on function public.my_programs() from public, anon;
grant execute on function public.create_program(text) to authenticated;
grant execute on function public.accept_invites() to authenticated;
grant execute on function public.my_programs() to authenticated;
grant execute on function public.athlete_feed(text) to anon, authenticated;
grant execute on function public.athlete_stamp(text) to anon, authenticated;

-- ---------- live updates ----------
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'docs') then
    alter publication supabase_realtime add table public.docs;
  end if;
end $$;

-- ---------- song and logo files ----------
-- files are stored as media/<program id>/<random 32-character id>. The bucket is public so the athlete view can play songs without signing in;
-- file names are random and never listed publicly. Only coaches in the program can upload, replace or delete.
insert into storage.buckets (id, name, public, file_size_limit)
  values ('media', 'media', true, 26214400)
  on conflict (id) do update set public = true;

drop policy if exists media_insert on storage.objects;
create policy media_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_member(public.path_program(name)));
drop policy if exists media_update on storage.objects;
create policy media_update on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_member(public.path_program(name)));
drop policy if exists media_delete on storage.objects;
create policy media_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_member(public.path_program(name)));
drop policy if exists media_list on storage.objects;
create policy media_list on storage.objects for select to authenticated
  using (bucket_id = 'media' and public.is_member(public.path_program(name)));
