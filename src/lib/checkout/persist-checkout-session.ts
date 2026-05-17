import type { ValidatedBuyer } from "@/lib/checkout/validate-buyer";
import { getSql } from "@/lib/db/neon";
import type { ShippingMethod } from "@/types/shipping";

/** Guarda comprador + referencia MP en Neon (no bloquea el checkout si falla). */
export async function persistCheckoutSessionToNeon(input: {
  externalReference: string;
  buyer: ValidatedBuyer;
  shippingPostalCode: string;
  shippingMethod: ShippingMethod;
  shippingLabel: string;
  totalAmountArs: number;
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
        shipping_postal_code,
        shipping_method,
        shipping_label,
        total_amount_ars,
        payment_status
      ) values (
        ${input.externalReference},
        ${input.buyer.firstName},
        ${input.buyer.lastName},
        ${input.buyer.dni},
        ${input.buyer.phoneRaw},
        ${input.buyer.email},
        ${input.shippingPostalCode},
        ${input.shippingMethod},
        ${input.shippingLabel},
        ${Number(input.totalAmountArs.toFixed(2))},
        ${"iniciado"}
      )
    `;
  } catch (e) {
    console.error("[persistCheckoutSessionToNeon]", e);
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
    } catch (fallbackErr) {
      console.error("[persistCheckoutSessionToNeon] fallback", fallbackErr);
    }
  }
}
