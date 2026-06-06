/**
 * Varias URLs en una celda de `image_urls`, separadas por `|` o `;`
 * (misma convención que tallas/stock; `|` sigue siendo válido).
 */
export function parseProductImageUrls(raw: string): string[] {
  return raw
    .trim()
    .split(/[|;]/)
    .map((s) => s.trim())
    .filter((s) => s.startsWith("http://") || s.startsWith("https://"));
}

/**
 * Fotos por variante en columna `variant_image_urls`:
 * - Entre variantes: `;` (misma lógica que sizes / color_producto)
 * - Dentro de una variante: `|` o `;` entre URLs
 */
export function parseVariantImageUrlsByVariant(raw: string, variantCount: number): string[][] {
  if (variantCount <= 0) return [];

  const t = raw.trim();
  if (!t) return Array.from({ length: variantCount }, () => []);

  const blocks = t.split(";").map((s) => s.trim());

  if (blocks.length === 1 && variantCount > 1) {
    const urls = parseProductImageUrls(blocks[0]);
    return Array.from({ length: variantCount }, (_, i) => (i === 0 ? urls : []));
  }

  return Array.from({ length: variantCount }, (_, i) => {
    const block = i < blocks.length ? blocks[i] : "";
    return parseProductImageUrls(block);
  });
}
