import { randomUUID } from "crypto";
import { getProductBySlug } from "@/data/shop";
import { parseVariantIndex } from "@/lib/catalog/sheet-operations";
import {
  formatNormalizedPostalCodeForStorage,
  isValidShippingPostalInput,
  quoteShippingByMethod,
  shippingMethodChargesInCheckout,
} from "@/lib/shipping/quote";
import type { CartLine } from "@/store/cart";
import type { StoredOrderLine } from "@/types/checkout-order";
import { SHIPPING_COORDINAR_LABEL, type ShippingMethod } from "@/types/shipping";

export type MercadoPagoPreferenceItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
};

export type ValidatedCheckout = {
  items: MercadoPagoPreferenceItem[];
  orderLines: StoredOrderLine[];
  external_reference: string;
  normalizedPostalCode: string;
  shippingMethod: ShippingMethod;
  shippingLabel: string;
};

export async function validateCartForCheckout(
  lines: CartLine[],
  postalCodeRaw: string,
  shippingMethod: ShippingMethod,
): Promise<{ ok: true; data: ValidatedCheckout } | { ok: false; error: string }> {
  if (!lines.length) {
    return { ok: false, error: "El carrito está vacío." };
  }

  if (!isValidShippingPostalInput(postalCodeRaw)) {
    return {
      ok: false,
      error: "Ingresá un código postal válido (4 dígitos o con letra CPA, ej. 1000 o C1425).",
    };
  }

  const normalizedPostalCode = formatNormalizedPostalCodeForStorage(postalCodeRaw);

  let shippingLabel: string;
  let shippingCostARS = 0;

  if (shippingMethod === "coordinar") {
    shippingLabel = SHIPPING_COORDINAR_LABEL;
  } else {
    const shippingQuote = quoteShippingByMethod(shippingMethod, postalCodeRaw);
    if (!shippingQuote) {
      const hint =
        shippingMethod === "entrega_propia"
          ? "Entrega propia no está disponible para ese código postal."
          : "Correo a sucursal no está disponible para ese código postal.";
      return {
        ok: false,
        error: `${hint} Probá otra opción o coordiná con la tienda.`,
      };
    }
    shippingLabel = shippingQuote.label;
    shippingCostARS = shippingQuote.costARS;
  }

  const currencies = new Set(lines.map((l) => l.currency));
  if (currencies.size !== 1) {
    return { ok: false, error: "El carrito debe tener una sola moneda." };
  }
  const currency = [...currencies][0];
  if (currency !== "ARS") {
    return { ok: false, error: "Por ahora solo aceptamos pesos argentinos (ARS)." };
  }

  const items: MercadoPagoPreferenceItem[] = [];
  const orderLines: StoredOrderLine[] = [];

  for (const line of lines) {
    const product = await getProductBySlug(line.slug);
    if (!product?.is_active) {
      return {
        ok: false,
        error: `El producto "${line.name}" ya no está disponible. Volvé a la tienda y actualizá el carrito.`,
      };
    }

    const variant = product.product_variants.find((v) => v.id === line.variantId);
    if (!variant) {
      return {
        ok: false,
        error: `La opción elegida para "${product.name}" ya no existe. Actualizá el carrito.`,
      };
    }

    if (variant.stock < line.quantity) {
      return {
        ok: false,
        error: `Stock insuficiente para "${product.name}" (${line.sizeLabel}). Revisá cantidades en la tienda.`,
      };
    }

    const serverPrice = product.price;
    if (Math.abs(serverPrice - line.price) > 0.02) {
      return {
        ok: false,
        error: `El precio de "${product.name}" cambió. Volvé a la tienda y cargá el carrito de nuevo.`,
      };
    }

    const title = `${product.name} — ${line.sizeLabel}`.slice(0, 250);
    items.push({
      id: line.lineId.slice(0, 256),
      title,
      quantity: line.quantity,
      unit_price: Number(serverPrice.toFixed(2)),
      currency_id: "ARS",
    });

    const variantIndex =
      parseVariantIndex(line.variantId) ??
      product.product_variants.findIndex((v) => v.id === line.variantId);
    if (variantIndex < 0) {
      return {
        ok: false,
        error: `No se pudo registrar la variante de "${product.name}". Actualizá el carrito.`,
      };
    }
    orderLines.push({
      slug: line.slug,
      variantIndex,
      quantity: line.quantity,
      productName: product.name,
      sizeLabel: line.sizeLabel,
    });
  }

  if (shippingMethodChargesInCheckout(shippingMethod) && shippingCostARS > 0) {
    items.push({
      id: "shipping-zigyzoo",
      title: `Envío — ${shippingLabel}`.slice(0, 250),
      quantity: 1,
      unit_price: Number(shippingCostARS.toFixed(2)),
      currency_id: "ARS",
    });
  }

  const external_reference = `zigyzoo-${randomUUID()}`;
  return {
    ok: true,
    data: {
      items,
      orderLines,
      external_reference,
      normalizedPostalCode,
      shippingMethod,
      shippingLabel,
    },
  };
}
