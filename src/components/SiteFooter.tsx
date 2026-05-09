import Link from "next/link";
import { getAddressLines } from "@/config/site";

const links = [
  { href: "/#confianza", label: "Confianza" },
  { href: "/#quienes-somos", label: "Quiénes somos" },
  { href: "/#clientes", label: "Clientes" },
  { href: "/#envios-pagos", label: "Envíos y pagos" },
  { href: "/#preguntas-frecuentes", label: "FAQ" },
  { href: "/#contacto", label: "Contacto" },
  { href: "/tienda", label: "Tienda" },
];

const legalLinks = [
  { href: "/terminos", label: "Términos y condiciones" },
  { href: "/privacidad", label: "Política de privacidad" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-black/5 bg-surface-mint/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-[max(2rem,calc(2rem+env(safe-area-inset-bottom,0px)))] pt-8 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] sm:pl-[max(1.5rem,env(safe-area-inset-left,0px))] sm:pr-[max(1.5rem,env(safe-area-inset-right,0px))]">
        <nav
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-brand"
          aria-label="Pie de página"
        >
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:underline">
              {l.label}
            </Link>
          ))}
        </nav>
        <nav
          className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-foreground/70"
          aria-label="Información legal"
        >
          {legalLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brand hover:underline">
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="break-words text-center text-xs text-foreground/65 sm:text-left">
          {getAddressLines().join(" · ")}
        </p>
        <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-sm text-foreground/80">
            © {new Date().getFullYear()} Zigyzoo. Todos los derechos reservados.
          </p>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Tu mundo infantil
          </p>
        </div>
      </div>
    </footer>
  );
}
