import Image from "next/image";
import Link from "next/link";
import bannerImg from "../../img/img_banner.jpeg";
import castoresSvg from "../../img/castores-sin-fondo.svg";
import { ClientesSection } from "@/components/landing/ClientesSection";
import { ContactoSection } from "@/components/landing/ContactoSection";
import { EnviosPagosSection } from "@/components/landing/EnviosPagosSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { GaleriaInfantil } from "@/components/landing/GaleriaInfantil";
import { QuienesSomos } from "@/components/landing/QuienesSomos";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-w-0 flex-1 flex-col">
        <section className="relative flex min-h-[70vh] items-center overflow-hidden px-4 pb-16 pt-10 sm:min-h-[78vh] sm:px-6 sm:pb-24 sm:pt-14">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center brightness-125 saturate-110"
            style={{ backgroundImage: `url(${bannerImg.src})` }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-black/14"
            aria-hidden
          />
          <div className="mx-auto max-w-2xl min-w-0 px-1 text-center sm:px-0">
            <div className="mb-[-6px] flex translate-y-15 justify-center sm:mb-[-8px] sm:translate-y-10">
              <Image
                src={castoresSvg}
                alt="Castores Zigyzoo"
                width={260}
                height={142}
                className="h-auto w-[210px] drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)] sm:w-[245px]"
                priority
              />
            </div>
            <h1 className="-mt-5 font-display text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:-mt-6 sm:text-5xl md:text-6xl">
              Un refugio para la infancia
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-lg text-white/90 sm:mt-3 sm:text-xl">
              Polirubro infantil en Boulogne Sur Mer y envíos a todo el país. Ropa, juguetes y más,
              con el cuidado de una familia que empaqueta cada pedido como un regalo.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/tienda"
                className="inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-full bg-white px-8 text-base font-bold text-brand shadow-md shadow-black/20 transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
              >
                Ir a la tienda
              </Link>
              <a
                href="#info"
                className="text-base font-semibold text-white underline-offset-4 hover:underline"
              >
                Conocé más
              </a>
            </div>
          </div>
        </section>
        <GaleriaInfantil />

        <section
          id="info"
          className="scroll-mt-24 border-y border-black/5 bg-white/70 px-4 py-16 sm:px-6"
        >
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            <article className="rounded-3xl border border-brand/10 bg-gradient-to-b from-surface-ice to-white p-6 shadow-sm">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand shadow-sm">
                ★ Favoritos
              </span>
              <h2 className="font-display text-xl font-bold text-brand">
                Todo para la infancia
              </h2>
              <p className="mt-3 text-foreground/85">
                Un espacio integral: inclusión, compromiso ecológico y cercanía emocional en cada
                elección. Menos vueltas, más tiempo en familia.
              </p>
            </article>
            <article className="rounded-3xl border border-brand/10 bg-gradient-to-b from-surface-mint to-white p-6 shadow-sm">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand shadow-sm">
                ✦ Comunidad
              </span>
              <h2 className="font-display text-xl font-bold text-brand">
                De barrio, con alcance nacional
              </h2>
              <p className="mt-3 text-foreground/85">
                Local en San Isidro y tienda en Mercado Libre con cientos de publicaciones.
                Entregas reconocidas por cumplir —y a veces adelantarse— a los plazos.
              </p>
            </article>
            <article className="rounded-3xl border border-brand/10 bg-gradient-to-b from-surface-sand to-white p-6 shadow-sm">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand shadow-sm">
                ❤ Regalo
              </span>
              <h2 className="font-display text-xl font-bold text-brand">
                Cada pedido, un regalo
              </h2>
              <p className="mt-3 text-foreground/85">
                Papel kraft estampado, moño, etiqueta con logo, bolsa de friselina o embalaje
                cuidado: adentro, folleto y tarjetita para regalar. Los clientes destacan el
                empaque y los detalles.
              </p>
            </article>
          </div>
        </section>

        <TrustStrip />
        <QuienesSomos />
        <ClientesSection />

        <section className="px-4 py-16 text-center sm:px-6">
          <p className="mx-auto max-w-lg text-lg text-foreground/90">
            ¿Listo para ver todo el catálogo?
          </p>
          <Link
            href="/tienda"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full border-2 border-brand bg-transparent px-8 text-base font-bold text-brand transition hover:bg-surface-ice focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Ver productos
          </Link>
        </section>

        <EnviosPagosSection />
        <FaqSection />
        <ContactoSection />
      </main>
      <SiteFooter />
    </>
  );
}
