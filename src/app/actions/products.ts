"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getCategories } from "@/data/shop";
import { getCatalogSource, SHEET_CATALOG_TAG } from "@/lib/catalog/catalog-source";
import { parseProductImageUrls } from "@/lib/catalog/image-urls";
import { appendSheetProductRow } from "@/lib/catalog/sheet-operations";
import { isGoogleSheetsWriteConfigured } from "@/lib/catalog/sheet-config";
import { slugify } from "@/lib/catalog/google-sheet";
import { getAdminSession } from "@/lib/auth/session";
import { getSql } from "@/lib/db/neon";

export type CreateProductResult = { ok: true } | { ok: false; error: string };

export async function createProduct(formData: FormData): Promise<CreateProductResult> {
  const session = await getAdminSession();
  if (!session) return { ok: false, error: "No autorizado." };

  const sql = getSql();
  if (!sql) return { ok: false, error: "Base de datos no configurada." };

  const staff = await sql`
    select 1 as ok
    from admin_users
    where id = ${session.userId}::uuid and role in ('admin', 'editor')
    limit 1
  `;
  if (!staff.length) return { ok: false, error: "Sin permiso." };

  const name = String(formData.get("name") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const categoryIdRaw = String(formData.get("category_id") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageBlock = String(formData.get("image_urls") ?? "").trim();
  const variantBlock = String(formData.get("variants") ?? "").trim();

  if (!name) return { ok: false, error: "Nombre obligatorio." };
  if (!slug) slug = slugify(name);
  else slug = slugify(slug);

  const price = Number(priceRaw.replace(",", "."));
  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, error: "Precio inválido." };
  }

  const imageUrls = imageBlock
    .split(/\r?\n/)
    .flatMap((l) => parseProductImageUrls(l));

  const variantLines = variantBlock.split(/\r?\n/).filter((l) => l.trim());
  if (variantLines.length === 0) {
    return { ok: false, error: "Cargá al menos una variante (talle, stock)." };
  }

  const sizes: string[] = [];
  const stocks: number[] = [];
  for (let i = 0; i < variantLines.length; i++) {
    const line = variantLines[i];
    const parts = line.split(/[,;]/).map((p) => p.trim());
    if (parts.length < 2) {
      return { ok: false, error: `Línea ${i + 1}: usá formato Talle, stock (ej: 6, 10).` };
    }
    const size_label = parts[0];
    const stock = Number(parts[1]);
    if (!size_label) return { ok: false, error: `Línea ${i + 1}: talle vacío.` };
    if (!Number.isInteger(stock) || stock < 0) {
      return { ok: false, error: `Línea ${i + 1}: stock debe ser un entero ≥ 0.` };
    }
    sizes.push(size_label);
    stocks.push(stock);
  }

  if (getCatalogSource() === "sheet") {
    if (!isGoogleSheetsWriteConfigured()) {
      return {
        ok: false,
        error:
          "Para crear productos en la hoja configurá la cuenta de servicio de Google y compartí la Sheet como Editor.",
      };
    }

    let categorySlug = "";
    if (categoryIdRaw) {
      const categories = await getCategories();
      const cat = categories.find((c) => c.id === categoryIdRaw);
      categorySlug = cat?.slug ?? (categoryIdRaw.startsWith("cat-") ? categoryIdRaw.slice(4) : "");
    }

    const sheetResult = await appendSheetProductRow({
      name,
      slug,
      description,
      price,
      categorySlug,
      sizes,
      stocks,
      imageUrls,
    });
    if (!sheetResult.ok) return sheetResult;

    revalidateTag(SHEET_CATALOG_TAG, "max");
    revalidatePath("/tienda");
    revalidatePath("/admin/productos");
    return { ok: true };
  }

  const categoryId = categoryIdRaw || null;
  const desc = description || null;
  const variants = sizes.map((size_label, i) => ({
    size_label,
    stock: stocks[i],
    sort_order: i,
  }));

  let productId: string;
  try {
    const rows = await sql`
      insert into products (name, slug, description, price, category_id, is_active, sheet_managed)
      values (${name}, ${slug}, ${desc}, ${price}, ${categoryId}, true, false)
      returning id
    `;
    const row = rows[0] as { id: string } | undefined;
    if (!row) return { ok: false, error: "No se pudo crear el producto." };
    productId = row.id;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      error: msg.includes("unique") ? "Ese slug ya existe. Elegí otro." : msg,
    };
  }

  try {
    for (const v of variants) {
      await sql`
        insert into product_variants (product_id, size_label, stock, sort_order, color_producto, tamano_producto)
        values (${productId}::uuid, ${v.size_label}, ${v.stock}, ${v.sort_order}, null, null)
      `;
    }
    if (imageUrls.length > 0) {
      for (let i = 0; i < imageUrls.length; i++) {
        await sql`
          insert into product_images (product_id, url, sort_order)
          values (${productId}::uuid, ${imageUrls[i]}, ${i})
        `;
      }
    }
  } catch (e) {
    await sql`delete from products where id = ${productId}::uuid`;
    return { ok: false, error: e instanceof Error ? e.message : "Error al guardar variantes o imágenes." };
  }

  revalidatePath("/tienda");
  revalidatePath(`/tienda/${slug}`);
  revalidatePath("/admin/productos");
  return { ok: true };
}
