import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
import type { ProductListItem } from "@/types/shop";

type Props = {
  products: ProductListItem[];
  /** Si hay categorías en el producto actual se muestra este texto; si no, el alternativo. */
  matchedByCategories: boolean;
};

export function SimilarProductsSection({ products, matchedByCategories }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-black/5 pt-12" aria-labelledby="similar-products-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="similar-products-heading" className="font-display text-2xl font-bold text-brand sm:text-3xl">
            Productos similares
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-foreground/70">
            {matchedByCategories
              ? "Otras opciones en las mismas categorías que este producto."
              : "Otros productos del catálogo que podrían interesarte."}
          </p>
        </div>
        <Link
          href="/tienda"
          className="shrink-0 text-sm font-semibold text-brand underline-offset-2 hover:underline"
        >
          Ver toda la tienda
        </Link>
      </div>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
