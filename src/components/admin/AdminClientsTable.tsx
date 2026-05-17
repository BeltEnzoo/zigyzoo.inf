import { formatDateTimeAR, formatMoney } from "@/lib/format";
import type { AdminClientRow } from "@/data/admin-sales";

type Props = {
  rows: AdminClientRow[];
};

export function AdminClientsTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <p className="mt-6 rounded-2xl border border-dashed border-brand/25 bg-surface-ice/40 px-4 py-10 text-center text-sm text-foreground/70">
        Todavía no hay clientes registrados. Se listan cuando alguien completa datos en el checkout.
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-black/5 bg-white">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="border-b border-black/10 bg-surface-ice/50">
          <tr>
            <th className="px-4 py-3 font-semibold text-brand">Nombre</th>
            <th className="px-4 py-3 font-semibold text-brand">DNI</th>
            <th className="px-4 py-3 font-semibold text-brand">Celular</th>
            <th className="px-4 py-3 font-semibold text-brand">Email</th>
            <th className="px-4 py-3 font-semibold text-brand">Checkouts</th>
            <th className="px-4 py-3 font-semibold text-brand">Último contacto</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.buyerEmail} className="border-b border-black/5">
              <td className="px-4 py-3 font-medium">
                {r.buyerFirstName} {r.buyerLastName}
              </td>
              <td className="px-4 py-3">{r.buyerDni}</td>
              <td className="px-4 py-3 whitespace-nowrap">{r.buyerPhone}</td>
              <td className="px-4 py-3">
                <a href={`mailto:${r.buyerEmail}`} className="text-brand hover:underline">
                  {r.buyerEmail}
                </a>
              </td>
              <td className="px-4 py-3">{r.checkoutCount}</td>
              <td className="px-4 py-3 text-foreground/80">
                <p>{formatDateTimeAR(r.lastCheckoutAt)}</p>
                {r.lastTotalAmountArs != null && (
                  <p className="text-xs text-foreground/55">
                    Últ. monto: {formatMoney(r.lastTotalAmountArs)}
                  </p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
