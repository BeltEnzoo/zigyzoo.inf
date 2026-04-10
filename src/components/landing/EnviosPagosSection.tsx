import Link from "next/link";
import { getWhatsAppUrl, siteConfig } from "@/config/site";

function IconCard({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3 3.75h3M9.75 8.25v7.5m0 0v7.5m0-7.5h6.75m-6.75 0h6.75m0 0H21" />
    </svg>
  );
}

function IconBank({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5M19.5 21V10.5M4.5 21V10.5" />
    </svg>
  );
}

function IconCash({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.743c.806.026 1.15-.394 1.15-.956 0-.474-.037-1.602-.037-2.25 0-1.518.012-2.668.012-3.334 0-.74-.074-1.424-.138-2.045a2.25 2.25 0 0 0-.505-1.137 2.25 2.25 0 0 0-1.084-.644 60.07 60.07 0 0 0-15.797-2.743c-.806-.026-1.15.394-1.15.956 0 .474.037 1.602.037 2.25 0 1.518-.012 2.668-.012 3.334 0 .74.074 1.424.138 2.045a2.25 2.25 0 0 0 .505 1.137 2.25 2.25 0 0 0 1.084.644Z" />
    </svg>
  );
}

export function EnviosPagosSection() {
  return (
    <section
      id="envios-pagos"
      className="scroll-mt-24 border-y border-black/5 bg-gradient-to-b from-white to-surface-mint/30 px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-center text-3xl font-bold text-brand sm:text-4xl">
          Envíos y medios de pago
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-foreground/75">
          Plazos y costos definitivos se confirman al cerrar cada pedido (web, Mercado Libre o local).
          En Mercado Libre contamos con{" "}
          <strong className="text-brand">destaque en entregas</strong> por cumplir y adelantar envíos.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-black/5 bg-surface-ice/70 p-8 shadow-sm">
            <h3 className="font-display text-xl font-bold text-brand">Envíos y retiros</h3>
            <ul className="mt-4 space-y-3 text-foreground/85">
              <li>
                <strong className="text-brand">Mercado Libre:</strong> envíos a todo el país según la
                modalidad que elijas en la publicación; seguimiento y plazos según la plataforma.
              </li>
              <li>
                <strong className="text-brand">Esta tienda web:</strong> realizamos{" "}
                <strong className="text-brand">entregas a domicilio</strong> según distancia y también{" "}
                <strong className="text-brand">envíos a todo el país</strong>. Consultanos por{" "}
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand underline"
                >
                  WhatsApp
                </a>{" "}
                o el{" "}
                <Link href="/#contacto" className="font-semibold text-brand underline">
                  formulario de contacto
                </Link>
                .
              </li>
              <li>
                <strong className="text-brand">Local:</strong> Moises Lebensohn 306, Boulogne Sur Mer
                (San Isidro). Vidriera y productos elogiados por vecinos; ambiente de barrio con
                atención personal.
              </li>
              <li>
                <strong className="text-brand">Empaque:</strong> productos envueltos en papel regalo
                kraft estampado con moño, etiqueta con logo y bolsa personalizada o embalaje de
                Mercado Libre; incluimos folleto y tarjetita para regalar.
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-black/5 bg-surface-sand/80 p-8 shadow-sm">
            <h3 className="font-display text-xl font-bold text-brand">Medios de pago</h3>
            <p className="mt-4 text-foreground/85">
              Los cobros online se procesan principalmente con{" "}
              <strong className="text-brand">Mercado Pago</strong> (tarjeta de crédito y débito). También
              aceptamos <strong className="text-brand">transferencia bancaria</strong>. En el{" "}
              <strong className="text-brand">local</strong>,{" "}
              <strong className="text-brand">efectivo con descuento</strong> según la promoción vigente
              al momento de la compra.
            </p>
            <ul className="mt-6 space-y-4">
              <li className="flex gap-3">
                <IconCard className="mt-0.5 h-6 w-6 shrink-0 text-brand" />
                <span>
                  <strong className="text-brand">Mercado Pago</strong> — crédito y débito en compras
                  online y en canales donde esté habilitado.
                </span>
              </li>
              <li className="flex gap-3">
                <IconBank className="mt-0.5 h-6 w-6 shrink-0 text-brand" />
                <span>
                  <strong className="text-brand">Transferencia</strong> — datos al confirmar el pedido;
                  el despacho se coordina al acreditarse el pago cuando aplique.
                </span>
              </li>
              <li className="flex gap-3">
                <IconCash className="mt-0.5 h-6 w-6 shrink-0 text-brand" />
                <span>
                  <strong className="text-brand">Efectivo en local</strong> — con descuento según lo
                  informemos en el momento de la compra.
                </span>
              </li>
            </ul>
            <p className="mt-6 text-sm text-foreground/70">
              También podés comprar en nuestra{" "}
              <a
                href={siteConfig.social.mercadoLibre}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand underline"
              >
                tienda de Mercado Libre
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
