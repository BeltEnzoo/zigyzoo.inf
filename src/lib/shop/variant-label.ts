/** Etiqueta para selects y carrito: color · tamaño · talle */
export function formatVariantOptionLabel(v: {
  size_label: string;
  color_producto?: string | null;
  tamano_producto?: string | null;
}): string {
  const bits = [v.color_producto, v.tamano_producto, v.size_label]
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean);
  return bits.length ? bits.join(" · ") : v.size_label;
}
