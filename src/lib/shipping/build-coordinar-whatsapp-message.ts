import { formatMoney } from "@/lib/format";
import type { CartLine } from "@/store/cart";
import type { CheckoutBuyerPayload } from "@/types/checkout-buyer";

export function buildCoordinarWhatsAppMessage(input: {
  lines: CartLine[];
  buyer: CheckoutBuyerPayload;
  postalCode: string;
  subtotal: number;
  currency: string;
}): string {
  const items = input.lines
    .map((l) => `• ${l.name} (${l.sizeLabel}) × ${l.quantity}`)
    .join("\n");

  return [
    "Hola Zigyzoo, quiero coordinar el envío de mi pedido web.",
    "",
    `Nombre: ${input.buyer.firstName.trim()} ${input.buyer.lastName.trim()}`,
    `CP envío: ${input.postalCode.trim()}`,
    `Tel: ${input.buyer.phone.trim()}`,
    `Mail: ${input.buyer.email.trim()}`,
    "",
    "Productos:",
    items,
    "",
    `Subtotal productos (sin envío): ${formatMoney(input.subtotal, input.currency)}`,
    "",
    "¿Me pasan el costo de envío y cómo abonarlo? Gracias.",
  ].join("\n");
}
