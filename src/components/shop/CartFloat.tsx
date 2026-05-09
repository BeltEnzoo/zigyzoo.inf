"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartIcon } from "@/components/shop/CartLink";
import { cartLineCount, useCartStore } from "@/store/cart";

/** Carrito flotante solo en móvil cuando hay ítems (el navbar no muestra el ícono en pantallas chicas). */
export function CartFloat() {
  const pathname = usePathname();
  const lines = useCartStore((s) => s.lines);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const count = mounted ? cartLineCount(lines) : 0;

  if (!mounted || count === 0 || pathname?.startsWith("/admin")) return null;

  return (
    <Link
      href="/carrito"
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom,0px))] left-[max(1.25rem,env(safe-area-inset-left,0px))] z-[59] flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-black/20 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:hidden"
      aria-label={`Ir al carrito, ${count} artículos`}
    >
      <CartIcon className="h-7 w-7 text-white" />
      <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-brand ring-2 ring-brand">
        {count > 99 ? "99+" : count}
      </span>
    </Link>
  );
}
