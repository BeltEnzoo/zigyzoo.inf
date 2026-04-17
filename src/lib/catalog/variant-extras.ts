/**
 * Listas en la hoja separadas por `;`, alineadas a `sizes` / `stocks`.
 * Un solo segmento (sin otros `;`) se repite para todas las variantes.
 */
export function splitAlignedToSizes(sizesLen: number, raw: string): (string | null)[] {
  if (sizesLen <= 0) return [];
  const t = raw.trim();
  if (!t) return Array.from({ length: sizesLen }, () => null);

  const parts = t.split(";").map((s) => s.trim());

  if (parts.length === 1) {
    const v = parts[0] === "" ? null : parts[0];
    return Array.from({ length: sizesLen }, () => v);
  }

  return Array.from({ length: sizesLen }, (_, i) => {
    if (i >= parts.length) return null;
    const p = parts[i];
    return p === undefined || p === "" ? null : p;
  });
}
