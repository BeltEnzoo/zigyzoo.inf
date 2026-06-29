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

/**
 * Si el usuario ingresa solo 4 dígitos (ej. 1000), inferimos la letra CPA según rangos de la tabla.
 * Varios rangos pueden compartir letra; algunos solapan (se prueban todas al cotizar).
 */
const NUMERIC_ONLY_LETTER_RANGES: { min: number; max: number; letters: string[] }[] = [
  { min: 1000, max: 1499, letters: ["C"] },
  /** GBA + BA interior; no incluye 3000+ (otras provincias). */
  { min: 1601, max: 2999, letters: ["B"] },
  { min: 3000, max: 3599, letters: ["S"] },
  { min: 3100, max: 3280, letters: ["E"] },
  { min: 3300, max: 3380, letters: ["N"] },
  { min: 3400, max: 3499, letters: ["W"] },
  { min: 3500, max: 3700, letters: ["H"] },
  { min: 3600, max: 3700, letters: ["P"] },
  { min: 4000, max: 4299, letters: ["T"] },
  { min: 4200, max: 4399, letters: ["G"] },
  { min: 4400, max: 4999, letters: ["A"] },
  { min: 4600, max: 4699, letters: ["Y"] },
  { min: 4700, max: 4999, letters: ["K"] },
  { min: 5000, max: 5899, letters: ["X"] },
  { min: 5400, max: 5499, letters: ["J"] },
  { min: 5500, max: 5599, letters: ["M"] },
  { min: 5700, max: 5880, letters: ["D"] },
  { min: 6300, max: 6380, letters: ["L"] },
  { min: 8100, max: 8500, letters: ["R"] },
  { min: 8300, max: 8400, letters: ["Q"] },
  { min: 9000, max: 9400, letters: ["U"] },
  { min: 9400, max: 9999, letters: ["Z"] },
  { min: 9410, max: 9420, letters: ["V"] },
];

/** Normaliza CP argentino (letras + números, ej. B1643). */
export function normalizeArgentinePostalCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

/** Variantes CPA a probar (con letra explícita o inferida desde solo dígitos). */
export function parseArgentinePostalCodeCandidates(raw: string): ParsedPostalCode[] {
  const normalized = normalizeArgentinePostalCode(raw);

  const cpaMatch = normalized.match(/^([A-Z])(\d{4})/);
  if (cpaMatch) {
    const numeric = Number(cpaMatch[2]);
    if (Number.isFinite(numeric)) return [{ letter: cpaMatch[1], numeric }];
    return [];
  }

  const numMatch = normalized.match(/^(\d{4})$/);
  if (!numMatch) return [];

  const numeric = Number(numMatch[1]);
  if (!Number.isFinite(numeric)) return [];

  const ordered: ParsedPostalCode[] = [];
  const seen = new Set<string>();
  for (const r of NUMERIC_ONLY_LETTER_RANGES) {
    if (numeric < r.min || numeric > r.max) continue;
    for (const letter of r.letters) {
      if (seen.has(letter)) continue;
      seen.add(letter);
      ordered.push({ letter, numeric });
    }
  }
  return ordered;
}

/** Primera variante CPA parseada (compatibilidad). */
export function parseArgentinePostalCode(raw: string): ParsedPostalCode | null {
  return parseArgentinePostalCodeCandidates(raw)[0] ?? null;
}

/** CP válido para cotizar envío. */
export function isValidShippingPostalInput(raw: string): boolean {
  return parseArgentinePostalCodeCandidates(raw).length > 0;
}

/** Formato canónico para guardar (ej. 1000 → C1000). */
export function formatNormalizedPostalCodeForStorage(raw: string): string {
  const normalized = normalizeArgentinePostalCode(raw);
  if (/^[A-Z]\d{4}/.test(normalized)) return normalized.slice(0, 5);
  const candidates = parseArgentinePostalCodeCandidates(raw);
  if (candidates.length && /^\d{4}$/.test(normalized)) {
    return `${candidates[0].letter}${normalized}`;
  }
  return normalized;
}

function inRange(n: number, min: number, max: number): boolean {
  return n >= min && n <= max;
}

function quoteEntregaPropiaForParsed(parsed: ParsedPostalCode): ShippingQuote | null {
  const sorted = [...ENTREGA_PROPIA_RULES].sort((a, b) => b.priority - a.priority);
  for (const rule of sorted) {
    if (!rule.letters.includes(parsed.letter)) continue;
    if (inRange(parsed.numeric, rule.minNumeric, rule.maxNumeric)) {
      return { label: rule.label, costARS: rule.costARS };
    }
  }
  return null;
}

function ruleNumericSpan(minNumeric: number, maxNumeric: number): number {
  return maxNumeric - minNumeric;
}


export function quoteEntregaPropia(raw: string): ShippingQuote | null {
  for (const parsed of parseArgentinePostalCodeCandidates(raw)) {
    const q = quoteEntregaPropiaForParsed(parsed);
    if (q) return q;
  }
  return null;
}

export function quoteCorreoSucursal(raw: string): ShippingQuote | null {
  let best: { quote: ShippingQuote; span: number } | null = null;

  for (const parsed of parseArgentinePostalCodeCandidates(raw)) {
    for (const rule of CORREO_SUCURSAL_RULES) {
      if (rule.letter !== parsed.letter) continue;
      if (!inRange(parsed.numeric, rule.minNumeric, rule.maxNumeric)) continue;

      const span = ruleNumericSpan(rule.minNumeric, rule.maxNumeric);
      const quote = { label: rule.label, costARS: rule.costARS };
      if (!best || span < best.span) best = { quote, span };
    }
  }

  return best?.quote ?? null;
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
