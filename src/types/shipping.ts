/** Forma de envío elegida en el checkout. */
export type ShippingMethod = "entrega_propia" | "correo_sucursal" | "coordinar";

export const SHIPPING_COORDINAR_LABEL = "A coordinar con la tienda";

export const SHIPPING_ENTREGA_PROPIA_TITLE = "Entrega propia (CABA / GBA)";
export const SHIPPING_CORREO_SUCURSAL_TITLE = "Correo Argentino — sucursal";

/** Valores legacy en carritos persistidos o filas viejas de Neon. */
export function normalizeShippingMethod(raw: string | null | undefined): ShippingMethod {
  if (raw === "entrega_propia" || raw === "correo_sucursal" || raw === "coordinar") {
    return raw;
  }
  if (raw === "correo") return "correo_sucursal";
  return "correo_sucursal";
}
