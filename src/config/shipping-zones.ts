/**
 * Envíos **solo vía Correo Argentino** (operativa del negocio). Esta app **no** llama a la API del Correo:
 * los montos son **fijos en código** y los definís vos según la tabla de tarifas vigente (Mi Correo / sucursal /
 * convenio comercial) o un redondeo por zona.
 *
 * **Qué usa la web:** el código postal normalizado (Argentina: suele tener letras + números, ej. `B1643`).
 * Se compara el **inicio del CP** con `prefixes` de cada regla (prioridad más alta primero). Si no coincide
 * ninguna, aplica `SHIPPING_DEFAULT_ZONE`.
 *
 * Ajustá `costARS` y prefijos cuando Correo cambie precios o cuando tengas números más precisos por provincia/CP.
 */
export type ShippingZoneRule = {
  /** Mayor = se evalúa antes (zonas más específicas). */
  priority: number;
  /** Ej. CABA suele empezar con C1…; GBA con B16… */
  prefixes: string[];
  label: string;
  /** Monto fijo en ARS (sin centavos fríos; MP acepta decimales si hace falta). */
  costARS: number;
};

/** Reglas ejemplo — reemplazá montos por los que resulten de Correo Argentino (tarifa vigente a tu operación). */
export const SHIPPING_ZONE_RULES: ShippingZoneRule[] = [
  {
    priority: 20,
    prefixes: ["C10", "C11", "C12", "C13", "C14"],
    label: "CABA",
    costARS: 4500,
  },
  {
    priority: 15,
    prefixes: ["B16", "B17", "B18", "B19"],
    label: "Gran Buenos Aires (norte/oeste)",
    costARS: 5500,
  },
  {
    priority: 10,
    prefixes: ["B7", "B8"],
    label: "Gran Buenos Aires (sur)",
    costARS: 6000,
  },
];

/** Cuando el CP no coincide con ninguna regla anterior. */
export const SHIPPING_DEFAULT_ZONE = {
  label: "Resto del país",
  costARS: 8500,
};
