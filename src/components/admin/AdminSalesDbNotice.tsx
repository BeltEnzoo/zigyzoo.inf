type Props = {
  sessionCount: number | null;
  listEmpty: boolean;
};

export function AdminSalesDbNotice({ sessionCount, listEmpty }: Props) {
  if (sessionCount === null) {
    return (
      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        No se pudo conectar a la base de datos desde el servidor. Revisá que{" "}
        <code className="rounded bg-white/80 px-1">DATABASE_URL</code> en Vercel sea el mismo proyecto Neon donde
        ves los datos.
      </p>
    );
  }

  if (sessionCount > 0 && listEmpty) {
    return (
      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Hay {sessionCount} registro(s) en <code className="rounded bg-white/80 px-1">checkout_sessions</code> pero
        no se pudieron leer con la consulta actual. En Neon ejecutá las columnas opcionales del{" "}
        <code className="rounded bg-white/80 px-1">neon/schema.sql</code> y redeployá el sitio.
      </p>
    );
  }

  return null;
}
