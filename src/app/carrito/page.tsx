import Link from "next/link";
import { CarritoView } from "@/components/shop/CarritoView";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Carrito — Zigyzoo",
  description: "Revisá los productos en tu carrito.",
};

export default function CarritoPage() {
  const mercadoPagoConfigured = Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN?.trim());

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full min-w-0 max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <Link href="/tienda" className="text-sm font-semibold text-brand hover:underline">
          ← Seguir comprando
        </Link>
        <h1 className="mt-4 font-display text-3xl font-bold text-brand sm:text-4xl">
          Carrito
        </h1>
        <p className="mt-2 text-foreground/75">
          Revisá cantidades, completá tus datos, calculá el envío y pagá con Mercado Pago en cuatro pasos.
        </p>
        <div className="mt-10">
          <CarritoView mercadoPagoConfigured={mercadoPagoConfigured} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
