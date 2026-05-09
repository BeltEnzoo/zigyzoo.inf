import type { Metadata } from "next";
import Link from "next/link";
import { legalEntity } from "@/config/legal";
import { siteConfig } from "@/config/site";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: `Política de privacidad — ${legalEntity.tradeName}`,
  description:
    "Tratamiento de datos personales en el sitio y formularios de Zigyzoo.",
};

export default function PrivacidadPage() {
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
          Política de privacidad
        </h1>
        <p className="mt-2 text-sm text-foreground/65">
          Última actualización: {legalEntity.lastUpdated}
        </p>

        <div className="mt-10 space-y-6 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-brand">
              1. Responsable del tratamiento
            </h2>
            <p className="mt-3">
              <strong>{legalEntity.legalName}</strong> (marca {legalEntity.tradeName}
              ), CUIT {legalEntity.taxId}, domicilio {legalEntity.address}, es quien
              decide sobre el tratamiento de los datos personales que nos brindás a
              través de este sitio y canales de contacto.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand">
              2. Datos que podemos recibir
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Datos de identificación y contacto: nombre, correo electrónico,
                teléfono, domicilio de entrega cuando compres o solicites envío.
              </li>
              <li>
                Datos de la operación: productos elegidos, medio de pago utilizado
                (el procesamiento puede ser realizado por terceros certificados).
              </li>
              <li>
                Datos técnicos: dirección IP, tipo de navegador, cookies o
                tecnologías similares si las implementamos para mejorar el sitio (se
                informará en su caso mediante un aviso de cookies).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand">
              3. Finalidades
            </h2>
            <p className="mt-3">
              Tratamos tus datos para: responder consultas enviadas por formulario
              o WhatsApp; gestionar pedidos, pagos y envíos; emitir comprobantes;
              cumplir obligaciones legales y tributarias; mejorar nuestros productos
              y servicios; y, si nos das tu consentimiento, enviarte novedades
              comerciales (podrás revocarlo en cualquier momento).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand">
              4. Base legal y conservación
            </h2>
            <p className="mt-3">
              El tratamiento se funda en la ejecución de una compra o solicitud, el
              cumplimiento de obligaciones legales o tu consentimiento cuando sea
              necesario. Conservamos los datos el tiempo imprescindible para esas
              finalidades y los plazos de prescripción legal aplicables.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand">
              5. Cesiones y encargados
            </h2>
            <p className="mt-3">
              Podemos compartir datos con proveedores que nos prestan servicios
              (hosting, email transaccional, plataforma de pago, courier), bajo
              acuerdos de confidencialidad y solo lo necesario para el servicio. No
              vendemos tus datos personales a terceros.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand">
              6. Tus derechos (Ley 25.326 y normativa vigente)
            </h2>
            <p className="mt-3">
              Podés solicitar acceso, actualización, rectificación o supresión de tus
              datos cuando corresponda, o presentar reclamo ante la Dirección
              Nacional de Protección de Datos Personales u organismo sucesor. Para
              ejercer derechos o consultas sobre privacidad escribinos a{" "}
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
              7. Seguridad
            </h2>
            <p className="mt-3">
              Aplicamos medidas razonables de seguridad técnica y organizativa. Ningún
              sistema es invulnerable; si detectás un problema, notificanos de
              inmediato.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand">
              8. Menores
            </h2>
            <p className="mt-3">
              Nuestro sitio está dirigido a adultos que compran para niños. No
              recopilamos datos de menores de forma intencionada. Si creés que se
              cargó información de un menor sin autorización, contactanos para
              eliminarla.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-brand">
              9. Cambios
            </h2>
            <p className="mt-3">
              Podemos actualizar esta política. Publicaremos la versión vigente en
              esta página con la fecha de actualización.
            </p>
          </section>
        </div>

        <aside className="mt-12 rounded-2xl border border-brand/20 bg-surface-ice/60 p-5 text-sm text-foreground/80">
          <strong className="text-brand">Nota importante:</strong> conviene revisar
          este texto con un asesor en protección de datos y alinearlo a los medios de
          pago y proveedores que uses en producción.
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}
