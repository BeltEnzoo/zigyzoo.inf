import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { clearAdminSessionCookie, getAdminSession } from "@/lib/auth/session";
import { isAdminPanelReady } from "@/lib/admin/readiness";
import { getSql } from "@/lib/db/neon";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAdminPanelReady()) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-foreground/80">
          Configurá <code className="rounded bg-surface-ice px-1">DATABASE_URL</code> (Neon) y{" "}
          <code className="rounded bg-surface-ice px-1">AUTH_SECRET</code> en{" "}
          <code className="rounded bg-surface-ice px-1">.env.local</code>, ejecutá{" "}
          <code className="rounded bg-surface-ice px-1">neon/schema.sql</code> y creá un usuario en{" "}
          <code className="rounded bg-surface-ice px-1">admin_users</code>.
        </p>
        <Link href="/" className="mt-4 inline-block font-semibold text-brand underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const sql = getSql();
  if (sql) {
    const ok = await sql`
      select 1 as x
      from admin_users
      where id = ${session.userId}::uuid and role in ('admin', 'editor')
      limit 1
    `;
    if (!ok.length) {
      await clearAdminSessionCookie();
      redirect("/admin/login?error=sin_permiso");
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-black/5 bg-white/90 pt-[env(safe-area-inset-top,0px)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:flex-nowrap">
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-brand">
            <Link href="/admin" className="font-display text-lg">
              Panel
            </Link>
            <Link href="/admin/productos" className="hover:underline">
              Productos
            </Link>
            <Link href="/admin/ventas" className="hover:underline">
              Ventas
            </Link>
            <Link href="/admin/clientes" className="hover:underline">
              Clientes
            </Link>
            <Link href="/admin/productos/nuevo" className="hover:underline">
              Nuevo producto
            </Link>
          </div>
          <LogoutButton />
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 pb-[max(2rem,calc(2rem+env(safe-area-inset-bottom,0px)))] sm:px-6">
        {children}
      </div>
    </div>
  );
}
