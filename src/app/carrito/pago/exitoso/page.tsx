import Link from "next/link";
import { Suspense } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { PaymentExitosoClient } from "@/components/shop/PaymentExitosoClient";

export const metadata = {
  title: "Pago — Zigyzoo",
  description: "Estado de tu pago con Mercado Pago.",
};

export default function PagoExitosoPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[50vh] w-full max-w-3xl flex-1 flex-col px-4 py-12 sm:px-6">
        <Suspense
          fallback={
            <p className="text-center text-foreground/70">Cargando...</p>
          }
        >
          <PaymentExitosoClient />
        </Suspense>
        <p className="mx-auto mt-8 max-w-lg text-center text-xs text-foreground/55">
          Si algo no coincide con tu operación, conservá el comprobante de Mercado Pago y{" "}
          <Link href="/#contacto" className="font-semibold text-brand underline">
            escribinos
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
