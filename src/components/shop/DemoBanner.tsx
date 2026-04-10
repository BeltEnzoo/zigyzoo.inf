import { isNeonConfigured } from "@/lib/db/neon";

export async function DemoBanner() {
  if (isNeonConfigured()) return null;
  return (
    <aside className="mb-8 rounded-2xl border border-brand/25 bg-surface-mint/40 px-4 py-3 text-sm text-foreground/85">
      <strong className="text-brand">Vista previa</strong> — Estás viendo productos de ejemplo con
      fotos y precios ficticios para revisar el diseño de la tienda.{" "}
      <span className="text-foreground/70">
        Para tu catálogo real, creá <code className="rounded bg-white/70 px-1">.env.local</code> con{" "}
        <code className="rounded bg-white/70 px-1">DATABASE_URL</code> de Neon, ejecutá{" "}
        <code className="rounded bg-white/70 px-1">neon/schema.sql</code> y cargá un usuario en{" "}
        <code className="rounded bg-white/70 px-1">admin_users</code> para el panel.
      </span>
    </aside>
  );
}
