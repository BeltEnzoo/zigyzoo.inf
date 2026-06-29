import { getSql } from "@/lib/db/neon";
import { runApprovedSaleSideEffects } from "@/lib/payments/approved-sale-effects";
import {
  mapMercadoPagoPaymentStatus,
  type CheckoutPaymentStatus,
} from "@/types/checkout-payment-status";
import { MercadoPagoConfig, Payment } from "mercadopago";

export async function updateCheckoutPaymentByReference(input: {
  externalReference: string;
  status: CheckoutPaymentStatus;
  mpPaymentId?: string;
}): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;

  const paidAt = input.status === "approved" ? new Date() : null;

  try {
    const rows = await sql`
      update public.checkout_sessions
      set
        payment_status = ${input.status},
        mp_payment_id = coalesce(${input.mpPaymentId ?? null}, mp_payment_id),
        paid_at = coalesce(${paidAt}, paid_at)
      where external_reference = ${input.externalReference}
      returning id
    `;
    const ok = rows.length > 0;
    if (ok && input.status === "approved") {
      void runApprovedSaleSideEffects(input.externalReference);
    }
    return ok;
  } catch (e) {
    console.error("[updateCheckoutPaymentByReference]", e);
    return false;
  }
}

/** Consulta el pago en MP y actualiza `checkout_sessions` por `external_reference`. */
export async function syncCheckoutFromMercadoPagoPayment(
  paymentId: string,
): Promise<boolean> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!token) return false;

  try {
    const client = new MercadoPagoConfig({ accessToken: token });
    const payment = new Payment(client);
    const res = await payment.get({ id: paymentId });
    const externalRef = res.external_reference?.trim();
    if (!externalRef) return false;

    const status = mapMercadoPagoPaymentStatus(res.status);
    return updateCheckoutPaymentByReference({
      externalReference: externalRef,
      status,
      mpPaymentId: String(res.id ?? paymentId),
    });
  } catch (e) {
    console.error("[syncCheckoutFromMercadoPagoPayment]", e);
    return false;
  }
}
