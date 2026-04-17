/**
 * `neon`: catálogo en Postgres (Neon), sync desde Sheet opcional.
 * `sheet`: catálogo solo leyendo la Google Sheet (CSV); no se usan tablas de productos en Neon para la tienda.
 */
export type CatalogSource = "neon" | "sheet";

export function getCatalogSource(): CatalogSource {
  return process.env.SHOP_CATALOG_SOURCE === "sheet" ? "sheet" : "neon";
}

export const SHEET_CATALOG_TAG = "zigyzoo-sheet-catalog";
