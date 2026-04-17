import Link from "next/link";
import { Suspense } from "react";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { DemoBanner } from "@/components/shop/DemoBanner";
import { ProductCard } from "@/components/shop/ProductCard";
import { VariantAttributeFilters } from "@/components/shop/VariantAttributeFilters";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getCategories, getProducts, isShopDatabaseConfigured } from "@/data/shop";
import { buildTiendaHref } from "@/lib/shop/tienda-href";
import { collectVariantFacetValues } from "@/lib/shop/variant-facets";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ categoria?: string; q?: string; color?: string; tamano?: string }>;
};

export default async function TiendaPage({ searchParams }: Props) {
  const { categoria, q, color, tamano } = await searchParams;
  const configured = isShopDatabaseConfigured();
  const query = (q ?? "").trim();
  const colorProducto = (color ?? "").trim();
  const tamanoProducto = (tamano ?? "").trim();

  const [categories, forFacets, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: categoria, q: query }),
    getProducts({
      categorySlug: categoria,
      q: query,
      colorProducto: colorProducto || undefined,
      tamanoProducto: tamanoProducto || undefined,
    }),
  ]);

  const colorOptions = collectVariantFacetValues(forFacets, "color_producto");
  const tamanoOptions = collectVariantFacetValues(forFacets, "tamano_producto");

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
        <form method="get" className="mt-6 mb-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Buscar por nombre, descripción o slug"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            {categoria && <input type="hidden" name="categoria" value={categoria} />}
            {colorProducto && <input type="hidden" name="color" value={colorProducto} />}
            {tamanoProducto && <input type="hidden" name="tamano" value={tamanoProducto} />}
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-bold text-white hover:brightness-110"
            >
              Buscar
            </button>
            {query && (
              <Link
                href={buildTiendaHref({
                  categoria,
                  color: colorProducto,
                  tamano: tamanoProducto,
                })}
                className="text-sm font-semibold text-brand underline"
              >
                Limpiar búsqueda
              </Link>
            )}
          </div>
        </form>

        {categories.length > 0 && (
          <div className="mb-10">
            <CategoryFilter
              categories={categories}
              activeSlug={categoria}
              preserve={{ q: query, color: colorProducto, tamano: tamanoProducto }}
            />
          </div>
        )}

        {(colorOptions.length > 0 || tamanoOptions.length > 0) && (
          <div className="mb-8">
            <Suspense fallback={null}>
              <VariantAttributeFilters colorOptions={colorOptions} tamanoOptions={tamanoOptions} />
            </Suspense>
          </div>
        )}

        {products.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-brand/30 bg-surface-ice/50 px-6 py-16 text-center">
            <p className="text-lg font-medium text-foreground/80">
              {query
                ? "No encontramos productos para esa búsqueda."
                : "No hay productos en esta categoría."}
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
