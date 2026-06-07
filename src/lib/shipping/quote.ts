import {
  CORREO_SUCURSAL_RULES,
  ENTREGA_PROPIA_RULES,
} from "@/config/shipping-zones";
import type { ShippingMethod } from "@/types/shipping";

export type ShippingQuote = {
  label: string;
  costARS: number;
};

export type ParsedPostalCode = {
  letter: string;
  numeric: number;
};

/** Normaliza CP argentino (letras + números, ej. B1643). */
export function normalizeArgentinePostalCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

/** Extrae letra CPA y parte numérica (4 dígitos). */
export function parseArgentinePostalCode(raw: string): ParsedPostalCode | null {
  const normalized = normalizeArgentinePostalCode(raw);
  const match = normalized.match(/^([A-Z])(\d{4})/);
  if (!match) return null;
  const numeric = Number(match[2]);
  if (!Number.isFinite(numeric)) return null;
  return { letter: match[1], numeric };
}

function inRange(n: number, min: number, max: number): boolean {
  return n >= min && n <= max;
}

export function quoteEntregaPropia(raw: string): ShippingQuote | null {
  const parsed = parseArgentinePostalCode(raw);
  if (!parsed) return null;

  const sorted = [...ENTREGA_PROPIA_RULES].sort((a, b) => b.priority - a.priority);
  for (const rule of sorted) {
    if (!rule.letters.includes(parsed.letter)) continue;
    if (inRange(parsed.numeric, rule.minNumeric, rule.maxNumeric)) {
      return { label: rule.label, costARS: rule.costARS };
    }
  }
  return null;
}

export function quoteCorreoSucursal(raw: string): ShippingQuote | null {
  const parsed = parseArgentinePostalCode(raw);
  if (!parsed) return null;

  const sorted = [...CORREO_SUCURSAL_RULES].sort((a, b) => b.priority - a.priority);
  for (const rule of sorted) {
    if (rule.letter !== parsed.letter) continue;
    if (inRange(parsed.numeric, rule.minNumeric, rule.maxNumeric)) {
      return { label: rule.label, costARS: rule.costARS };
    }
  }
  return null;
}

export function quoteShippingByMethod(
  method: ShippingMethod,
  raw: string,
): ShippingQuote | null {
  if (method === "coordinar") {
    return null;
  }
  if (method === "entrega_propia") {
    return quoteEntregaPropia(raw);
  }
  return quoteCorreoSucursal(raw);
}

/** @deprecated Usar quoteShippingByMethod. Mantenido por compatibilidad puntual. */
export function quoteShippingByPostalCode(raw: string): ShippingQuote | null {
  return quoteEntregaPropia(raw) ?? quoteCorreoSucursal(raw);
}

export function shippingMethodChargesInCheckout(method: ShippingMethod): boolean {
  return method === "entrega_propia" || method === "correo_sucursal";
}
