"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { getSql } from "@/lib/db/neon";

type RowMap = Record<string, string>;

const DEFAULT_SHEET_ID = "1u_Zhj0dOpXNtVnRcYwJSLmvJysbz5gvxc4n5R-FwZJQ";
const DEFAULT_GID = "0";

function slugify(s: string) {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseCsv(text: string): string[][] {
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

function normalizeHeader(raw: string): string {
  return raw.toLowerCase().replace(/\s+/g, "").trim();
}

function pick(r: RowMap, ...keys: string[]): string {
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "string" && v.trim().length) return v.trim();
  }
  return "";
}

async function fetchSheetRows(): Promise<RowMap[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID?.trim() || DEFAULT_SHEET_ID;
  const gid = process.env.GOOGLE_SHEET_GID?.trim() || DEFAULT_GID;
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("No se pudo leer Google Sheet. Revisá permisos de compartir.");
  }
  const csv = await res.text();
  const matrix = parseCsv(csv);
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

export async function syncProductsFromGoogleSheet() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

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
  const errors: string[] = [];

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
    const sizesRaw = pick(row, "sizes");
    const stocksRaw = pick(row, "stocks");
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
    const categorySlug = categorySlugRaw ? slugify(categorySlugRaw) : "";
    let categoryId: string | null = null;

    try {
      if (categorySlug) {
        const c = await sql`
          insert into categories (name, slug)
          values (${titleFromSlug(categorySlug)}, ${categorySlug})
          on conflict (slug) do update set name = excluded.name
          returning id
        `;
        categoryId = (c[0] as { id: string } | undefined)?.id ?? null;
      }

      const existing = await sql`select id from products where slug = ${slug} limit 1`;
      if (existing.length) updated++;
      else created++;

      const upserted = await sql`
        insert into products (name, slug, description, price, currency, is_active, category_id)
        values (${name}, ${slug}, ${description}, ${price}, ${currency}, ${isActive}, ${categoryId})
        on conflict (slug)
        do update set
          name = excluded.name,
          description = excluded.description,
          price = excluded.price,
          currency = excluded.currency,
          is_active = excluded.is_active,
          category_id = excluded.category_id
        returning id
      `;
      const productId = (upserted[0] as { id: string } | undefined)?.id;
      if (!productId) {
        errors.push(`Fila ${rowNum}: no se pudo guardar producto.`);
        continue;
      }

      const sizes = sizesRaw
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);
      const stocks = stocksRaw
        .split(";")
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n) && n >= 0);

      if (sizes.length && stocks.length && sizes.length === stocks.length) {
        await sql`delete from product_variants where product_id = ${productId}::uuid`;
        for (let v = 0; v < sizes.length; v++) {
          await sql`
            insert into product_variants (product_id, size_label, stock, sort_order)
            values (${productId}::uuid, ${sizes[v]}, ${stocks[v]}, ${v})
          `;
        }
      }

      const imageUrls = imageUrlsRaw
        .split("|")
        .map((s) => s.trim())
        .filter((s) => s.startsWith("http://") || s.startsWith("https://"));
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

  revalidatePath("/tienda");
  revalidatePath("/admin/productos");
  redirect(
    `/admin/productos?sync=ok&created=${created}&updated=${updated}&skipped=${skipped}&errors=${errors.length}`,
  );
}

