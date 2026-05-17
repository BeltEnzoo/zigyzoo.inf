/** Estado del checkout respecto a Mercado Pago. */
export type CheckoutPaymentStatus = "iniciado" | "approved" | "pending" | "rejected";

export function mapMercadoPagoPaymentStatus(
  mpStatus: string | undefined,
): CheckoutPaymentStatus {
  switch (mpStatus) {
    case "approved":
      return "approved";
    case "pending":
    case "in_process":
    case "in_mediation":
      return "pending";
    case "rejected":
    case "cancelled":
    case "refunded":
    case "charged_back":
      return "rejected";
    default:
      return "iniciado";
  }
}
