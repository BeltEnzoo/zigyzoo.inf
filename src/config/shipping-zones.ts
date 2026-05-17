/**
 * Envíos **solo vía Correo Argentino** (operativa del negocio). Esta app **no** llama a la API del Correo:
 * los montos son **fijos en código** según zona por prefijo de CP.
 *
 * **Qué usa la web:** código postal normalizado (Argentina: letras + números, ej. `B1643`).
 * Se compara el **inicio del CP** con `prefixes` (prioridad más alta primero). Si no coincide ninguna,
 * aplica `SHIPPING_DEFAULT_ZONE`.
 *
 * Ajustá `costARS` y prefijos cuando cambien tarifas o zonas.
 */
export type ShippingZoneRule = {
  /** Mayor = se evalúa antes (zonas más específicas). */
  priority: number;
  prefixes: string[];
  label: string;
  costARS: number;
};

export const SHIPPING_ZONE_RULES: ShippingZoneRule[] = [
  {
    priority: 30,
    prefixes: ["C10", "C11", "C12", "C13", "C14"],
    label: "CABA",
    costARS: 4500,
  },
  {
    priority: 28,
    prefixes: ["B16", "B17", "B18", "B19"],
    label: "Gran Buenos Aires (norte y oeste)",
    costARS: 5500,
  },
  {
    priority: 26,
    prefixes: ["B0", "B1"],
    label: "Gran Buenos Aires (norte)",
    costARS: 5800,
  },
  {
    priority: 25,
    prefixes: ["B7", "B8"],
    label: "Gran Buenos Aires (sur)",
    costARS: 6000,
  },
  {
    priority: 22,
    prefixes: ["B2", "B3", "B4", "B5", "B6"],
    label: "Buenos Aires (provincia)",
    costARS: 6500,
  },
  {
    priority: 20,
    prefixes: ["S2", "E2", "E3"],
    label: "Litoral (Santa Fe / Entre Ríos)",
    costARS: 7200,
  },
  {
    priority: 18,
    prefixes: ["X5", "X6"],
    label: "Córdoba",
    costARS: 7500,
  },
  {
    priority: 18,
    prefixes: ["M5", "M6"],
    label: "Mendoza y Cuyo",
    costARS: 7800,
  },
  {
    priority: 16,
    prefixes: ["L5", "D5", "F6"],
    label: "Centro y La Pampa",
    costARS: 7800,
  },
  {
    priority: 15,
    prefixes: ["T4", "T5"],
    label: "Tucumán y NOA",
    costARS: 8500,
  },
  {
    priority: 15,
    prefixes: ["A4", "Y4", "J4", "K4"],
    label: "Noroeste (Salta / Jujuy / Santiago)",
    costARS: 8800,
  },
  {
    priority: 14,
    prefixes: ["N3", "W3", "H3", "P3"],
    label: "NEA (Chaco / Corrientes / Misiones)",
    costARS: 9000,
  },
  {
    priority: 12,
    prefixes: ["S3", "S4", "S5"],
    label: "Santa Fe y NEA sur",
    costARS: 8500,
  },
  {
    priority: 10,
    prefixes: ["R8", "R9", "Q8", "U9"],
    label: "Patagonia",
    costARS: 10500,
  },
];

/** Cuando el CP no coincide con ninguna regla anterior. */
export const SHIPPING_DEFAULT_ZONE = {
  label: "Resto del país",
  costARS: 8500,
};
