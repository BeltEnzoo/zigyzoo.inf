-- Color y tamaño (chico/mediano/grande) por variante, alineados a sizes/stocks en la hoja.

alter table public.product_variants
  add column if not exists color_producto text,
  add column if not exists tamano_producto text;

-- Permite el mismo talle con distinto color/tamaño en un mismo producto.
alter table public.product_variants
  drop constraint if exists product_variants_product_id_size_label_key;
