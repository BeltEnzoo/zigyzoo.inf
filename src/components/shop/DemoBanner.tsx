import { isShopDatabaseConfigured } from "@/data/shop";

export async function DemoBanner() {
  if (isShopDatabaseConfigured()) return null;
  return (
    <aside className="mb-8 rounded-2xl border border-brand/25 bg-surface-mint/40 px-4 py-3 text-sm text-foreground/85">
      <strong className="text-brand">Vista previa</strong> — Estás viendo productos de ejemplo con
      fotos y precios ficticios para revisar el diseño de la tienda.{" "}
      <span className="text-foreground/70">
        Para tu catálogo real, configurá{" "}
        <code className="rounded bg-white/70 px-1">SHOP_CATALOG_SOURCE=sheet</code> y la Google Sheet,
        o bien <code className="rounded bg-white/70 px-1">DATABASE_URL</code> en Neon con{" "}
        <code className="rounded bg-white/70 px-1">neon/schema.sql</code> y un usuario en{" "}
        <code className="rounded bg-white/70 px-1">admin_users</code>.
      </span>
    </aside>
  );
}
