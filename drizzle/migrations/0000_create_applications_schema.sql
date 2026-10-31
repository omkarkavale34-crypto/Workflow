create type public.app_role as enum ('admin', 'reviewer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can read their own roles"
on public.user_roles for select to authenticated
using (auth.uid() = user_id);

create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
grant all on public.app_settings to service_role;
grant select on public.app_settings to anon;
grant select on public.app_settings to authenticated;
alter table public.app_settings enable row level security;

create policy "Anyone can read settings"
on public.app_settings for select to anon, authenticated
using (true);

insert into public.app_settings (key, value) values ('recruitment_open', 'true'::jsonb);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  client_ref uuid not null unique,
  full_name text not null,
  email text not null,
  phone text not null,
  branch text not null,
  year text not null,
  primary_role text not null,
  secondary_role text,
  skills text not null,
  role_assessment text not null,
  project_title text,
  project_description text,
  portfolio_url text,
  github text,
  behance text,
  website text,
  linkedin text,
  why_join text not null,
  want_to_build text not null,
  problem_solving text not null,
  availability text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
grant all on public.applications to service_role;
grant select on public.applications to authenticated;
alter table public.applications enable row level security;

create policy "Admins can read applications"
on public.applications for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create table public.application_files (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  kind text not null,
  storage_path text not null,
  file_name text not null,
  content_type text not null,
  size_bytes integer not null,
  created_at timestamptz not null default now()
);
grant all on public.application_files to service_role;
grant select on public.application_files to authenticated;
alter table public.application_files enable row level security;

create policy "Admins can read application files"
on public.application_files for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create table public.application_status_history (
  id bigint generated always as identity primary key,
  application_id uuid not null references public.applications(id) on delete cascade,
  from_status text,
  to_status text not null,
  note text,
  changed_by uuid,
  created_at timestamptz not null default now()
);
grant all on public.application_status_history to service_role;
grant select on public.application_status_history to authenticated;
alter table public.application_status_history enable row level security;

create policy "Admins can read status history"
on public.application_status_history for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create table public.application_notes (
  id bigint generated always as identity primary key,
  application_id uuid not null references public.applications(id) on delete cascade,
  author_id uuid,
  body text not null,
  created_at timestamptz not null default now()
);
grant all on public.application_notes to service_role;
grant select, insert on public.application_notes to authenticated;
alter table public.application_notes enable row level security;

create policy "Admins can read notes"
on public.application_notes for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can add notes"
on public.application_notes for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create table public.email_events (
  id bigint generated always as identity primary key,
  application_id uuid references public.applications(id) on delete set null,
  kind text not null,
  recipient text not null,
  status text not null,
  provider_id text,
  error text,
  created_at timestamptz not null default now()
);
grant all on public.email_events to service_role;
grant select on public.email_events to authenticated;
alter table public.email_events enable row level security;

create policy "Admins can read email events"
on public.email_events for select to authenticated
using (public.has_role(auth.uid(), 'admin'));