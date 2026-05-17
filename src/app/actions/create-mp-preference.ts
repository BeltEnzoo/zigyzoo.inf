"use server";

import { MercadoPagoConfig, Preference } from "mercadopago";
import { persistCheckoutSessionToNeon } from "@/lib/checkout/persist-checkout-session";
import { validateBuyerPayload } from "@/lib/checkout/validate-buyer";
import {
  canUseMercadoPagoAutoReturn,
  checkoutReturnUrls,
  getCheckoutBaseUrl,
} from "@/lib/payments/get-base-url";
import { validateCartForCheckout } from "@/lib/payments/validate-cart-for-checkout";
import type { CartLine } from "@/store/cart";
import type { CheckoutBuyerPayload } from "@/types/checkout-buyer";

export type CreateMpPreferenceResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

function pickPreferenceUrl(
  res: { init_point?: string; sandbox_init_point?: string },
  accessToken: string,
): string | null {
  const test = accessToken.startsWith("TEST-");
  const url = test ? res.sandbox_init_point : res.init_point;
  return url ?? null;
}

function mapMercadoPagoError(message: string, base: string): string {
  if (/auto_return|back_url\.success|invalid_back_url/i.test(message)) {
    if (!canUseMercadoPagoAutoReturn(base)) {
      return (
        "Mercado Pago (producción) necesita volver a tu sitio por HTTPS. " +
        "Configurá NEXT_PUBLIC_APP_URL con tu URL de Vercel (https://…) y reiniciá el servidor, " +
        "o probá el checkout desde el sitio publicado. http://localhost no alcanza con credencial de producción."
      );
    }
  }
  return message;
}

export async function createMercadoPagoPreference(
  lines: CartLine[],
  postalCodeRaw: string,
  buyer: CheckoutBuyerPayload,
): Promise<CreateMpPreferenceResult> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!token) {
    return {
      ok: false,
      error:
        "Los pagos con Mercado Pago no están configurados todavía (falta MERCADOPAGO_ACCESS_TOKEN en el servidor).",
    };
  }

  const validated = await validateCartForCheckout(lines, postalCodeRaw);
  if (!validated.ok) return validated;

  const buyerOk = validateBuyerPayload(buyer);
  if (!buyerOk.ok) {
    return { ok: false, error: buyerOk.error };
  }
  const payerData = buyerOk.buyer;

  await persistCheckoutSessionToNeon({
    externalReference: validated.data.external_reference,
    buyer: payerData,
    shippingPostalCode: validated.data.normalizedPostalCode,
  });

  const base = getCheckoutBaseUrl();
  const back_urls = checkoutReturnUrls(base);
  const useAutoReturn = canUseMercadoPagoAutoReturn(base);
  const client = new MercadoPagoConfig({ accessToken: token });
  const preference = new Preference(client);

  const notificationUrl = process.env.MERCADOPAGO_NOTIFICATION_URL?.trim();

  try {
    const body = {
      items: validated.data.items.map((i) => ({
        id: i.id,
        title: i.title,
        quantity: i.quantity,
        unit_price: i.unit_price,
        currency_id: i.currency_id,
      })),
      external_reference: validated.data.external_reference,
      payer: {
        name: payerData.firstName,
        surname: payerData.lastName,
        email: payerData.email,
        identification: {
          type: "DNI",
          number: payerData.dni,
        },
        ...(payerData.mpPhone ? { phone: payerData.mpPhone } : {}),
      },
      metadata: {
        buyer_dni: payerData.dni,
        buyer_phone: payerData.phoneRaw,
      },
      back_urls,
      ...(useAutoReturn ? { auto_return: "approved" as const } : {}),
      statement_descriptor: "ZIGYZOO",
      ...(notificationUrl ? { notification_url: notificationUrl } : {}),
    };

    const result = await preference.create({ body });

    const url = pickPreferenceUrl(result, token);
    if (!url) {
      return { ok: false, error: "Mercado Pago no devolvió el enlace de pago. Probá de nuevo." };
    }

    return { ok: true, url };
  } catch (e: unknown) {
    console.error("[createMercadoPagoPreference]", e);
    const raw =
      e && typeof e === "object" && "message" in e && typeof (e as Error).message === "string"
        ? (e as Error).message
        : "No se pudo iniciar el pago con Mercado Pago.";
    return { ok: false, error: mapMercadoPagoError(raw, base) };
  }
}
