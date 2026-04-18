import Link from "next/link";
import { ProductCardAdd } from "@/components/shop/ProductCardAdd";
import { ProductCardDescription } from "@/components/shop/ProductCardDescription";
import { formatMoney } from "@/lib/format";
import { productImageFrameClass, productImageImgClass } from "@/lib/shop/product-image-spec";
import type { ProductListItem } from "@/types/shop";

function totalStock(p: ProductListItem) {
  return (p.product_variants ?? []).reduce((s, v) => s + (v.stock ?? 0), 0);
}

function firstImage(p: ProductListItem) {
  const imgs = [...(p.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  return imgs[0]?.url ?? null;
}

/** Texto normalizado para el extracto bajo la foto. */
function cleanDescription(raw: string | null | undefined) {
  if (!raw?.trim()) return null;
  return raw.replace(/\s+/g, " ").trim();
}

export function ProductCard({ product }: { product: ProductListItem }) {
  const img = firstImage(product);
  const stock = totalStock(product);
  const available = stock > 0;
  const categoryList =
    product.categories_all && product.categories_all.length
      ? product.categories_all
      : product.categories
        ? [product.categories]
        : [];

  const descriptionPreview = cleanDescription(product.description);

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition hover:shadow-md">
      <Link
        href={`/tienda/${product.slug}`}
        className={`block rounded-t-3xl ${productImageFrameClass}`}
      >
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element -- URLs externas arbitrarias
          <img
            src={img}
            alt=""
            className={`${productImageImgClass} transition duration-300 group-hover:scale-[1.02]`}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-foreground/40">
            Sin foto
          </div>
        )}
        {!available && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
            Sin stock
          </span>
        )}
      </Link>
      {descriptionPreview && <ProductCardDescription text={descriptionPreview} />}
      <div className="flex flex-1 flex-col p-4">
        {categoryList.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {categoryList.slice(0, 2).map((cat) => (
              <p
                key={cat.id}
                className="inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                style={
                  cat.color_hex && /^#[0-9a-fA-F]{6}$/.test(cat.color_hex)
                    ? { color: cat.color_hex, border: `1px solid ${cat.color_hex}55` }
                    : undefined
                }
              >
                {cat.name}
              </p>
            ))}
          </div>
        )}
        <Link href={`/tienda/${product.slug}`}>
          <h2 className="mt-1 font-display text-lg font-bold text-brand">{product.name}</h2>
        </Link>
        <p className="mt-2 text-lg font-bold text-foreground">{formatMoney(product.price, product.currency)}</p>
        <p className="mt-1 text-xs text-foreground/60">
          {available ? `${stock} u. disponibles` : "Agotado"}
        </p>
        <ProductCardAdd product={product} imageUrl={img} />
      </div>
    </article>
  );
}
