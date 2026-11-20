create extension if not exists pgcrypto;

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null default '',
  label text not null,
  updated_at timestamptz not null default now()
);

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  eyebrow text not null default '',
  subtitle text not null default '',
  body text not null default '',
  image_url text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.nav_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  group_name text not null default 'primary',
  visible boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (group_name, href)
);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (name)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  summary text not null,
  image_url text not null default '',
  bullet_groups jsonb not null default '[]'::jsonb,
  details jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.industries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  icon_svg text not null default '',
  published boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (title)
);

create table public.benefits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  icon_svg text not null default '',
  published boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (title)
);

create table public.process_steps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (title)
);

create table public.case_studies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  industry text not null,
  description text not null default '',
  image_url text not null default '',
  metrics jsonb not null default '[]'::jsonb,
  challenge text not null default '',
  approach text not null default '',
  outcome text not null default '',
  published boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (title)
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  image_url text not null default '',
  linkedin_url text not null default '',
  published boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (name)
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author text not null,
  role text not null default '',
  company text not null default '',
  industry text not null default '',
  avatar_initials text not null default '',
  rating smallint not null default 5 check (rating between 1 and 5),
  published boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (author)
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null,
  published_at date not null default current_date,
  read_time integer not null default 5 check (read_time > 0),
  excerpt text not null default '',
  body text not null default '',
  image_url text not null default '',
  published boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  published boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (question)
);

create table public.legal_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug in ('privacy', 'terms')),
  title text not null,
  body text not null,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null default '',
  company text not null default '',
  service text not null default '',
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  service text not null,
  preferred_date date not null,
  notes text not null default '',
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index page_sections_sort_order_idx on public.page_sections (sort_order);
create index nav_links_sort_order_idx on public.nav_links (sort_order);
create index services_published_sort_order_idx on public.services (published, sort_order);
create index industries_published_sort_order_idx on public.industries (published, sort_order);
create index benefits_published_sort_order_idx on public.benefits (published, sort_order);
create index process_steps_published_sort_order_idx on public.process_steps (published, sort_order);
create index case_studies_published_sort_order_idx on public.case_studies (published, sort_order);
create index team_members_published_sort_order_idx on public.team_members (published, sort_order);
create index testimonials_published_sort_order_idx on public.testimonials (published, sort_order);
create index articles_published_sort_order_idx on public.articles (published, sort_order);
create index faqs_published_sort_order_idx on public.faqs (published, sort_order);
create index contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index consultation_requests_created_at_idx on public.consultation_requests (created_at desc);

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;
alter table public.page_sections enable row level security;
alter table public.nav_links enable row level security;
alter table public.partners enable row level security;
alter table public.services enable row level security;
alter table public.industries enable row level security;
alter table public.benefits enable row level security;
alter table public.process_steps enable row level security;
alter table public.case_studies enable row level security;
alter table public.team_members enable row level security;
alter table public.testimonials enable row level security;
alter table public.articles enable row level security;
alter table public.faqs enable row level security;
alter table public.legal_pages enable row level security;
alter table public.contact_messages enable row level security;
alter table public.consultation_requests enable row level security;

create policy "Admins can read their own admin record"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Public can read site settings"
  on public.site_settings for select to anon, authenticated using (true);
create policy "Admins can manage site settings"
  on public.site_settings for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Public can read enabled page sections"
  on public.page_sections for select to anon, authenticated
  using (enabled or (select public.is_admin()));
create policy "Admins can manage page sections"
  on public.page_sections for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Public can read visible navigation links"
  on public.nav_links for select to anon, authenticated
  using (visible or (select public.is_admin()));
create policy "Admins can manage navigation links"
  on public.nav_links for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Public can read published partners"
  on public.partners for select to anon, authenticated
  using (published or (select public.is_admin()));
create policy "Admins can manage partners"
  on public.partners for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Public can read published services"
  on public.services for select to anon, authenticated
  using (published or (select public.is_admin()));
create policy "Admins can manage services"
  on public.services for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Public can read published industries"
  on public.industries for select to anon, authenticated
  using (published or (select public.is_admin()));
create policy "Admins can manage industries"
  on public.industries for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Public can read published benefits"
  on public.benefits for select to anon, authenticated
  using (published or (select public.is_admin()));
create policy "Admins can manage benefits"
  on public.benefits for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Public can read published process steps"
  on public.process_steps for select to anon, authenticated
  using (published or (select public.is_admin()));
create policy "Admins can manage process steps"
  on public.process_steps for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Public can read published case studies"
  on public.case_studies for select to anon, authenticated
  using (published or (select public.is_admin()));
create policy "Admins can manage case studies"
  on public.case_studies for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Public can read published team members"
  on public.team_members for select to anon, authenticated
  using (published or (select public.is_admin()));
create policy "Admins can manage team members"
  on public.team_members for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Public can read published testimonials"
  on public.testimonials for select to anon, authenticated
  using (published or (select public.is_admin()));
create policy "Admins can manage testimonials"
  on public.testimonials for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Public can read published articles"
  on public.articles for select to anon, authenticated
  using (published or (select public.is_admin()));
create policy "Admins can manage articles"
  on public.articles for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Public can read published FAQs"
  on public.faqs for select to anon, authenticated
  using (published or (select public.is_admin()));
create policy "Admins can manage FAQs"
  on public.faqs for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Public can read published legal pages"
  on public.legal_pages for select to anon, authenticated
  using (published or (select public.is_admin()));
create policy "Admins can manage legal pages"
  on public.legal_pages for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Admins can manage contact messages"
  on public.contact_messages for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Admins can manage consultation requests"
  on public.consultation_requests for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

grant usage on schema public to anon, authenticated, service_role;
grant select on all tables in schema public to anon, authenticated;
grant all privileges on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

alter default privileges in schema public
  grant select on tables to anon, authenticated;
alter default privileges in schema public
  grant all privileges on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to service_role;
