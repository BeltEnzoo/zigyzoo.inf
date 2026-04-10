import type { Category, ProductDetail, ProductListItem } from "@/types/shop";
import { getSql } from "@/lib/db/neon";

type ProductRow = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: string | number;
  currency: string;
  is_active: boolean;
  categories: Category | null;
  categories_all?: Category[];
  product_images: { id: string; url: string; sort_order: number }[];
  product_variants: {
    id: string;
    stock: number;
    size_label: string;
    sort_order?: number;
  }[];
};

function toNum(v: string | number): number {
  return typeof v === "number" ? v : parseFloat(v);
}

function normalizeListRow(r: ProductRow): ProductListItem {
  return {
    id: r.id,
    category_id: r.category_id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    price: toNum(r.price),
    currency: r.currency,
    is_active: r.is_active,
    categories: r.categories,
    categories_all: Array.isArray(r.categories_all) ? r.categories_all : [],
    product_images: Array.isArray(r.product_images) ? r.product_images : [],
    product_variants: Array.isArray(r.product_variants) ? r.product_variants : [],
  };
}

function normalizeDetailRow(r: ProductRow): ProductDetail {
  const images = Array.isArray(r.product_images) ? r.product_images : [];
  const variants = Array.isArray(r.product_variants) ? r.product_variants : [];
  return {
    id: r.id,
    category_id: r.category_id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    price: toNum(r.price),
    currency: r.currency,
    is_active: r.is_active,
    categories: r.categories,
    categories_all: Array.isArray(r.categories_all) ? r.categories_all : [],
    product_images: images.map((i) => ({
      id: i.id,
      product_id: r.id,
      url: i.url,
      sort_order: i.sort_order,
    })),
    product_variants: variants.map((v) => ({
      id: v.id,
      product_id: r.id,
      size_label: v.size_label,
      sku: null,
      stock: v.stock,
      sort_order: typeof v.sort_order === "number" ? v.sort_order : 0,
    })),
  };
}

export async function dbGetCategories(): Promise<Category[]> {
  const sql = getSql()!;
  const rows = await sql`
    select id, name, slug, sort_order, color_hex
    from categories
    order by sort_order asc
  `;
  return rows as Category[];
}

export async function dbGetProducts(opts: {
  categorySlug?: string;
  includeInactive?: boolean;
  q?: string;
}): Promise<ProductListItem[]> {
  const sql = getSql()!;

  let categoryId: string | null = null;
  if (opts.categorySlug) {
    const cats = await sql`
      select id from categories where slug = ${opts.categorySlug} limit 1
    `;
    const c = cats[0] as { id: string } | undefined;
    if (!c) return [];
    categoryId = c.id;
  }

  const includeInactive = Boolean(opts.includeInactive);
  const hasCat = categoryId !== null;
  const q = opts.q?.trim() ?? "";
  const hasQ = q.length > 0;
  const qLike = `%${q}%`;

  const rows = await sql`
    select
      p.id,
      p.category_id,
      p.name,
      p.slug,
      p.description,
      p.price,
      p.currency,
      p.is_active,
      case when c.id is not null then json_build_object(
        'id', c.id::text,
        'name', c.name,
        'slug', c.slug,
        'sort_order', c.sort_order,
        'color_hex', c.color_hex
      ) end as categories,
      coalesce(
        (
          select json_agg(
            json_build_object(
              'id', cx.id::text,
              'name', cx.name,
              'slug', cx.slug,
              'sort_order', cx.sort_order,
              'color_hex', cx.color_hex
            )
            order by cx.sort_order, cx.name
          )
          from product_categories pc
          join categories cx on cx.id = pc.category_id
          where pc.product_id = p.id
        ),
        case when c.id is not null then json_build_array(
          json_build_object(
            'id', c.id::text,
            'name', c.name,
            'slug', c.slug,
            'sort_order', c.sort_order,
            'color_hex', c.color_hex
          )
        ) else '[]'::json end
      ) as categories_all,
      coalesce(
        (
          select json_agg(
            json_build_object('id', i.id::text, 'url', i.url, 'sort_order', i.sort_order)
            order by i.sort_order
          )
          from product_images i where i.product_id = p.id
        ),
        '[]'::json
      ) as product_images,
      coalesce(
        (
          select json_agg(
            json_build_object(
              'id', v.id::text,
              'stock', v.stock,
              'size_label', v.size_label
            )
            order by v.sort_order, v.size_label
          )
          from product_variants v where v.product_id = p.id
        ),
        '[]'::json
      ) as product_variants
    from products p
    left join categories c on c.id = p.category_id
    where (${includeInactive} or p.is_active = true)
      and (
        not ${hasCat}
        or p.category_id = ${categoryId}::uuid
        or exists (
          select 1 from product_categories pc
          where pc.product_id = p.id and pc.category_id = ${categoryId}::uuid
        )
      )
      and (
        not ${hasQ}
        or p.name ilike ${qLike}
        or coalesce(p.description, '') ilike ${qLike}
        or p.slug ilike ${qLike}
      )
    order by p.name asc
  `;

  return (rows as ProductRow[]).map(normalizeListRow);
}

export async function dbGetProductBySlug(
  slug: string,
  includeInactive = false,
): Promise<ProductDetail | null> {
  const sql = getSql()!;
  const rows = await sql`
    select
      p.id,
      p.category_id,
      p.name,
      p.slug,
      p.description,
      p.price,
      p.currency,
      p.is_active,
      case when c.id is not null then json_build_object(
        'id', c.id::text,
        'name', c.name,
        'slug', c.slug,
        'sort_order', c.sort_order,
        'color_hex', c.color_hex
      ) end as categories,
      coalesce(
        (
          select json_agg(
            json_build_object(
              'id', cx.id::text,
              'name', cx.name,
              'slug', cx.slug,
              'sort_order', cx.sort_order,
              'color_hex', cx.color_hex
            )
            order by cx.sort_order, cx.name
          )
          from product_categories pc
          join categories cx on cx.id = pc.category_id
          where pc.product_id = p.id
        ),
        case when c.id is not null then json_build_array(
          json_build_object(
            'id', c.id::text,
            'name', c.name,
            'slug', c.slug,
            'sort_order', c.sort_order,
            'color_hex', c.color_hex
          )
        ) else '[]'::json end
      ) as categories_all,
      coalesce(
        (
          select json_agg(
            json_build_object('id', i.id::text, 'url', i.url, 'sort_order', i.sort_order)
            order by i.sort_order
          )
          from product_images i where i.product_id = p.id
        ),
        '[]'::json
      ) as product_images,
      coalesce(
        (
          select json_agg(
            json_build_object(
              'id', v.id::text,
              'stock', v.stock,
              'size_label', v.size_label,
              'sort_order', v.sort_order
            )
            order by v.sort_order, v.size_label
          )
          from product_variants v where v.product_id = p.id
        ),
        '[]'::json
      ) as product_variants
    from products p
    left join categories c on c.id = p.category_id
    where p.slug = ${slug}
      and (${includeInactive} or p.is_active = true)
    limit 1
  `;

  const r = rows[0] as ProductRow | undefined;
  if (!r) return null;

  const detail = normalizeDetailRow(r);
  detail.product_images = [...detail.product_images].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  detail.product_variants = [...detail.product_variants].sort(
    (a, b) => a.sort_order - b.sort_order || a.size_label.localeCompare(b.size_label),
  );
  return detail;
}
