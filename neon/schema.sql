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
  color_hex text check (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
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
  sheet_managed boolean not null default false,
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
  color_producto text,
  tamano_producto text
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  sort_order int not null default 0
);

create table if not exists public.product_categories (
  product_id uuid not null references public.products (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, category_id)
);

create index if not exists idx_products_category on public.products (category_id);
create index if not exists idx_products_active on public.products (is_active);
create index if not exists idx_variants_product on public.product_variants (product_id);
create index if not exists idx_images_product on public.product_images (product_id);
create index if not exists idx_prod_cat_category on public.product_categories (category_id);
create index if not exists idx_prod_cat_product on public.product_categories (product_id);

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

-- Intento de compra (preferencia MP): datos del comprador + vínculo por external_reference
create table if not exists public.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  external_reference text not null unique,
  buyer_first_name text not null,
  buyer_last_name text not null,
  buyer_dni text not null,
  buyer_phone text not null,
  buyer_email text not null,
  shipping_postal_code text,
  shipping_method text check (
    shipping_method is null
    or shipping_method in ('correo', 'correo_sucursal', 'entrega_propia', 'coordinar')
  ),
  shipping_label text,
  total_amount_ars numeric(12, 2),
  payment_status text not null default 'iniciado'
    check (payment_status in ('iniciado', 'approved', 'pending', 'rejected')),
  mp_payment_id text,
  paid_at timestamptz,
  order_items_json jsonb,
  stock_adjusted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_checkout_sessions_created on public.checkout_sessions (created_at desc);

-- Si la tabla ya existía sin estas columnas:
-- alter table public.checkout_sessions add column if not exists shipping_method text check (shipping_method in ('correo', 'coordinar'));
-- alter table public.checkout_sessions add column if not exists shipping_label text;
-- alter table public.checkout_sessions add column if not exists total_amount_ars numeric(12, 2);
-- alter table public.checkout_sessions add column if not exists payment_status text not null default 'iniciado';
-- alter table public.checkout_sessions add column if not exists mp_payment_id text;
-- alter table public.checkout_sessions add column if not exists paid_at timestamptz;

insert into public.categories (name, slug, sort_order)
values
  ('Remeras', 'remeras', 1),
  ('Pantalones', 'pantalones', 2),
  ('Vestidos', 'vestidos', 3),
  ('Bebés', 'bebes', 4),
  ('Juegos y Juguetes al Aire Libre', 'juegos-juguetes-aire-libre', 5),
  ('Juegos y Juguetes de Aprendizaje e Ingenio', 'juegos-juguetes-aprendizaje-ingenio', 6),
  ('Maternidad', 'maternidad', 7)
on conflict (slug) do nothing;

update public.categories set color_hex = '#C08081' where slug = 'bebes';
update public.categories set color_hex = '#1DB40F' where slug = 'juegos-juguetes-aire-libre';
update public.categories set color_hex = '#BC31DE' where slug = 'juegos-juguetes-aprendizaje-ingenio';
update public.categories set color_hex = '#FFEB5C' where slug = 'maternidad';

-- Primer usuario admin (reemplazá el hash; generá uno con Node):
-- node -e "console.log(require('bcryptjs').hashSync('TU_CONTRASEÑA', 10))"
-- insert into public.admin_users (email, password_hash, role)
-- values ('vos@ejemplo.com', '$2a$10$................................', 'admin');
