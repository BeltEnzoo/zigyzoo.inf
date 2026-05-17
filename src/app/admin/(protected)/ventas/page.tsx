import Link from "next/link";
import { AdminCheckoutsTable } from "@/components/admin/AdminCheckoutsTable";
import { AdminSalesDbNotice } from "@/components/admin/AdminSalesDbNotice";
import { getAdminCheckouts, getCheckoutSessionCount } from "@/data/admin-sales";

export const dynamic = "force-dynamic";

export default async function AdminVentasPage() {
  const [checkouts, sessionCount] = await Promise.all([
    getAdminCheckouts(),
    getCheckoutSessionCount(),
  ]);

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand">Ventas</h1>
          <p className="mt-2 max-w-2xl text-sm text-foreground/75">
            Solo aparecen pagos <strong>aprobados</strong> en Mercado Pago. Si alguien llegó al checkout pero no
            pagó, no figura acá (sí puede verse en Clientes). Los pagos se confirman al volver del checkout o por
            notificación de MP.
          </p>
        </div>
        <Link
          href="/admin/productos"
          className="text-sm font-semibold text-brand hover:underline"
        >
          ← Productos y catálogo
        </Link>
      </div>

      <AdminSalesDbNotice sessionCount={sessionCount} listEmpty={checkouts.length === 0} />
      <AdminCheckoutsTable rows={checkouts} />
    </div>
  );
}
