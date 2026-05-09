import type { Metadata } from "next";
import Link from "next/link";
import { legalEntity } from "@/config/legal";
import { siteConfig } from "@/config/site";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: `Términos y condiciones — ${legalEntity.tradeName}`,
  description:
    "Condiciones generales de uso del sitio y de compra en Zigyzoo.",
};

export default function TerminosPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full min-w-0 max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/"
          className="text-sm font-semibold text-brand hover:underline"
        >
          ← Volver al inicio
        </Link>
        <h1 className="mt-6 font-display text-3xl font-bold text-brand sm:text-4xl">
          Términos y condiciones
        </h1>
        <p className="mt-2 text-sm text-foreground/65">
          Última actualización: {legalEntity.lastUpdated}
        </p>

        <div className="mt-10 space-y-6 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-brand">
              1. Identificación
            </h2>
            <p className="mt-3">
              El sitio web y la marca <strong>{legalEntity.tradeName}</strong> son
              ofrecidos por <strong>{legalEntity.legalName}</strong>, CUIT{" "}
              <strong>{legalEntity.taxId}</strong>, con domicilio en{" "}
              <strong>{legalEntity.address}</strong> (en adelante, “Zigyzoo” o “el
              proveedor”). Para consultas:{" "}
              <a
                href={`mailto:${siteConfig.email}`}
                className="font-semibold text-brand underline-offset-2 hover:underline"
              >
                {siteConfig.email}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand">
              2. Aceptación
            </h2>
            <p className="mt-3">
              Al navegar este sitio, registrarte, enviar un formulario de contacto o
              realizar un pedido, declarás haber leído y aceptado estos términos, la{" "}
              <Link href="/privacidad" className="font-semibold text-brand underline">
                Política de privacidad
              </Link>{" "}
              y la información de envíos y pagos publicada en la página de inicio. Si
              no estás de acuerdo, no utilices el sitio ni completes compras.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand">
              3. Productos y precios
            </h2>
            <p className="mt-3">
              Las descripciones, imágenes y precios tienen carácter informativo.
              Zigyzoo procura que la información sea correcta; no obstante, pueden
              existir errores involuntarios. En ese caso, se te informará antes de
              confirmar el pago o se ofrecerá la anulación del pedido sin costo.
            </p>
            <p className="mt-3">
              Los precios se expresan en moneda de curso legal en{" "}
              {legalEntity.country} e incluyen impuestos nacionales que correspondan
              según la actividad y el tipo de comprobante, salvo indicación expresa en
              contrario en el checkout. Cargos financieros o de la plataforma de pago
              (intereses, cuotas, comisiones) son responsabilidad del medio elegido y
              se informarán al pagar.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand">
              4. Pedidos, pago y facturación
            </h2>
            <p className="mt-3">
              El pedido se considera aceptado cuando Zigyzoo confirma el pago o el
              acuerdo del medio de pago elegido, según el flujo publicado en la
              tienda. Emitiremos la factura o comprobante fiscal que corresponda
              conforme la normativa de la AFIP y los datos fiscales que nos
              proporciones.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand">
              5. Envíos y entregas
            </h2>
            <p className="mt-3">
              Plazos, costos y zonas de envío son los indicados en el sitio al
              momento de la compra o en comunicaciones posteriores. Los plazos son
              estimativos y pueden verse afectados por causas ajenas a Zigyzoo
              (feriados, clima, demoras del transportista). El riesgo de pérdida o
              daño pasa al comprador según lo acordado en cada operación y la
              práctica del transportista.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand">
              6. Cambios, devoluciones y arrepentimiento
            </h2>
            <p className="mt-3">
              Las condiciones concretas (plazos, estado de las prendas, etiquetas,
              costos de envío de devolución) se publicarán en esta web y/o en el
              comprobante de compra. Los consumidores tienen los derechos otorgados
              por la Ley de Defensa del Consumidor N.º 24.240 y normas
              complementarias, incluido —cuando corresponda— el derecho de
              arrepentimiento en compras a distancia, en los términos y excepciones
              legales vigentes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand">
              7. Propiedad intelectual
            </h2>
            <p className="mt-3">
              Contenidos, logotipos, textos e imágenes del sitio están protegidos. No
              podés reproducirlos con fines comerciales sin autorización escrita de
              Zigyzoo.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand">
              8. Limitación de responsabilidad
            </h2>
            <p className="mt-3">
              Zigyzoo no se responsabiliza por daños indirectos, lucro cesante o
              interrupciones del servicio causadas por terceros (proveedores de
              hosting, medios de pago, transportistas), salvo dolo o culpa grave
              imputable al proveedor, en los límites del ordenamiento jurídico
              aplicable.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand">
              9. Ley aplicable y jurisdicción
            </h2>
            <p className="mt-3">
              Los presentes términos se rigen por las leyes de la República Argentina.
              Para consumidores finales rigen las normas de protección del consumidor
              y los tribunales competentes según domicilio o reglas de la ley 24.240.
            </p>
          </section>
        </div>

        <aside className="mt-12 rounded-2xl border border-brand/20 bg-surface-ice/60 p-5 text-sm text-foreground/80">
          <strong className="text-brand">Nota importante:</strong> este documento es
          una base para tu negocio. Zigyzoo debe revisarlo y completar datos
          societarios con un asesor legal o contador antes de publicarlo
          definitivamente.
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}
