import Link from "next/link";
import { getAddressLines, getMapsSearchUrl, siteConfig } from "@/config/site";
import { ContactForm } from "./ContactForm";
import { SocialLinks } from "./SocialLinks";

export function ContactoSection() {
  return (
    <section
      id="contacto"
      className="scroll-mt-24 border-t border-black/5 bg-surface-ice/40 px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-center text-3xl font-bold text-brand sm:text-4xl">
          Contacto
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-foreground/75">
          Consultas comerciales, talles o pedidos: te respondemos por estos medios. El
          uso de tus datos en el formulario se describe en la{" "}
          <Link href="/privacidad" className="font-semibold text-brand underline">
            Política de privacidad
          </Link>
          .
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <h3 className="font-display text-xl font-bold text-brand">
              Enviá tu mensaje
            </h3>
            <p className="mt-2 text-sm text-foreground/70">
              Te respondemos a la brevedad. Si preferís, usá WhatsApp o Instagram.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>

          <div className="lg:pt-2">
            <h3 className="font-display text-xl font-bold text-brand">
              Redes y datos
            </h3>
            <p className="mt-2 text-sm text-foreground/70">
              Email de referencia:{" "}
              <a
                href={`mailto:${siteConfig.email}`}
                className="font-semibold text-brand underline-offset-2 hover:underline"
              >
                {siteConfig.email}
              </a>
            </p>
            <p className="mt-1 text-sm text-foreground/70">
              Teléfono / WhatsApp:{" "}
              <a href={`tel:${siteConfig.phoneTel}`} className="font-semibold text-brand">
                {siteConfig.phoneDisplay}
              </a>
            </p>
            <div className="mt-6 rounded-2xl border border-black/5 bg-white/80 p-4 text-sm text-foreground/85">
              <p className="font-semibold text-brand">Local comercial</p>
              <address className="mt-2 not-italic leading-relaxed">
                {getAddressLines().map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <a
                href={getMapsSearchUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block font-semibold text-brand underline-offset-2 hover:underline"
              >
                Ver en el mapa
              </a>
            </div>
            <p className="mt-4 text-sm text-foreground/70">
              Tienda en{" "}
              <a
                href={siteConfig.social.mercadoLibre}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand underline-offset-2 hover:underline"
              >
                Mercado Libre
              </a>{" "}
              (más de 500 publicaciones).
            </p>
            <h4 className="mt-8 text-sm font-semibold uppercase tracking-wide text-foreground/70">
              Seguinos
            </h4>
            <div className="mt-4">
              <SocialLinks />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
