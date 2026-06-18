create table if not exists public.sessions (
  session_id text primary key,
  project_name text not null,
  created_at timestamptz not null default now(),
  photo1_url text not null,
  photo2_url text not null,
  photo3_url text not null,
  strip_url text not null,
  gif_url text not null
);

alter table public.sessions enable row level security;

create policy "Public can read sessions"
  on public.sessions
  for select
  to anon
  using (true);

insert into storage.buckets (id, name, public)
values ('sessions', 'sessions', true)
on conflict (id) do update set public = excluded.public;
