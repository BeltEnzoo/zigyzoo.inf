import type { ProductListItem } from "@/types/shop";

export function collectVariantFacetValues(
  products: ProductListItem[],
  key: "color_producto" | "tamano_producto",
): string[] {
  const set = new Set<string>();
  for (const p of products) {
    for (const v of p.product_variants) {
      const val = v[key]?.trim();
      if (val) set.add(val);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, "es"));
}
