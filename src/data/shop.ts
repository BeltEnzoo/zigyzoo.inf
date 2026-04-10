import {
  dbGetCategories,
  dbGetProductBySlug,
  dbGetProducts,
} from "@/data/shop-db";
import { getMockCategories, getMockProductBySlug, getMockProducts } from "@/data/mock-shop";
import { isNeonConfigured } from "@/lib/db/neon";
import type { Category, ProductDetail, ProductListItem } from "@/types/shop";

export async function getCategories(): Promise<Category[]> {
  if (!isNeonConfigured()) return getMockCategories();
  try {
    return await dbGetCategories();
  } catch (e) {
    console.error("[getCategories]", e);
    return [];
  }
}

type ListOpts = {
  categorySlug?: string;
  includeInactive?: boolean;
  q?: string;
};

export async function getProducts(opts: ListOpts = {}): Promise<ProductListItem[]> {
  if (!isNeonConfigured()) {
    return getMockProducts({ categorySlug: opts.categorySlug, q: opts.q });
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

export { isNeonConfigured as isShopDatabaseConfigured } from "@/lib/db/neon";
