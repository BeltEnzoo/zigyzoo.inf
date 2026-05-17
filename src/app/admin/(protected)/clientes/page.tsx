import Link from "next/link";
import { AdminClientsTable } from "@/components/admin/AdminClientsTable";
import { AdminSalesDbNotice } from "@/components/admin/AdminSalesDbNotice";
import { getAdminClients, getCheckoutSessionCount } from "@/data/admin-sales";

export const dynamic = "force-dynamic";

export default async function AdminClientesPage() {
  const [clients, sessionCount] = await Promise.all([
    getAdminClients(),
    getCheckoutSessionCount(),
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

      <AdminSalesDbNotice sessionCount={sessionCount} listEmpty={clients.length === 0} />
      <AdminClientsTable rows={clients} />
    </div>
  );
}
