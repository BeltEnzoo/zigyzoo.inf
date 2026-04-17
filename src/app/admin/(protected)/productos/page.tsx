import Link from "next/link";
import { Suspense } from "react";
import { syncProductsFromGoogleSheet } from "@/app/actions/sync-products-sheet";
import { CatalogSyncToast } from "@/components/admin/CatalogSyncToast";
import { getProducts } from "@/data/shop";
import { getCatalogSource } from "@/lib/catalog/catalog-source";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminProductosPage() {
  const products = await getProducts({ includeInactive: true });
  const catalog = getCatalogSource();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-brand">Productos</h1>
        <div className="flex flex-wrap gap-2">
          <form action={syncProductsFromGoogleSheet}>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-brand/30 bg-white px-5 py-2.5 text-sm font-bold text-brand hover:bg-surface-ice"
            >
              {catalog === "sheet" ? "Actualizar catálogo (hoja)" : "Sincronizar Google Sheet → Neon"}
            </button>
          </form>
          {catalog === "neon" && (
            <Link
              href="/admin/productos/nuevo"
              className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white hover:brightness-110"
            >
              Nuevo producto
            </Link>
          )}
        </div>
      </div>

      <Suspense fallback={null}>
        <CatalogSyncToast />
      </Suspense>

      {products.length === 0 ? (
        <p className="mt-8 text-foreground/75">No hay productos cargados.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-black/5 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-black/10 bg-surface-ice/50">
              <tr>
                <th className="px-4 py-3 font-semibold text-brand">Nombre</th>
                <th className="px-4 py-3 font-semibold text-brand">Slug</th>
                <th className="px-4 py-3 font-semibold text-brand">Precio</th>
                <th className="px-4 py-3 font-semibold text-brand">Estado</th>
                <th className="px-4 py-3 font-semibold text-brand" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-black/5">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-foreground/70">{p.slug}</td>
                  <td className="px-4 py-3">{formatMoney(p.price, p.currency)}</td>
                  <td className="px-4 py-3">
                    {p.is_active ? (
                      <span className="text-accent-sage">Activo</span>
                    ) : (
                      <span className="text-foreground/55">Inactivo</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/tienda/${p.slug}`}
                      className="font-semibold text-brand hover:underline"
                      target="_blank"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
