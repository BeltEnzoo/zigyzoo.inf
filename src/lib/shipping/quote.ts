import {
  SHIPPING_DEFAULT_ZONE,
  SHIPPING_ZONE_RULES,
} from "@/config/shipping-zones";

export type ShippingQuote = {
  label: string;
  costARS: number;
};

/** Normaliza CP argentino (letras + números, ej. B1643). */
export function normalizeArgentinePostalCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

/**
 * Cotización según prefijos configurados en `shipping-zones.ts`.
 * Si el CP es demasiado corto o vacío, devuelve null.
 * Si no hay regla, aplica la zona default.
 */
export function quoteShippingByPostalCode(raw: string): ShippingQuote | null {
  const normalized = normalizeArgentinePostalCode(raw);
  if (normalized.length < 4) {
    return null;
  }

  const sorted = [...SHIPPING_ZONE_RULES].sort((a, b) => b.priority - a.priority);
  for (const rule of sorted) {
    for (const prefix of rule.prefixes) {
      if (normalized.startsWith(prefix)) {
        return { label: rule.label, costARS: rule.costARS };
      }
    }
  }

  return {
    label: SHIPPING_DEFAULT_ZONE.label,
    costARS: SHIPPING_DEFAULT_ZONE.costARS,
  };
}
