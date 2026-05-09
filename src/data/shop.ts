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

const SIMILAR_PRODUCTS_LIMIT = 8;

/**
 * Productos relacionados: mismas categorías que el actual (sin duplicar).
 * Si no hay categorías, completa con otros productos activos del catálogo.
 */
export async function getSimilarProducts(
  product: Pick<ProductDetail, "id" | "categories" | "categories_all">,
  limit = SIMILAR_PRODUCTS_LIMIT,
): Promise<{ products: ProductListItem[]; matchedByCategories: boolean }> {
  const cats =
    product.categories_all && product.categories_all.length > 0
      ? product.categories_all
      : product.categories
        ? [product.categories]
        : [];
  const matchedByCategories = cats.length > 0;

  const seen = new Set<string>();
  const pushUnique = (rows: ProductListItem[], bucket: ProductListItem[]) => {
    for (const p of rows) {
      if (p.id === product.id || seen.has(p.id)) continue;
      seen.add(p.id);
      bucket.push(p);
      if (bucket.length >= limit) return true;
    }
    return false;
  };

  const out: ProductListItem[] = [];

  if (cats.length > 0) {
    const lists = await Promise.all(
      cats.map((c) => getProducts({ categorySlug: c.slug })),
    );
    for (const rows of lists) {
      if (pushUnique(rows, out)) {
        return { products: out.slice(0, limit), matchedByCategories: true };
      }
    }
  }

  if (out.length < limit) {
    const rest = await getProducts({});
    pushUnique(rest, out);
  }

  return { products: out.slice(0, limit), matchedByCategories };
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
