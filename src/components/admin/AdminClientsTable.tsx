import { formatDateTimeAR, formatMoney } from "@/lib/format";
import type { AdminClientRow } from "@/data/admin-sales";

function normalizeDni(dni: string): string {
  return dni.replace(/\D/g, "");
}

function duplicateDniSet(rows: AdminClientRow[]): Set<string> {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const dni = normalizeDni(r.buyerDni);
    if (!dni) continue;
    counts.set(dni, (counts.get(dni) ?? 0) + 1);
  }
  return new Set(
    [...counts.entries()].filter(([, c]) => c > 1).map(([dni]) => dni),
  );
}

type Props = {
  rows: AdminClientRow[];
};

export function AdminClientsTable({ rows }: Props) {
  const dupDnis = duplicateDniSet(rows);

  if (rows.length === 0) {
    return (
      <p className="mt-6 rounded-2xl border border-dashed border-brand/25 bg-surface-ice/40 px-4 py-10 text-center text-sm text-foreground/70">
        Todavía no hay clientes registrados. Se listan cuando alguien completa datos en el checkout.
      </p>
    );
  }

  return (
    <>
      {dupDnis.size > 0 && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Hay DNI repetidos entre clientes distintos (datos viejos del checkout). En compras nuevas
          el sistema no permite mezclar el mismo DNI con otro email, ni el mismo email con otro DNI.
        </p>
      )}
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
          {rows.map((r) => {
            const dniDup = dupDnis.has(normalizeDni(r.buyerDni));
            return (
            <tr key={r.buyerEmail} className="border-b border-black/5">
              <td className="px-4 py-3 font-medium">
                {r.buyerFirstName} {r.buyerLastName}
              </td>
              <td className={`px-4 py-3 ${dniDup ? "font-semibold text-amber-800" : ""}`}>
                {r.buyerDni}
                {dniDup && (
                  <span className="ml-1 text-xs text-amber-700" title="DNI usado por otro email">
                    (duplicado)
                  </span>
                )}
              </td>
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
          );
          })}
        </tbody>
      </table>
    </div>
    </>
  );
}
