import Link from "next/link";
import { syncProductsFromGoogleSheet } from "@/app/actions/sync-products-sheet";
import { getProducts } from "@/data/shop";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    sync?: string;
    created?: string;
    updated?: string;
    skipped?: string;
    errors?: string;
    detail?: string;
  }>;
};

export default async function AdminProductosPage({ searchParams }: Props) {
  const params = await searchParams;
  const products = await getProducts({ includeInactive: true });

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
              Sincronizar Google Sheet
            </button>
          </form>
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white hover:brightness-110"
          >
            Nuevo producto
          </Link>
        </div>
      </div>

      {params.sync === "ok" && (
        <p className="mt-4 rounded-xl border border-brand/20 bg-surface-mint/50 px-4 py-3 text-sm text-foreground/85">
          Sync OK: {params.created ?? "0"} creados, {params.updated ?? "0"} actualizados,{" "}
          {params.skipped ?? "0"} omitidos, {params.errors ?? "0"} con error.
        </p>
      )}
      {params.sync === "error" && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error de sincronización: {params.detail ?? "Revisá configuración y permisos del Sheet."}
        </p>
      )}

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
