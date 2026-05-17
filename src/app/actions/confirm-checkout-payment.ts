"use server";

import {
  syncCheckoutFromMercadoPagoPayment,
  updateCheckoutPaymentByReference,
} from "@/lib/payments/update-checkout-payment";

/** Al volver de Mercado Pago (página exitoso), intenta marcar el checkout como pagado. */
export async function confirmCheckoutPaymentFromReturn(input: {
  externalReference?: string | null;
  paymentId?: string | null;
  collectionId?: string | null;
  status?: string | null;
  collectionStatus?: string | null;
}): Promise<void> {
  const paymentId = input.paymentId?.trim() || input.collectionId?.trim();
  if (paymentId) {
    await syncCheckoutFromMercadoPagoPayment(paymentId);
    return;
  }

  const externalReference = input.externalReference?.trim();
  const mpStatus = input.collectionStatus?.trim() || input.status?.trim();
  if (externalReference && mpStatus === "approved") {
    await updateCheckoutPaymentByReference({
      externalReference,
      status: "approved",
    });
  }
}
