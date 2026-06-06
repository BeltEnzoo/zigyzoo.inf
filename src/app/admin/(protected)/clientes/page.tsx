import Link from "next/link";
import { AdminClientsTable } from "@/components/admin/AdminClientsTable";
import { getAdminClients, getSalesPanelDiagnostics } from "@/data/admin-sales";

export const dynamic = "force-dynamic";

export default async function AdminClientesPage() {
  const [clients, diagnostics] = await Promise.all([
    getAdminClients(),
    getSalesPanelDiagnostics(),
  ]);

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand">Clientes</h1>
          <p className="mt-2 max-w-2xl text-sm text-foreground/75">
            Personas que completaron datos en el checkout, agrupadas por email. Más adelante podés usar esta lista
            para envíos masivos o recordatorios.
          </p>
        </div>
        <Link
          href="/admin/productos"
          className="text-sm font-semibold text-brand hover:underline"
        >
          ← Productos y catálogo
        </Link>
      </div>

      {diagnostics.sessionCount === null && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          No se pudo conectar a la base de datos. Revisá{" "}
          <code className="rounded bg-white/80 px-1">DATABASE_URL</code> en Vercel.
        </p>
      )}
      {diagnostics.sessionCount !== null &&
        diagnostics.sessionCount > 0 &&
        clients.length === 0 && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Hay {diagnostics.sessionCount} checkout(s) en la base pero no se pudieron listar. Redeployá el sitio con
            la última versión del código.
          </p>
        )}
      <AdminClientsTable rows={clients} />
    </div>
  );
}
