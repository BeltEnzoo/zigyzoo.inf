import type { ValidatedBuyer } from "@/lib/checkout/validate-buyer";
import { getSql } from "@/lib/db/neon";

/** Evita que un DNI o email quede asociado a dos identidades distintas. */
export async function assertCheckoutBuyerIdentityUnique(
  buyer: ValidatedBuyer,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sql = getSql();
  if (!sql) return { ok: true };

  try {
    const dniRows = await sql`
      select distinct lower(trim(buyer_email)) as email
      from public.checkout_sessions
      where regexp_replace(buyer_dni, '[^0-9]', '', 'g') = ${buyer.dni}
        and lower(trim(buyer_email)) <> ${buyer.email}
      limit 1
    `;
    if (dniRows.length > 0) {
      return {
        ok: false,
        error:
          "Ese DNI ya está registrado con otro email. Usá el mismo email de siempre o escribinos si necesitás corregir tus datos.",
      };
    }

    const emailRows = await sql`
      select distinct regexp_replace(buyer_dni, '[^0-9]', '', 'g') as dni
      from public.checkout_sessions
      where lower(trim(buyer_email)) = ${buyer.email}
        and regexp_replace(buyer_dni, '[^0-9]', '', 'g') <> ${buyer.dni}
      limit 1
    `;
    if (emailRows.length > 0) {
      return {
        ok: false,
        error:
          "Ese email ya está registrado con otro DNI. Revisá los datos o usá el email con el que compraste antes.",
      };
    }

    return { ok: true };
  } catch (e) {
    console.error("[assertCheckoutBuyerIdentityUnique]", e);
    return { ok: true };
  }
}
