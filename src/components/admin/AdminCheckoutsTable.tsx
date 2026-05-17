import { formatDateTimeAR, formatMoney } from "@/lib/format";
import type { AdminCheckoutRow } from "@/data/admin-sales";

type Props = {
  rows: AdminCheckoutRow[];
};

function buyerName(r: AdminCheckoutRow) {
  return `${r.buyerFirstName} ${r.buyerLastName}`.trim();
}

export function AdminCheckoutsTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p className="mt-6 rounded-2xl border border-dashed border-brand/25 bg-surface-ice/40 px-4 py-10 text-center text-sm text-foreground/70">
        Todavía no hay ventas con pago aprobado en Mercado Pago.
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-black/5 bg-white">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-black/10 bg-surface-ice/50">
          <tr>
            <th className="px-4 py-3 font-semibold text-brand">Fecha</th>
            <th className="px-4 py-3 font-semibold text-brand">Monto</th>
            <th className="px-4 py-3 font-semibold text-brand">Cliente</th>
            <th className="px-4 py-3 font-semibold text-brand">Contacto</th>
            <th className="px-4 py-3 font-semibold text-brand">Envío</th>
            <th className="px-4 py-3 font-semibold text-brand">Referencia</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-black/5 align-top">
              <td className="whitespace-nowrap px-4 py-3 text-foreground/80">
                {r.paidAt ? formatDateTimeAR(r.paidAt) : formatDateTimeAR(r.createdAt)}
              </td>
              <td className="px-4 py-3 font-semibold">
                {r.totalAmountArs != null ? formatMoney(r.totalAmountArs) : "—"}
              </td>
              <td className="px-4 py-3">
                <p className="font-medium">{buyerName(r)}</p>
                <p className="text-xs text-foreground/55">DNI {r.buyerDni}</p>
              </td>
              <td className="px-4 py-3 text-foreground/80">
                <p>{r.buyerEmail}</p>
                <p className="text-xs">{r.buyerPhone}</p>
              </td>
              <td className="px-4 py-3 text-foreground/80">
                <p>{r.shippingLabel ?? "—"}</p>
                {r.shippingPostalCode && (
                  <p className="text-xs text-foreground/55">CP {r.shippingPostalCode}</p>
                )}
              </td>
              <td className="max-w-[10rem] truncate px-4 py-3 font-mono text-xs text-foreground/55">
                {r.externalReference}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
