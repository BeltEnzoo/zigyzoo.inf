# Base de datos Zigyzoo (legado Supabase)

**Stack actual:** Vercel + Neon — ver `neon/schema.sql` y `.env.example` (`DATABASE_URL`, `AUTH_SECRET`).

---

# Base de datos Zigyzoo (Supabase)

## 1. Proyecto

1. Creá un proyecto en [Supabase](https://supabase.com).
2. En **Settings → API** copiá `Project URL` y `anon public` key.
3. En la raíz del repo creá `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 2. Esquema

En **SQL Editor**, ejecutá el contenido completo de `schema.sql` (una sola vez).

Incluye tablas: `categories`, `products`, `product_variants`, `product_images`, `profiles`, políticas RLS y un trigger que crea `profiles` al registrar un usuario en Auth.

## 3. Usuarios del panel (dueña, diseñador, vos)

1. **Authentication → Users → Add user**: creá cada cuenta con email y contraseña (o invitación por mail).
2. Al primer login, el trigger crea una fila en `profiles` con rol `editor`.
3. Para dar permisos plenos a la dueña (opcional), en **SQL Editor**:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'email@ejemplo.com');
```

Los roles `admin` y `editor` pueden crear/editar productos según las políticas actuales.

## 4. Desactivar registro público (recomendado)

En **Authentication → Providers**, desactivá el registro abierto si solo querés usuarios creados a mano.

## 5. Datos de prueba

El script inserta categorías de ejemplo (`remeras`, `pantalones`, `vestidos`). Podés cargar productos desde **Panel → Nuevo producto** en el sitio o por SQL/CSV.
