import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Pago pendiente — Zigyzoo",
  description: "Tu pago puede estar pendiente de acreditación.",
};

export default function PagoPendientePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-1 flex-col px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-black/5 bg-white px-6 py-10 text-center shadow-sm">
          <p className="font-display text-2xl font-bold text-brand">Pago pendiente</p>
          <p className="mt-3 text-foreground/80">
            Algunos medios (efectivo, transferencia, etc.) demoran en acreditarse. Cuando Mercado Pago confirme el
            pago, te lo notificarán por mail o en la app.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/tienda"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-6 text-sm font-bold text-white hover:brightness-110"
            >
              Seguir en la tienda
            </Link>
            <Link href="/#contacto" className="text-sm font-semibold text-brand underline">
              ¿Dudas? Contactanos
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
