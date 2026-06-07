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

-- Ampliar métodos de envío (ejecutar si el check viejo solo permitía correo/coordinar):
-- alter table public.checkout_sessions drop constraint if exists checkout_sessions_shipping_method_check;
-- alter table public.checkout_sessions add constraint checkout_sessions_shipping_method_check
--   check (
--     shipping_method is null
--     or shipping_method in ('correo', 'correo_sucursal', 'entrega_propia', 'coordinar')
--   );
