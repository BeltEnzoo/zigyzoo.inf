import Link from "next/link";
import { Suspense } from "react";
import { syncProductsFromGoogleSheet } from "@/app/actions/sync-products-sheet";
import { AdminProductSearch } from "@/components/admin/AdminProductSearch";
import { CatalogSyncToast } from "@/components/admin/CatalogSyncToast";
import { getProducts } from "@/data/shop";
import { getCatalogSource } from "@/lib/catalog/catalog-source";
import { isGoogleSheetsWriteConfigured } from "@/lib/catalog/sheet-config";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminProductosPage({ searchParams }: Props) {
  const { q: qRaw } = await searchParams;
  const query = qRaw?.trim() ?? "";
  const products = await getProducts({ includeInactive: true, q: query || undefined });
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
          {catalog === "sheet" ? (
            <>
              <Link
                href="/admin/precios"
                className="inline-flex items-center justify-center rounded-full border border-brand/30 bg-white px-5 py-2.5 text-sm font-bold text-brand hover:bg-surface-ice"
              >
                Ajustar precios
              </Link>
              <Link
                href="/admin/productos/nuevo"
                className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white hover:brightness-110"
              >
                Nuevo producto
              </Link>
            </>
          ) : (
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

      {catalog === "sheet" && !isGoogleSheetsWriteConfigured() && (
        <p className="mt-4 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Para <strong>crear productos y actualizar stock desde el panel</strong> (y bajar stock al vender),
          configurá <code className="rounded bg-white/80 px-1">GOOGLE_SERVICE_ACCOUNT_EMAIL</code> y{" "}
          <code className="rounded bg-white/80 px-1">GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY</code> en el
          servidor y compartí la Google Sheet con esa cuenta como Editor. Mientras tanto podés cargar
          productos en la hoja a mano o usar{" "}
          <Link href="/admin/productos/nuevo" className="font-semibold underline">
            Nuevo producto
          </Link>{" "}
          (el formulario te avisará si falta la configuración).
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3 rounded-2xl border border-brand/15 bg-brand/5 px-4 py-4 text-sm">
        <span className="w-full font-semibold text-brand sm:w-auto">También en el panel:</span>
        <Link href="/admin/ventas" className="font-semibold text-brand underline-offset-2 hover:underline">
          Ver ventas
        </Link>
        <span className="text-foreground/40">·</span>
        <Link href="/admin/clientes" className="font-semibold text-brand underline-offset-2 hover:underline">
          Ver clientes
        </Link>
      </div>

      <AdminProductSearch query={query} />

      {query && (
        <p className="mt-3 text-sm text-foreground/70">
          {products.length === 0
            ? `Ningún producto coincide con «${query}».`
            : `${products.length} resultado${products.length === 1 ? "" : "s"} para «${query}».`}
        </p>
      )}

      {products.length === 0 ? (
        <p className="mt-8 text-foreground/75">
          {query ? "Probá con otro término o limpiá la búsqueda." : "No hay productos cargados."}
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-black/5 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-black/10 bg-surface-ice/50">
              <tr>
                <th className="px-4 py-3 font-semibold text-brand">Nombre</th>
                <th className="px-4 py-3 font-semibold text-brand">Slug</th>
                <th className="px-4 py-3 font-semibold text-brand">Precio</th>
                {catalog === "sheet" && (
                  <th className="px-4 py-3 font-semibold text-brand">Stock</th>
                )}
                <th className="px-4 py-3 font-semibold text-brand">Estado</th>
                <th className="px-4 py-3 font-semibold text-brand" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const totalStock = p.product_variants.reduce((sum, v) => sum + v.stock, 0);
                return (
                <tr key={p.id} className="border-b border-black/5">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-foreground/70">{p.slug}</td>
                  <td className="px-4 py-3">{formatMoney(p.price, p.currency)}</td>
                  {catalog === "sheet" && (
                    <td className="px-4 py-3 text-foreground/80">{totalStock}</td>
                  )}
                  <td className="px-4 py-3">
                    {p.is_active ? (
                      <span className="text-accent-sage">Activo</span>
                    ) : (
                      <span className="text-foreground/55">Inactivo</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3">
                      {catalog === "sheet" && (
                        <Link
                          href={`/admin/productos/${p.slug}/stock`}
                          className="font-semibold text-brand hover:underline"
                        >
                          Stock
                        </Link>
                      )}
                      <Link
                        href={`/tienda/${p.slug}`}
                        className="font-semibold text-brand hover:underline"
                        target="_blank"
                      >
                        Ver
                      </Link>
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
