-- Zigyzoo — Postgres en Neon (Vercel + Neon)
-- Ejecutá este archivo en el SQL Editor de Neon (o psql contra DATABASE_URL).
-- Imágenes por URL. Stock por variante (talle). Panel: tabla admin_users (no Supabase Auth).

create extension if not exists "pgcrypto";

-- Cuentas del panel (email + contraseña hasheada con bcrypt, ej. cost 10)
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  currency text not null default 'ARS',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size_label text not null,
  sku text,
  stock int not null default 0 check (stock >= 0),
  sort_order int not null default 0,
  unique (product_id, size_label)
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  sort_order int not null default 0
);

create index if not exists idx_products_category on public.products (category_id);
create index if not exists idx_products_active on public.products (is_active);
create index if not exists idx_variants_product on public.product_variants (product_id);
create index if not exists idx_images_product on public.product_images (product_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated
  before update on public.products
  for each row execute function public.set_updated_at();

-- Sin RLS: la app Next.js en Vercel accede con DATABASE_URL (servidor de confianza).

insert into public.categories (name, slug, sort_order)
values
  ('Remeras', 'remeras', 1),
  ('Pantalones', 'pantalones', 2),
  ('Vestidos', 'vestidos', 3)
on conflict (slug) do nothing;

-- Primer usuario admin (reemplazá el hash; generá uno con Node):
-- node -e "console.log(require('bcryptjs').hashSync('TU_CONTRASEÑA', 10))"
-- insert into public.admin_users (email, password_hash, role)
-- values ('vos@ejemplo.com', '$2a$10$................................', 'admin');
