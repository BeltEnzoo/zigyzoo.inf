import Link from "next/link";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { DemoBanner } from "@/components/shop/DemoBanner";
import { ProductCard } from "@/components/shop/ProductCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getCategories, getProducts, isShopDatabaseConfigured } from "@/data/shop";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ categoria?: string }>;
};

export default async function TiendaPage({ searchParams }: Props) {
  const { categoria } = await searchParams;
  const configured = isShopDatabaseConfigured();
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: categoria }),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8">
          <Link href="/" className="text-sm font-semibold text-brand hover:underline">
            ← Volver al inicio
          </Link>
          <h1 className="mt-4 font-display text-3xl font-bold text-brand sm:text-4xl">
            Tienda
          </h1>
          <p className="mt-2 max-w-2xl text-foreground/85">
            Elegí categoría y explorá el catálogo. Cada producto muestra stock por talle.
          </p>
        </div>

        <DemoBanner />

        {categories.length > 0 && (
          <div className="mb-10">
            <CategoryFilter categories={categories} activeSlug={categoria} />
          </div>
        )}

        {products.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-brand/30 bg-surface-ice/50 px-6 py-16 text-center">
            <p className="text-lg font-medium text-foreground/80">
              No hay productos en esta categoría.
            </p>
            <p className="mt-2 max-w-md text-sm text-foreground/65">
              {configured
                ? "Cargá productos desde el panel o elegí otra categoría."
                : "Probá otra categoría o revisá el filtro."}
            </p>
            {configured && (
              <Link
                href="/admin"
                className="mt-6 text-sm font-semibold text-brand underline"
              >
                Ir al panel
              </Link>
            )}
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
