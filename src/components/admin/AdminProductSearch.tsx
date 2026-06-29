import Link from "next/link";

export function AdminProductSearch({ query }: { query: string }) {
  return (
    <form
      method="get"
      className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
      role="search"
    >
      <label htmlFor="admin-product-search" className="sr-only">
        Buscar productos
      </label>
      <input
        id="admin-product-search"
        name="q"
        type="search"
        defaultValue={query}
        placeholder="Buscar por nombre o slug…"
        className="min-w-0 flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
      />
      <div className="flex shrink-0 gap-2">
        <button
          type="submit"
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white hover:brightness-110"
        >
          Buscar
        </button>
        {query ? (
          <Link
            href="/admin/productos"
            className="inline-flex items-center justify-center rounded-full border border-brand/30 bg-white px-5 py-2.5 text-sm font-bold text-brand hover:bg-surface-ice"
          >
            Limpiar
          </Link>
        ) : null}
      </div>
    </form>
  );
}
