-- Zigyzoo — esquema tienda (Supabase / Postgres con auth.users).
-- Despliegue actual: Vercel + Neon → usar `neon/schema.sql` y variables DATABASE_URL + AUTH_SECRET.
-- Imágenes por URL externa (sin Storage). Stock por variante (talle).

create extension if not exists "pgcrypto";

-- Categorías
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Productos (precio a nivel producto; stock en variantes)
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

-- Variantes = talles (stock por fila)
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size_label text not null,
  sku text,
  stock int not null default 0 check (stock >= 0),
  sort_order int not null default 0,
  unique (product_id, size_label)
);

-- Imágenes por URL
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  sort_order int not null default 0
);

-- Perfil: quién puede editar (dueña, diseñador, vos). Se crea fila al dar de alta el usuario en Auth.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products (category_id);
create index if not exists idx_products_active on public.products (is_active);
create index if not exists idx_variants_product on public.product_variants (product_id);
create index if not exists idx_images_product on public.product_images (product_id);

-- Trigger updated_at
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

-- RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.profiles enable row level security;

-- Lectura pública del catálogo (solo activos vía política de products; el join filtra)
create policy "Catálogo: lectura categorías"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "Catálogo: lectura productos activos"
  on public.products for select
  to anon, authenticated
  using (is_active = true);

create policy "Catálogo: lectura variantes de productos activos"
  on public.product_variants for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_variants.product_id and p.is_active = true
    )
  );

create policy "Catálogo: lectura imágenes de productos activos"
  on public.product_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id and p.is_active = true
    )
  );

-- Staff: editor y admin (mismo permiso de escritura por ahora)
create policy "Staff: lectura propio perfil"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Staff: lectura perfiles admin"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles me
      where me.id = auth.uid() and me.role in ('admin', 'editor')
    )
  );

-- Escritura catálogo solo staff
create policy "Staff: insert categorías"
  on public.categories for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))
  );

create policy "Staff: update categorías"
  on public.categories for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))
  );

create policy "Staff: delete categorías"
  on public.categories for delete
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))
  );

create policy "Staff: insert productos"
  on public.products for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))
  );

create policy "Staff: update productos"
  on public.products for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))
  );

create policy "Staff: delete productos"
  on public.products for delete
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))
  );

create policy "Staff: insert variantes"
  on public.product_variants for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))
  );

create policy "Staff: update variantes"
  on public.product_variants for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))
  );

create policy "Staff: delete variantes"
  on public.product_variants for delete
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))
  );

create policy "Staff: insert imágenes"
  on public.product_images for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))
  );

create policy "Staff: update imágenes"
  on public.product_images for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))
  );

create policy "Staff: delete imágenes"
  on public.product_images for delete
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))
  );

-- Nuevo usuario en Auth → opcional: crear perfil editor (ajustá según preferencia)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'editor');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Datos de ejemplo (opcional)
insert into public.categories (name, slug, sort_order)
values
  ('Remeras', 'remeras', 1),
  ('Pantalones', 'pantalones', 2),
  ('Vestidos', 'vestidos', 3)
on conflict (slug) do nothing;

-- Panel: staff ve también productos inactivos y todas las variantes/imágenes
create policy "Staff: ver todos los productos"
  on public.products for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles pr
      where pr.id = auth.uid() and pr.role in ('admin', 'editor')
    )
  );

create policy "Staff: ver todas las variantes"
  on public.product_variants for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles pr
      where pr.id = auth.uid() and pr.role in ('admin', 'editor')
    )
  );

create policy "Staff: ver todas las imágenes"
  on public.product_images for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles pr
      where pr.id = auth.uid() and pr.role in ('admin', 'editor')
    )
  );
