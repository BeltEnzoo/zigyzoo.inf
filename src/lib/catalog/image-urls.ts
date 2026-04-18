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
