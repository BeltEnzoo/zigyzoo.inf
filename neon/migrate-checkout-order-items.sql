-- Ítems del pedido y control de stock (ventas web aprobadas).
-- Ejecutá en el SQL Editor de Neon si checkout_sessions ya existía.

alter table public.checkout_sessions add column if not exists order_items_json jsonb;
alter table public.checkout_sessions add column if not exists stock_adjusted_at timestamptz;
