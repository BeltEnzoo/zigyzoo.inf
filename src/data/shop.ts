import {
  dbGetCategories,
  dbGetProductBySlug,
  dbGetProducts,
} from "@/data/shop-db";
import { getMockCategories, getMockProductBySlug, getMockProducts } from "@/data/mock-shop";
import {
  sheetGetCategories,
  sheetGetProductBySlug,
  sheetGetProducts,
} from "@/data/shop-sheet";
import { getCatalogSource } from "@/lib/catalog/catalog-source";
import { isNeonConfigured } from "@/lib/db/neon";
import type { Category, ProductDetail, ProductListItem } from "@/types/shop";

export async function getCategories(): Promise<Category[]> {
  if (getCatalogSource() === "sheet") {
    try {
      return await sheetGetCategories();
    } catch (e) {
      console.error("[getCategories/sheet]", e);
      return [];
    }
  }
  if (!isNeonConfigured()) return getMockCategories();
  try {
    return await dbGetCategories();
  } catch (e) {
    console.error("[getCategories]", e);
    return [];
  }
}

export type ListOpts = {
  categorySlug?: string;
  includeInactive?: boolean;
  q?: string;
  colorProducto?: string;
  tamanoProducto?: string;
};

export async function getProducts(opts: ListOpts = {}): Promise<ProductListItem[]> {
  if (getCatalogSource() === "sheet") {
    try {
      return await sheetGetProducts(opts);
    } catch (e) {
      console.error("[getProducts/sheet]", e);
      return [];
    }
  }
  if (!isNeonConfigured()) {
    return getMockProducts({
      categorySlug: opts.categorySlug,
      q: opts.q,
      colorProducto: opts.colorProducto,
      tamanoProducto: opts.tamanoProducto,
    });
  }
  try {
    return await dbGetProducts(opts);
  } catch (e) {
    console.error("[getProducts]", e);
    return [];
  }
}

export async function getProductBySlug(
  slug: string,
  includeInactive = false,
): Promise<ProductDetail | null> {
  if (getCatalogSource() === "sheet") {
    try {
      const row = await sheetGetProductBySlug(slug, includeInactive);
      if (!row) return null;
      if (!includeInactive && !row.is_active) return null;
      return row;
    } catch (e) {
      console.error("[getProductBySlug/sheet]", e);
      return null;
    }
  }
  if (!isNeonConfigured()) {
    return getMockProductBySlug(slug);
  }
  try {
    const row = await dbGetProductBySlug(slug, includeInactive);
    if (!row) return null;
    if (!includeInactive && !row.is_active) return null;
    return row;
  } catch (e) {
    console.error("[getProductBySlug]", e);
    return null;
  }
}

/** Tienda con datos reales: Sheet o Neon según `SHOP_CATALOG_SOURCE`, o mock si no hay Neon en modo catálogo DB. */
export function isShopDatabaseConfigured(): boolean {
  if (getCatalogSource() === "sheet") {
    return true;
  }
  return isNeonConfigured();
}

export { isNeonConfigured } from "@/lib/db/neon";
