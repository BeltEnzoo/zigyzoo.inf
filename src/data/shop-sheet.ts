import { unstable_cache } from "next/cache";
import {
  SHEET_CATALOG_TAG,
} from "@/lib/catalog/catalog-source";
import {
  deriveCategoriesFromProducts,
  fetchSheetRows,
  parseRowsToProductListItems,
} from "@/lib/catalog/google-sheet";
import type { Category, ProductDetail, ProductListItem } from "@/types/shop";

async function loadSheetCatalog(): Promise<ProductListItem[]> {
  const rows = await fetchSheetRows();
  return parseRowsToProductListItems(rows);
}

const getCachedProducts = unstable_cache(
  async () => loadSheetCatalog(),
  ["zigyzoo-sheet-products"],
  {
    revalidate: Number(process.env.SHEET_CATALOG_REVALIDATE_SECONDS) || 60,
    tags: [SHEET_CATALOG_TAG],
  },
);

export async function sheetGetProducts(opts: {
  categorySlug?: string;
  includeInactive?: boolean;
  q?: string;
  colorProducto?: string;
  tamanoProducto?: string;
}): Promise<ProductListItem[]> {
  let list = await getCachedProducts();
  if (!opts.includeInactive) {
    list = list.filter((p) => p.is_active);
  }
  if (opts.categorySlug) {
    const cat = opts.categorySlug;
    list = list.filter((p) => {
      const all = p.categories_all?.length
        ? p.categories_all
        : p.categories
          ? [p.categories]
          : [];
      return all.some((c) => c.slug === cat);
    });
  }
  const q = opts.q?.trim().toLowerCase() ?? "";
  if (q) {
    list = list.filter((p) => {
      const hay = `${p.name} ${p.slug} ${p.description ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }
  const color = opts.colorProducto?.trim();
  if (color) {
    list = list.filter((p) =>
      p.product_variants.some((v) => (v.color_producto?.trim() ?? "") === color),
    );
  }
  const tam = opts.tamanoProducto?.trim();
  if (tam) {
    list = list.filter((p) =>
      p.product_variants.some((v) => (v.tamano_producto?.trim() ?? "") === tam),
    );
  }
  return list;
}

export async function sheetGetCategories(): Promise<Category[]> {
  const products = await getCachedProducts();
  return deriveCategoriesFromProducts(products);
}

function toDetail(p: ProductListItem): ProductDetail {
  return {
    ...p,
    product_images: p.product_images.map((im) => ({
      id: im.id,
      product_id: p.id,
      url: im.url,
      sort_order: im.sort_order,
    })),
    product_variants: p.product_variants.map((v, i) => ({
      id: v.id,
      product_id: p.id,
      size_label: v.size_label,
      sku: null,
      stock: v.stock,
      sort_order: i,
      color_producto: v.color_producto ?? null,
      tamano_producto: v.tamano_producto ?? null,
      variant_images: v.variant_images ?? [],
    })),
  };
}

export async function sheetGetProductBySlug(
  slug: string,
  includeInactive = false,
): Promise<ProductDetail | null> {
  const products = await getCachedProducts();
  const p = products.find((x) => x.slug === slug);
  if (!p) return null;
  if (!includeInactive && !p.is_active) return null;
  return toDetail(p);
}
