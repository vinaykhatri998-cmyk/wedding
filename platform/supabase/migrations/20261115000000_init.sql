-- Shubh Nimantran: database structure.
-- Every table has row level security ON with no public policies, so the public
-- (anon) key can read nothing. The website server does all reads and writes with
-- the secret service key after checking who is logged in.

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table templates (
  id text primary key,
  name text not null,
  category text not null default 'Traditional',
  tier text not null default 'standard' check (tier in ('standard','premium')),
  description text not null default '',
  themes jsonb not null default '[]',
  html text,                      -- null = built-in design file shipped with the site
  active boolean not null default true,
  sort int not null default 100,
  created_at timestamptz not null default now()
);

create table packages (
  id text primary key,
  name text not null,
  price_inr int not null check (price_inr >= 0),
  months int not null default 3,
  revisions int not null default 1,       -- -1 = unlimited
  premium_templates boolean not null default false,
  music boolean not null default false,
  guest_links boolean not null default false,
  rsvp_tracking boolean not null default false,
  tagline text not null default '',
  active boolean not null default true,
  sort int not null default 100
);

create table invitations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id text not null references templates(id),
  theme text not null default '',
  data jsonb not null default '{}',
  slug text unique,
  status text not null default 'draft' check (status in ('draft','published','unpublished')),
  package_id text references packages(id),
  revisions_used int not null default 0,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on invitations(user_id);

create table coupons (
  code text primary key,
  percent_off int not null check (percent_off between 1 and 100),
  max_uses int,
  used int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_no bigint generated always as identity (start with 1001),
  user_id uuid not null references auth.users(id) on delete cascade,
  invitation_id uuid not null references invitations(id) on delete cascade,
  package_id text not null references packages(id),
  list_price int not null,
  amount int not null,
  coupon_code text,
  utr text,
  status text not null default 'pending_review' check (status in ('pending_review','paid','rejected','refunded')),
  admin_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index on orders(user_id);
create index on orders(status);
-- the same UPI transaction number can never be used for two live orders
create unique index orders_utr_unique on orders(utr) where status in ('pending_review','paid');

create table rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations(id) on delete cascade,
  name text not null,
  attending boolean not null,
  guests int not null default 1,
  message text,
  created_at timestamptz not null default now()
);
create index on rsvps(invitation_id);

create table support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  message text not null,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now()
);

create table settings (
  key text primary key,
  value text not null default ''
);

alter table profiles enable row level security;
alter table templates enable row level security;
alter table packages enable row level security;
alter table invitations enable row level security;
alter table coupons enable row level security;
alter table orders enable row level security;
alter table rsvps enable row level security;
alter table support_requests enable row level security;
alter table settings enable row level security;

-- a profile row is created automatically whenever someone signs up
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- private photo storage: nothing is readable without a short-lived signed link
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 4194304, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- starting data ---------------------------------------------------------
insert into packages (id, name, price_inr, months, revisions, premium_templates, music, guest_links, rsvp_tracking, tagline, sort) values
 ('basic',   'Basic',   300, 3,  1, false, false, false, false, 'A beautiful invitation, ready to share', 1),
 ('premium', 'Premium', 600, 6,  3, true,  true,  true,  false, 'Every design, music and personal guest links', 2),
 ('royal',   'Royal',   800, 12, -1, true,  true,  true,  true,  'Everything, plus RSVP tracking', 3);

insert into templates (id, name, category, tier, description, sort, themes) values
 ('floral', 'Garden Letter', 'Floral', 'standard', 'A wax-sealed envelope opens into a soft garden of blush roses and sage leaves.', 1,
  '[{"id":"","name":"Blush & Sage","swatch":"#c98b86"},{"id":"lavender","name":"Lavender","swatch":"#8f7fb5"},{"id":"blue","name":"Dusty Blue","swatch":"#6f8fb0"}]'),
 ('luxury', 'Heirloom Gold', 'Traditional', 'standard', 'Deep maroon and gold leaf, with a classic unveiling.', 2,
  '[{"id":"","name":"Maroon & Gold","swatch":"#7a1e2e"},{"id":"emerald","name":"Emerald","swatch":"#0f5a46"},{"id":"navy","name":"Royal Navy","swatch":"#1b2a5c"}]'),
 ('royal', 'Palace Gates', 'Royal', 'premium', 'Three-dimensional palace doors swing open and guests walk inside.', 3,
  '[{"id":"","name":"Saffron & Lapis","swatch":"#e58a24"}]');

insert into settings (key, value) values
 ('upi_id', ''), ('upi_name', 'Shubh Nimantran'), ('whatsapp', ''), ('banner', ''), ('qr_image', '');

-- counts one use of a coupon (safe when two orders arrive together)
create function public.use_coupon(c text) returns void language sql security definer set search_path = public as $$
  update coupons set used = used + 1 where code = c;
$$;
revoke execute on function public.use_coupon(text) from public, anon, authenticated;
