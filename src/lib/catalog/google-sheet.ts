import { parseProductImageUrls, parseVariantImageUrlsByVariant } from "@/lib/catalog/image-urls";
import { parseSheetIsActive } from "@/lib/catalog/sheet-boolean";
import { splitAlignedToSizes } from "@/lib/catalog/variant-extras";
import type { Category, ProductListItem } from "@/types/shop";

export const DEFAULT_SHEET_ID = "1u_Zhj0dOpXNtVnRcYwJSLmvJysbz5gvxc4n5R-FwZJQ";
export const DEFAULT_GID = "0";

export const CATEGORY_COLOR_BY_SLUG: Record<string, string> = {
  bebes: "#C08081",
  "juegos-juguetes-aire-libre": "#1DB40F",
  "juegos-juguetes-aprendizaje-ingenio": "#BC31DE",
  maternidad: "#FFEB5C",
};

/** Orden de filtros alineado al seed de `neon/schema.sql`. */
const CATEGORY_SORT: Record<string, number> = {
  remeras: 1,
  pantalones: 2,
  vestidos: 3,
  bebes: 4,
  "juegos-juguetes-aire-libre": 5,
  "juegos-juguetes-aprendizaje-ingenio": 6,
  maternidad: 7,
};

export type RowMap = Record<string, string>;

export function slugify(s: string) {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }

    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((c) => c.trim().length > 0)) rows.push(row);
      row = [];
      continue;
    }

    cell += ch;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((c) => c.trim().length > 0)) rows.push(row);
  }
  return rows;
}

export function normalizeHeader(raw: string): string {
  return raw.toLowerCase().replace(/\s+/g, "").trim();
}

export function pick(r: RowMap, ...keys: string[]): string {
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "string" && v.trim().length) return v.trim();
  }
  return "";
}

function matrixToRowMaps(matrix: string[][]): RowMap[] {
  if (!matrix.length) return [];
  const headers = matrix[0].map(normalizeHeader);
  const rows: RowMap[] = [];
  for (let i = 1; i < matrix.length; i++) {
    const line = matrix[i];
    const row: RowMap = {};
    for (let c = 0; c < headers.length; c++) {
      if (!headers[c]) continue;
      row[headers[c]] = (line[c] ?? "").trim();
    }
    rows.push(row);
  }
  return rows;
}

/** Una lectura del CSV (URL única para evitar caché/CDN). */
async function fetchSheetRowsOnce(): Promise<RowMap[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID?.trim() || DEFAULT_SHEET_ID;
  const gid = process.env.GOOGLE_SHEET_GID?.trim() || DEFAULT_GID;
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}&t=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("No se pudo leer Google Sheet. Revisá permisos de compartir.");
  }
  const csv = await res.text();
  return matrixToRowMaps(parseCsv(csv));
}

/**
 * Tras editar la hoja, el export CSV público a veces devuelve el snapshot anterior durante ~0,5–2 s.
 * Varios intentos con pausa mejoran que un solo clic de “Actualizar” vea el estado nuevo.
 */
export async function fetchSheetRows(): Promise<RowMap[]> {
  const attemptsParsed = Number.parseInt(process.env.SHEET_EXPORT_FETCH_ATTEMPTS?.trim() ?? "", 10);
  const attempts = Math.min(
    6,
    Math.max(1, Number.isFinite(attemptsParsed) ? attemptsParsed : 3),
  );
  const pauseParsed = Number.parseInt(process.env.SHEET_EXPORT_SETTLE_MS?.trim() ?? "", 10);
  const pauseMs = Math.min(
    3000,
    Math.max(0, Number.isFinite(pauseParsed) ? pauseParsed : 400),
  );

  let rows: RowMap[] = [];
  for (let i = 0; i < attempts; i++) {
    rows = await fetchSheetRowsOnce();
    if (i < attempts - 1 && pauseMs > 0) {
      await new Promise((r) => setTimeout(r, pauseMs));
    }
  }
  return rows;
}

function categorySortOrder(slug: string): number {
  return CATEGORY_SORT[slug] ?? 100;
}

function buildCategory(slugCat: string, color: string | null): Category {
  const hex =
    color && /^#[0-9A-Fa-f]{6}$/.test(color)
      ? color
      : CATEGORY_COLOR_BY_SLUG[slugCat]
        ? CATEGORY_COLOR_BY_SLUG[slugCat]
        : null;
  return {
    id: `cat-${slugCat}`,
    name: titleFromSlug(slugCat),
    slug: slugCat,
    sort_order: categorySortOrder(slugCat),
    color_hex: hex,
  };
}

/**
 * Convierte filas CSV en productos para la tienda (misma semántica que la sync a Neon).
 * Última fila gana si hay slug duplicado.
 */
export function parseRowsToProductListItems(rows: RowMap[]): ProductListItem[] {
  const map = new Map<string, ProductListItem>();

  for (const row of rows) {
    const name = pick(row, "name");
    const slugRaw = pick(row, "slug");
    const slug = slugify(slugRaw || name);
    const description = pick(row, "description", "despription") || null;
    const priceRaw = pick(row, "price");
    const currency = (pick(row, "currency") || "ARS").toUpperCase();
    const isActiveRaw = pick(row, "is_active", "isactive", "is_active");
    const categorySlugRaw = pick(row, "category_slug", "categoryslug");
    const categorySlugsRaw = pick(row, "category_slugs", "categoryslugs");
    const categoryColorRaw = pick(row, "category_color", "categorycolor", "color_hex");
    const sizesRaw = pick(row, "sizes");
    const stocksRaw = pick(row, "stocks");
    const colorProductoRaw = pick(row, "color_producto", "colorproducto");
    const tamanoProductoRaw = pick(
      row,
      "tamaño_producto",
      "tamañoproducto",
      "tamano_producto",
      "tamanoproducto",
    );
    const imageUrlsRaw = pick(row, "image_urls", "imageurls");
    const variantImageUrlsRaw = pick(
      row,
      "variant_image_urls",
      "variantimageurls",
      "variant_image_url",
    );

    if (!name || !slug || !priceRaw) continue;

    const price = Number(priceRaw.replace(",", "."));
    if (!Number.isFinite(price) || price < 0) continue;

    const isActive = parseSheetIsActive(isActiveRaw);
    const categorySlugCandidates = (categorySlugsRaw || categorySlugRaw)
      .split(/[;|,]/)
      .map((s) => slugify(s))
      .filter(Boolean);
    const categorySlugs = [...new Set(categorySlugCandidates)];

    const categoryColor =
      categoryColorRaw && /^#[0-9a-fA-F]{6}$/.test(categoryColorRaw)
        ? categoryColorRaw
        : categorySlugs.length
          ? (CATEGORY_COLOR_BY_SLUG[categorySlugs[0]] ?? null)
          : null;

    const categoriesAll: Category[] = [];
    for (let ci = 0; ci < categorySlugs.length; ci++) {
      const s = categorySlugs[ci];
      const thisColor =
        ci === 0 ? categoryColor : (CATEGORY_COLOR_BY_SLUG[s] ?? null);
      categoriesAll.push(buildCategory(s, thisColor));
    }

    const primaryCat = categoriesAll[0] ?? null;
    const categoryId = primaryCat?.id ?? null;

    const sizes = sizesRaw
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    const stocks = stocksRaw
      .split(";")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n >= 0);

    const productId = `sheet:${slug}`;

    const product_variants: ProductListItem["product_variants"] = [];
    if (sizes.length && stocks.length && sizes.length === stocks.length) {
      const colors = splitAlignedToSizes(sizes.length, colorProductoRaw);
      const tamanos = splitAlignedToSizes(sizes.length, tamanoProductoRaw);
      for (let v = 0; v < sizes.length; v++) {
        product_variants.push({
          id: `${productId}:v:${v}`,
          size_label: sizes[v],
          stock: stocks[v],
          color_producto: colors[v],
          tamano_producto: tamanos[v],
          variant_images: [],
        });
      }

      const variantImageBlocks = parseVariantImageUrlsByVariant(
        variantImageUrlsRaw,
        product_variants.length,
      );
      for (let v = 0; v < product_variants.length; v++) {
        const urls = variantImageBlocks[v] ?? [];
        product_variants[v].variant_images = urls.map((url, im) => ({
          id: `${productId}:v:${v}:img:${im}`,
          url,
          sort_order: im,
        }));
      }
    }

    const imageUrls = parseProductImageUrls(imageUrlsRaw);

    const product_images: ProductListItem["product_images"] = [];
    for (let im = 0; im < imageUrls.length; im++) {
      product_images.push({
        id: `${productId}:img:${im}`,
        url: imageUrls[im],
        sort_order: im,
      });
    }

    const item: ProductListItem = {
      id: productId,
      category_id: categoryId,
      name,
      slug,
      description,
      price,
      currency,
      is_active: isActive,
      categories: primaryCat,
      categories_all: categoriesAll,
      product_images,
      product_variants,
    };

    map.set(slug, item);
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function deriveCategoriesFromProducts(products: ProductListItem[]): Category[] {
  const bySlug = new Map<string, Category>();
  for (const p of products) {
    const list =
      p.categories_all && p.categories_all.length
        ? p.categories_all
        : p.categories
          ? [p.categories]
          : [];
    for (const c of list) {
      if (!bySlug.has(c.slug)) bySlug.set(c.slug, c);
    }
  }
  return [...bySlug.values()].sort(
    (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "es"),
  );
}
