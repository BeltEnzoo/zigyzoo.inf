-- Productos cargados desde Google Sheet vs creados solo desde el panel.
-- Solo los sheet_managed se eliminan al sacar la fila de la hoja y sincronizar.

alter table public.products
add column if not exists sheet_managed boolean not null default false;
