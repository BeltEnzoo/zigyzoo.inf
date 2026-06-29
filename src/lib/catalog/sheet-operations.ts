import { slugify, pick } from "@/lib/catalog/google-sheet";
import {
  batchUpdateSheetCells,
  appendSheetRow,
  fetchSheetGrid,
  pickHeaderIndex,
  rowToMap,
} from "@/lib/catalog/google-sheets-write";
import { isGoogleSheetsWriteConfigured } from "@/lib/catalog/sheet-config";
import type { StoredOrderLine } from "@/types/checkout-order";

export type { StoredOrderLine };

export function parseVariantIndex(variantId: string): number | null {
  const m = variantId.match(/:v:(\d+)$/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

function splitSemicolonList(raw: string): string[] {
  return raw.split(";").map((s) => s.trim());
}

function joinSemicolonList(parts: string[]): string {
  return parts.join(";");
}

/** Resta stock en la Google Sheet por cada línea de un pedido web aprobado. */
export async function decrementSheetStockForOrder(
  lines: StoredOrderLine[],
): Promise<{ ok: true; updated: number } | { ok: false; error: string }> {
  if (!isGoogleSheetsWriteConfigured()) {
    return {
      ok: false,
      error:
        "Falta configurar GOOGLE_SERVICE_ACCOUNT_EMAIL y GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY para actualizar stock.",
    };
  }

  if (!lines.length) return { ok: true, updated: 0 };

  try {
    const grid = await fetchSheetGrid();
    const slugCol = pickHeaderIndex(grid, "slug");
    const stocksCol = pickHeaderIndex(grid, "stocks");
    if (slugCol < 0 || stocksCol < 0) {
      return { ok: false, error: "La hoja no tiene columnas slug o stocks." };
    }

    const updates: { row1Based: number; colIndex: number; value: string }[] = [];

    for (const line of lines) {
      const rowIdx = grid.rows.findIndex((r) => {
        const map = rowToMap(grid, r);
        const rowSlug = slugify(pick(map, "slug") || pick(map, "name"));
        return rowSlug === line.slug;
      });
      if (rowIdx < 0) {
        console.warn("[decrementSheetStock] slug no encontrado:", line.slug);
        continue;
      }

      const row = grid.rows[rowIdx];
      const stocksRaw = String(row[stocksCol] ?? "").trim();
      const stocks = splitSemicolonList(stocksRaw).map((s) => {
        const n = Number(s);
        return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
      });

      if (line.variantIndex >= stocks.length) {
        console.warn(
          "[decrementSheetStock] índice de variante fuera de rango",
          line.slug,
          line.variantIndex,
        );
        continue;
      }

      stocks[line.variantIndex] = Math.max(0, stocks[line.variantIndex] - line.quantity);
      updates.push({
        row1Based: grid.dataRowNumbers[rowIdx],
        colIndex: stocksCol,
        value: joinSemicolonList(stocks.map(String)),
      });
    }

    await batchUpdateSheetCells(grid.sheetTitle, updates);
    return { ok: true, updated: updates.length };
  } catch (e) {
    console.error("[decrementSheetStockForOrder]", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo actualizar el stock en la hoja.",
    };
  }
}

/** Actualiza talles y stock de un producto en la Google Sheet (por slug). */
export async function updateSheetProductVariants(
  slug: string,
  variants: { sizeLabel: string; stock: number }[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isGoogleSheetsWriteConfigured()) {
    return {
      ok: false,
      error:
        "Falta configurar GOOGLE_SERVICE_ACCOUNT_EMAIL y GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY para actualizar stock.",
    };
  }

  if (!variants.length) {
    return { ok: false, error: "Agregá al menos un talle con stock." };
  }

  const seenSizes = new Set<string>();
  for (let i = 0; i < variants.length; i++) {
    const sizeLabel = variants[i].sizeLabel.trim();
    const stock = variants[i].stock;
    if (!sizeLabel) {
      return { ok: false, error: `Fila ${i + 1}: el talle no puede estar vacío.` };
    }
    const key = sizeLabel.toLowerCase();
    if (seenSizes.has(key)) {
      return { ok: false, error: `El talle "${sizeLabel}" está repetido.` };
    }
    seenSizes.add(key);
    if (!Number.isInteger(stock) || stock < 0) {
      return { ok: false, error: `Talle ${sizeLabel}: el stock debe ser un entero ≥ 0.` };
    }
  }

  try {
    const grid = await fetchSheetGrid();
    const slugCol = pickHeaderIndex(grid, "slug");
    const stocksCol = pickHeaderIndex(grid, "stocks");
    const sizesCol = pickHeaderIndex(grid, "sizes");
    if (slugCol < 0 || stocksCol < 0) {
      return { ok: false, error: "La hoja no tiene columnas slug o stocks." };
    }
    if (sizesCol < 0) {
      return { ok: false, error: "La hoja no tiene columna sizes para guardar talles." };
    }

    const normalizedSlug = slugify(slug);
    const rowIdx = grid.rows.findIndex((r) => {
      const map = rowToMap(grid, r);
      return slugify(pick(map, "slug") || pick(map, "name")) === normalizedSlug;
    });
    if (rowIdx < 0) {
      return { ok: false, error: "Producto no encontrado en la Google Sheet." };
    }

    const sizesValue = joinSemicolonList(variants.map((v) => v.sizeLabel.trim()));
    const stocksValue = joinSemicolonList(variants.map((v) => String(v.stock)));

    await batchUpdateSheetCells(grid.sheetTitle, [
      {
        row1Based: grid.dataRowNumbers[rowIdx],
        colIndex: sizesCol,
        value: sizesValue,
      },
      {
        row1Based: grid.dataRowNumbers[rowIdx],
        colIndex: stocksCol,
        value: stocksValue,
      },
    ]);

    return { ok: true };
  } catch (e) {
    console.error("[updateSheetProductVariants]", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo actualizar talles y stock en la hoja.",
    };
  }
}

/** @deprecated Usar updateSheetProductVariants */
export async function updateSheetProductStocks(
  slug: string,
  stocks: number[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isGoogleSheetsWriteConfigured()) {
    return {
      ok: false,
      error:
        "Falta configurar GOOGLE_SERVICE_ACCOUNT_EMAIL y GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY para actualizar stock.",
    };
  }

  try {
    const grid = await fetchSheetGrid();
    const sizesCol = pickHeaderIndex(grid, "sizes");
    const normalizedSlug = slugify(slug);
    const rowIdx = grid.rows.findIndex((r) => {
      const map = rowToMap(grid, r);
      return slugify(pick(map, "slug") || pick(map, "name")) === normalizedSlug;
    });
    if (rowIdx < 0) {
      return { ok: false, error: "Producto no encontrado en la Google Sheet." };
    }
    const row = grid.rows[rowIdx];
    const sizes = sizesCol >= 0
      ? splitSemicolonList(String(row[sizesCol] ?? "")).filter(Boolean)
      : stocks.map((_, i) => String(i + 1));
    if (sizes.length !== stocks.length) {
      return {
        ok: false,
        error: `El producto tiene ${sizes.length} talle(s); enviaste ${stocks.length} stocks.`,
      };
    }
    return updateSheetProductVariants(
      slug,
      sizes.map((sizeLabel, i) => ({ sizeLabel, stock: stocks[i] })),
    );
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo actualizar el stock.",
    };
  }
}

export type PriceAdjustScope = { type: "all" } | { type: "category"; categorySlug: string };

export type PriceAdjustPreviewRow = {
  slug: string;
  name: string;
  oldPrice: number;
  newPrice: number;
};

/** Vista previa del ajuste de precios (no escribe en la hoja). */
export async function previewSheetPriceAdjustment(
  percent: number,
  scope: PriceAdjustScope,
): Promise<
  | { ok: true; rows: PriceAdjustPreviewRow[] }
  | { ok: false; error: string }
> {
  if (!Number.isFinite(percent) || percent < -90 || percent > 500) {
    return { ok: false, error: "Porcentaje inválido (entre -90 y 500)." };
  }

  try {
    const grid = await fetchSheetGrid();
    const priceCol = pickHeaderIndex(grid, "price");
    const slugCol = pickHeaderIndex(grid, "slug");
    const nameCol = pickHeaderIndex(grid, "name");
    const catCol = pickHeaderIndex(grid, "category_slug", "categoryslug");
    const catsCol = pickHeaderIndex(grid, "category_slugs", "categoryslugs");
    if (priceCol < 0) return { ok: false, error: "La hoja no tiene columna price." };

    const factor = 1 + percent / 100;
    const rows: PriceAdjustPreviewRow[] = [];

    for (const row of grid.rows) {
      const map = rowToMap(grid, row);
      if (!matchesPriceScope(map, scope, catCol, catsCol)) continue;

      const priceRaw = String(row[priceCol] ?? "").replace(",", ".").trim();
      const oldPrice = Number(priceRaw);
      if (!Number.isFinite(oldPrice) || oldPrice < 0) continue;

      const newPrice = Math.max(0, Math.round(oldPrice * factor));
      if (newPrice === oldPrice) continue;

      rows.push({
        slug: slugCol >= 0 ? String(row[slugCol] ?? "").trim() : "",
        name: nameCol >= 0 ? String(row[nameCol] ?? "").trim() : "",
        oldPrice,
        newPrice,
      });
    }

    return { ok: true, rows };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo leer la hoja.",
    };
  }
}

export async function applySheetPriceAdjustment(
  percent: number,
  scope: PriceAdjustScope,
): Promise<
  | { ok: true; updated: number }
  | { ok: false; error: string }
> {
  if (!isGoogleSheetsWriteConfigured()) {
    return {
      ok: false,
      error: "Falta la cuenta de servicio de Google para escribir en la hoja.",
    };
  }

  const preview = await previewSheetPriceAdjustment(percent, scope);
  if (!preview.ok) return preview;
  if (preview.rows.length === 0) return { ok: true, updated: 0 };

  try {
    const grid = await fetchSheetGrid();
    const priceCol = pickHeaderIndex(grid, "price");
    const slugCol = pickHeaderIndex(grid, "slug");
    const nameCol = pickHeaderIndex(grid, "name");
    const catCol = pickHeaderIndex(grid, "category_slug", "categoryslug");
    const catsCol = pickHeaderIndex(grid, "category_slugs", "categoryslugs");
    const factor = 1 + percent / 100;

    const updates: { row1Based: number; colIndex: number; value: string }[] = [];

    for (let i = 0; i < grid.rows.length; i++) {
      const row = grid.rows[i];
      const map = rowToMap(grid, row);
      if (!matchesPriceScope(map, scope, catCol, catsCol)) continue;

      const priceRaw = String(row[priceCol] ?? "").replace(",", ".").trim();
      const oldPrice = Number(priceRaw);
      if (!Number.isFinite(oldPrice) || oldPrice < 0) continue;

      const newPrice = Math.max(0, Math.round(oldPrice * factor));
      if (newPrice === oldPrice) continue;

      updates.push({
        row1Based: grid.dataRowNumbers[i],
        colIndex: priceCol,
        value: String(newPrice),
      });
    }

    await batchUpdateSheetCells(grid.sheetTitle, updates);
    return { ok: true, updated: updates.length };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudieron actualizar los precios.",
    };
  }
}

function matchesPriceScope(
  map: Record<string, string>,
  scope: PriceAdjustScope,
  catCol: number,
  catsCol: number,
): boolean {
  if (scope.type === "all") return true;
  const target = slugify(scope.categorySlug);
  const primary = slugify(pick(map, "category_slug", "categoryslug"));
  if (primary === target) return true;
  const multi = pick(map, "category_slugs", "categoryslugs")
    .split(/[;|,]/)
    .map((s) => slugify(s))
    .filter(Boolean);
  return multi.includes(target);
}

export type AppendSheetProductInput = {
  name: string;
  slug: string;
  description: string;
  price: number;
  categorySlug: string;
  extraCategorySlugs?: string[];
  sizes: string[];
  stocks: number[];
  colors?: string[];
  imageUrls: string[];
  isActive?: boolean;
};

export async function appendSheetProductRow(
  input: AppendSheetProductInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isGoogleSheetsWriteConfigured()) {
    return { ok: false, error: "Falta la cuenta de servicio de Google." };
  }
  if (input.sizes.length === 0 || input.sizes.length !== input.stocks.length) {
    return { ok: false, error: "Talles y stocks deben tener la misma cantidad." };
  }

  try {
    const grid = await fetchSheetGrid();
    const colCount = Math.max(grid.headers.length, 15);
    const row = Array.from({ length: colCount }, () => "");

    const set = (key: string, value: string) => {
      const idx = grid.headerIndex.get(key);
      if (idx !== undefined) row[idx] = value;
    };

    const categorySlugs = [
      input.categorySlug,
      ...(input.extraCategorySlugs ?? []),
    ]
      .map((s) => slugify(s))
      .filter(Boolean);
    const uniqueCats = [...new Set(categorySlugs)];

    set("name", input.name);
    set("slug", input.slug);
    set("description", input.description);
    set("price", String(Math.round(input.price)));
    set("currency", "ARS");
    set("is_active", input.isActive === false ? "FALSO" : "VERDADERO");
    set("category_slug", uniqueCats[0] ?? "");
    set("category_slugs", uniqueCats.join("; "));
    set("sizes", joinSemicolonList(input.sizes));
    set("stocks", joinSemicolonList(input.stocks.map(String)));
    if (input.colors?.length) {
      set("color_producto", joinSemicolonList(input.colors));
    }
    if (input.imageUrls.length) {
      set("image_urls", input.imageUrls.join(";"));
      set("images", input.imageUrls.join(";"));
    }

    await appendSheetRow(grid.sheetTitle, row);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo agregar el producto a la hoja.",
    };
  }
}
