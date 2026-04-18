"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getCatalogSource, SHEET_CATALOG_TAG } from "@/lib/catalog/catalog-source";
import {
  fetchSheetRows,
  pick,
  slugify,
  titleFromSlug,
  CATEGORY_COLOR_BY_SLUG,
} from "@/lib/catalog/google-sheet";
import { parseProductImageUrls } from "@/lib/catalog/image-urls";
import { splitAlignedToSizes } from "@/lib/catalog/variant-extras";
import { getAdminSession } from "@/lib/auth/session";
import { getSql } from "@/lib/db/neon";

export async function syncProductsFromGoogleSheet() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  if (getCatalogSource() === "sheet") {
    const sql = getSql();
    if (!sql) {
      redirect("/admin/productos?sync=error&detail=Falta+DATABASE_URL");
    }
    const staff = await sql`
      select 1
      from admin_users
      where id = ${session.userId}::uuid and role in ('admin','editor')
      limit 1
    `;
    if (!staff.length) redirect("/admin/login?error=sin_permiso");

    try {
      await fetchSheetRows();
    } catch (e) {
      redirect(
        `/admin/productos?sync=error&detail=${encodeURIComponent(
          e instanceof Error ? e.message : "No se pudo leer la hoja.",
        )}`,
      );
    }

    revalidateTag(SHEET_CATALOG_TAG, "max");
    revalidatePath("/tienda");
    revalidatePath("/admin/productos");
    redirect("/admin/productos?sync=refresh");
  }

  const sql = getSql();
  if (!sql) {
    redirect("/admin/productos?sync=error&detail=Falta+DATABASE_URL");
  }

  const staff = await sql`
    select 1
    from admin_users
    where id = ${session.userId}::uuid and role in ('admin','editor')
    limit 1
  `;
  if (!staff.length) redirect("/admin/login?error=sin_permiso");

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let deleted = 0;
  const errors: string[] = [];
  const processedSlugs = new Set<string>();

  const rows = await fetchSheetRows();
  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2;
    const row = rows[i];

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

    if (!name || !slug || !priceRaw) {
      skipped++;
      continue;
    }

    const price = Number(priceRaw.replace(",", "."));
    if (!Number.isFinite(price) || price < 0) {
      errors.push(`Fila ${rowNum}: precio inválido.`);
      continue;
    }

    const isActive = !["0", "false", "no", "n"].includes(isActiveRaw.toLowerCase());
    const categorySlugCandidates = (categorySlugsRaw || categorySlugRaw)
      .split(/[;|,]/)
      .map((s) => slugify(s))
      .filter(Boolean);
    const categorySlugs = [...new Set(categorySlugCandidates)];
    let categoryId: string | null = null;
    const categoryIds: string[] = [];

    try {
      if (categorySlugs.length) {
        const categoryColor =
          (categoryColorRaw && /^#[0-9a-fA-F]{6}$/.test(categoryColorRaw)
            ? categoryColorRaw
            : CATEGORY_COLOR_BY_SLUG[categorySlugs[0]]) ?? null;

        for (let ci = 0; ci < categorySlugs.length; ci++) {
          const slugCat = categorySlugs[ci];
          const thisColor =
            ci === 0
              ? categoryColor
              : (CATEGORY_COLOR_BY_SLUG[slugCat] ?? null);
          const c = await sql`
            insert into categories (name, slug, color_hex)
            values (${titleFromSlug(slugCat)}, ${slugCat}, ${thisColor})
            on conflict (slug) do update set
              name = excluded.name,
              color_hex = coalesce(excluded.color_hex, categories.color_hex)
            returning id
          `;
          const cid = (c[0] as { id: string } | undefined)?.id ?? null;
          if (cid) {
            if (!categoryId) categoryId = cid;
            categoryIds.push(cid);
          }
        }
      }

      const existing = await sql`select id from products where slug = ${slug} limit 1`;
      if (existing.length) updated++;
      else created++;

      const upserted = await sql`
        insert into products (name, slug, description, price, currency, is_active, category_id, sheet_managed)
        values (${name}, ${slug}, ${description}, ${price}, ${currency}, ${isActive}, ${categoryId}, true)
        on conflict (slug)
        do update set
          name = excluded.name,
          description = excluded.description,
          price = excluded.price,
          currency = excluded.currency,
          is_active = excluded.is_active,
          category_id = excluded.category_id,
          sheet_managed = true
        returning id
      `;
      const productId = (upserted[0] as { id: string } | undefined)?.id;
      if (!productId) {
        errors.push(`Fila ${rowNum}: no se pudo guardar producto.`);
        continue;
      }

      processedSlugs.add(slug);

      const sizes = sizesRaw
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);
      const stocks = stocksRaw
        .split(";")
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n) && n >= 0);

      if (sizes.length && stocks.length && sizes.length === stocks.length) {
        const colors = splitAlignedToSizes(sizes.length, colorProductoRaw);
        const tamanos = splitAlignedToSizes(sizes.length, tamanoProductoRaw);
        await sql`delete from product_variants where product_id = ${productId}::uuid`;
        for (let v = 0; v < sizes.length; v++) {
          await sql`
            insert into product_variants (product_id, size_label, stock, sort_order, color_producto, tamano_producto)
            values (${productId}::uuid, ${sizes[v]}, ${stocks[v]}, ${v}, ${colors[v]}, ${tamanos[v]})
          `;
        }
      }

      await sql`delete from product_categories where product_id = ${productId}::uuid`;
      for (let ci = 0; ci < categoryIds.length; ci++) {
        await sql`
          insert into product_categories (product_id, category_id)
          values (${productId}::uuid, ${categoryIds[ci]}::uuid)
          on conflict do nothing
        `;
      }

      const imageUrls = parseProductImageUrls(imageUrlsRaw);
      if (imageUrls.length) {
        await sql`delete from product_images where product_id = ${productId}::uuid`;
        for (let im = 0; im < imageUrls.length; im++) {
          await sql`
            insert into product_images (product_id, url, sort_order)
            values (${productId}::uuid, ${imageUrls[im]}, ${im})
          `;
        }
      }
    } catch (e) {
      errors.push(`Fila ${rowNum}: ${e instanceof Error ? e.message : "error"}`);
    }
  }

  const shouldPruneSheetOrphans = rows.length === 0 || processedSlugs.size > 0;
  if (shouldPruneSheetOrphans) {
    const keep = rows.length === 0 ? new Set<string>() : processedSlugs;
    const managed = await sql`
      select id, slug from products where sheet_managed = true
    `;
    for (const row of managed as { id: string; slug: string }[]) {
      if (!keep.has(row.slug)) {
        await sql`delete from products where id = ${row.id}::uuid`;
        deleted++;
      }
    }
  }

  revalidatePath("/tienda");
  revalidatePath("/admin/productos");
  redirect(
    `/admin/productos?sync=ok&created=${created}&updated=${updated}&skipped=${skipped}&errors=${errors.length}&deleted=${deleted}`,
  );
}
