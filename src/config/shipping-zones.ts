/**
 * Tarifas de envío (aprox. 1 kg). Montos = tope alto del rango indicado en la tabla del negocio.
 * CP argentino: letra + 4 dígitos (ej. C1425, B1643). Se compara la parte numérica.
 */

export type EntregaPropiaRule = {
  priority: number;
  /** Letras CPA (C = CABA, B = provincia Buenos Aires / GBA). */
  letters: string[];
  minNumeric: number;
  maxNumeric: number;
  label: string;
  costARS: number;
};

export type CorreoSucursalRule = {
  priority: number;
  letter: string;
  minNumeric: number;
  maxNumeric: number;
  label: string;
  costARS: number;
};

/** Entrega propia — CABA y GBA (modalidad propia). */
export const ENTREGA_PROPIA_RULES: EntregaPropiaRule[] = [
  {
    priority: 60,
    letters: ["B"],
    minNumeric: 1629,
    maxNumeric: 1669,
    label: "Entrega propia — GBA Norte extendida (Pilar/Escobar)",
    costARS: 22000,
  },
  {
    priority: 58,
    letters: ["B"],
    minNumeric: 1885,
    maxNumeric: 1900,
    label: "Entrega propia — GBA Sur (Quilmes → La Plata)",
    costARS: 29000,
  },
  {
    priority: 57,
    letters: ["B"],
    minNumeric: 1878,
    maxNumeric: 1884,
    label: "Entrega propia — GBA Sur (hasta Quilmes)",
    costARS: 25000,
  },
  {
    priority: 55,
    letters: ["B"],
    minNumeric: 1650,
    maxNumeric: 1768,
    label: "Entrega propia — GBA Oeste",
    costARS: 15000,
  },
  {
    priority: 50,
    letters: ["B"],
    minNumeric: 1601,
    maxNumeric: 1649,
    label: "Entrega propia — GBA Norte cercana",
    costARS: 8000,
  },
  {
    priority: 50,
    letters: ["C"],
    minNumeric: 1000,
    maxNumeric: 1499,
    label: "Entrega propia — CABA",
    costARS: 15000,
  },
];

/** Correo Argentino — retiro en sucursal (solo modalidad sucursal; precio = máximo del rango). */
export const CORREO_SUCURSAL_RULES: CorreoSucursalRule[] = [
  {
    priority: 40,
    letter: "B",
    minNumeric: 1901,
    maxNumeric: 7500,
    label: "Correo Argentino (sucursal) — Buenos Aires (interior)",
    costARS: 9000,
  },
  { priority: 30, letter: "X", minNumeric: 5000, maxNumeric: 5899, label: "Correo Argentino (sucursal) — Córdoba", costARS: 10000 },
  { priority: 30, letter: "S", minNumeric: 3000, maxNumeric: 3599, label: "Correo Argentino (sucursal) — Santa Fe", costARS: 10000 },
  { priority: 30, letter: "E", minNumeric: 3100, maxNumeric: 3280, label: "Correo Argentino (sucursal) — Entre Ríos", costARS: 10000 },
  { priority: 28, letter: "M", minNumeric: 5500, maxNumeric: 5599, label: "Correo Argentino (sucursal) — Mendoza", costARS: 11000 },
  { priority: 28, letter: "D", minNumeric: 5700, maxNumeric: 5880, label: "Correo Argentino (sucursal) — San Luis", costARS: 11000 },
  { priority: 28, letter: "L", minNumeric: 6300, maxNumeric: 6380, label: "Correo Argentino (sucursal) — La Pampa", costARS: 11000 },
  { priority: 28, letter: "J", minNumeric: 5400, maxNumeric: 5499, label: "Correo Argentino (sucursal) — San Juan", costARS: 11000 },
  { priority: 26, letter: "T", minNumeric: 4000, maxNumeric: 4299, label: "Correo Argentino (sucursal) — Tucumán", costARS: 12000 },
  { priority: 26, letter: "A", minNumeric: 4400, maxNumeric: 4999, label: "Correo Argentino (sucursal) — Salta", costARS: 12000 },
  { priority: 26, letter: "Y", minNumeric: 4600, maxNumeric: 4699, label: "Correo Argentino (sucursal) — Jujuy", costARS: 12000 },
  { priority: 26, letter: "K", minNumeric: 4700, maxNumeric: 4999, label: "Correo Argentino (sucursal) — Catamarca", costARS: 12000 },
  { priority: 26, letter: "G", minNumeric: 4200, maxNumeric: 4399, label: "Correo Argentino (sucursal) — Santiago del Estero", costARS: 12000 },
  { priority: 26, letter: "H", minNumeric: 3500, maxNumeric: 3700, label: "Correo Argentino (sucursal) — Chaco", costARS: 12000 },
  { priority: 26, letter: "W", minNumeric: 3400, maxNumeric: 3499, label: "Correo Argentino (sucursal) — Corrientes", costARS: 12000 },
  { priority: 26, letter: "N", minNumeric: 3300, maxNumeric: 3380, label: "Correo Argentino (sucursal) — Misiones", costARS: 12000 },
  { priority: 26, letter: "P", minNumeric: 3600, maxNumeric: 3700, label: "Correo Argentino (sucursal) — Formosa", costARS: 12000 },
  { priority: 24, letter: "R", minNumeric: 8100, maxNumeric: 8500, label: "Correo Argentino (sucursal) — Río Negro", costARS: 15000 },
  { priority: 24, letter: "Q", minNumeric: 8300, maxNumeric: 8400, label: "Correo Argentino (sucursal) — Neuquén", costARS: 15000 },
  { priority: 24, letter: "U", minNumeric: 9000, maxNumeric: 9400, label: "Correo Argentino (sucursal) — Chubut", costARS: 15000 },
  { priority: 22, letter: "Z", minNumeric: 9400, maxNumeric: 9999, label: "Correo Argentino (sucursal) — Santa Cruz", costARS: 18000 },
  { priority: 22, letter: "V", minNumeric: 9410, maxNumeric: 9420, label: "Correo Argentino (sucursal) — Tierra del Fuego", costARS: 18000 },
];
