import Image from "next/image";
import Link from "next/link";
import { CartLink } from "@/components/shop/CartLink";

const nav = [
  { href: "/#quienes-somos", label: "Nosotros" },
  { href: "/#clientes", label: "Clientes" },
  { href: "/#contacto", label: "Contacto" },
  { href: "/tienda", label: "Tienda" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[var(--color-fondo-pagina)]/90 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl min-w-0 items-center gap-2 py-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] sm:gap-4 sm:pl-[max(1.5rem,env(safe-area-inset-left,0px))] sm:pr-[max(1.5rem,env(safe-area-inset-right,0px))]">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2 transition-opacity hover:opacity-90"
        >
          <Image
            src="/zigyzoo-lockup.png"
            alt="Zigyzoo — Tu mundo infantil"
            width={360}
            height={120}
            className="h-12 w-auto sm:h-[3.8rem]"
            priority
            sizes="(max-width: 640px) 240px, 280px"
          />
        </Link>
        <nav
          className="flex min-w-0 flex-1 flex-nowrap items-center justify-end gap-0.5 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch] sm:gap-1 md:gap-2"
          aria-label="Principal"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full px-2.5 py-2 text-xs font-semibold text-brand transition-colors hover:bg-surface-ice sm:px-4 sm:text-base"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="shrink-0">
          <CartLink />
        </div>
      </div>
    </header>
  );
}
