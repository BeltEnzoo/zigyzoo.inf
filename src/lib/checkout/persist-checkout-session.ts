import type { ValidatedBuyer } from "@/lib/checkout/validate-buyer";
import { getSql } from "@/lib/db/neon";

/** Guarda comprador + referencia MP en Neon (no bloquea el checkout si falla). */
export async function persistCheckoutSessionToNeon(input: {
  externalReference: string;
  buyer: ValidatedBuyer;
  shippingPostalCode: string;
}): Promise<void> {
  const sql = getSql();
  if (!sql) return;

  try {
    await sql`
      insert into public.checkout_sessions (
        external_reference,
        buyer_first_name,
        buyer_last_name,
        buyer_dni,
        buyer_phone,
        buyer_email,
        shipping_postal_code
      ) values (
        ${input.externalReference},
        ${input.buyer.firstName},
        ${input.buyer.lastName},
        ${input.buyer.dni},
        ${input.buyer.phoneRaw},
        ${input.buyer.email},
        ${input.shippingPostalCode}
      )
    `;
  } catch (e) {
    console.error("[persistCheckoutSessionToNeon]", e);
  }
}
