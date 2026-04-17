export type TiendaSearchState = {
  categoria?: string;
  q?: string;
  color?: string;
  tamano?: string;
};

/** Construye `/tienda?...` preservando solo valores no vacíos. */
export function buildTiendaHref(partial: TiendaSearchState): string {
  const sp = new URLSearchParams();
  const cat = partial.categoria?.trim();
  if (cat) sp.set("categoria", cat);
  const q = partial.q?.trim();
  if (q) sp.set("q", q);
  const color = partial.color?.trim();
  if (color) sp.set("color", color);
  const tamano = partial.tamano?.trim();
  if (tamano) sp.set("tamano", tamano);
  const qs = sp.toString();
  return qs ? `/tienda?${qs}` : "/tienda";
}
