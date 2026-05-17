import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Pago no completado — Zigyzoo",
  description: "El pago no se completó.",
};

export default function PagoErrorPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-1 flex-col px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-black/5 bg-white px-6 py-10 text-center shadow-sm">
          <p className="font-display text-2xl font-bold text-brand">No se completó el pago</p>
          <p className="mt-3 text-foreground/80">
            Podés intentar de nuevo desde el carrito o elegir otro medio en Mercado Pago si aparece la opción.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/carrito"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-6 text-sm font-bold text-white hover:brightness-110"
            >
              Volver al carrito
            </Link>
            <Link
              href="/tienda"
              className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-brand px-6 text-sm font-bold text-brand hover:bg-surface-ice"
            >
              Ir a la tienda
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
