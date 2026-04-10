alter table public.categories
add column if not exists color_hex text check (color_hex ~ '^#[0-9A-Fa-f]{6}$');

create table if not exists public.product_categories (
  product_id uuid not null references public.products (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, category_id)
);

create index if not exists idx_prod_cat_category on public.product_categories (category_id);
create index if not exists idx_prod_cat_product on public.product_categories (product_id);

insert into public.product_categories (product_id, category_id)
select p.id, p.category_id
from public.products p
where p.category_id is not null
on conflict do nothing;

update public.categories set color_hex = '#C08081' where slug = 'bebes';
update public.categories set color_hex = '#1DB40F' where slug = 'juegos-juguetes-aire-libre';
update public.categories set color_hex = '#BC31DE' where slug = 'juegos-juguetes-aprendizaje-ingenio';
update public.categories set color_hex = '#FFEB5C' where slug = 'maternidad';

