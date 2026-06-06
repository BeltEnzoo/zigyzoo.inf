type Props = {
  sessionCount: number | null;
  approvedCount: number | null;
  paymentStatusColumnMissing: boolean;
  listEmpty: boolean;
};

export function AdminSalesDbNotice({
  sessionCount,
  approvedCount,
  paymentStatusColumnMissing,
  listEmpty,
}: Props) {
  if (sessionCount === null) {
    return (
      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        No se pudo conectar a la base de datos desde el servidor. Revisá que{" "}
        <code className="rounded bg-white/80 px-1">DATABASE_URL</code> en Vercel sea el mismo proyecto Neon donde
        ves los datos.
      </p>
    );
  }

  if (paymentStatusColumnMissing) {
    return (
      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Hay {sessionCount} registro(s) en la base, pero falta la columna{" "}
        <code className="rounded bg-white/80 px-1">payment_status</code>. En Neon ejecutá el archivo{" "}
        <code className="rounded bg-white/80 px-1">neon/migrate-checkout-sessions.sql</code> y redeployá el sitio.
        Después, los pagos aprobados en Mercado Pago aparecerán acá solos.
      </p>
    );
  }

  if (sessionCount > 0 && approvedCount === 0 && listEmpty) {
    return (
      <p className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
        Hay {sessionCount} checkout(s) registrado(s), pero ninguno con pago <strong>aprobado</strong> en Mercado Pago
        todavía. Si ya pagaste una prueba, podés marcarla en Neon:{" "}
        <code className="rounded bg-white/80 px-1 text-xs">
          update checkout_sessions set payment_status = &apos;approved&apos;, paid_at = created_at where buyer_email =
          &apos;…&apos;;
        </code>
      </p>
    );
  }

  return null;
}
