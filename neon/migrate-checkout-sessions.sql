-- Ejecutá esto en el SQL Editor de Neon si la tabla checkout_sessions ya existía
-- (panel Ventas / Clientes / montos de envío).

alter table public.checkout_sessions add column if not exists shipping_method text;
alter table public.checkout_sessions add column if not exists shipping_label text;
alter table public.checkout_sessions add column if not exists total_amount_ars numeric(12, 2);
alter table public.checkout_sessions add column if not exists payment_status text not null default 'iniciado';
alter table public.checkout_sessions add column if not exists mp_payment_id text;
alter table public.checkout_sessions add column if not exists paid_at timestamptz;

-- Opcional: marcar manualmente un pago de prueba ya hecho (reemplazá el email):
-- update public.checkout_sessions
-- set payment_status = 'approved', paid_at = coalesce(paid_at, created_at)
-- where buyer_email = 'tu@email.com' and payment_status = 'iniciado';
