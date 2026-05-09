"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cartLineCount, useCartStore } from "@/store/cart";

/** Carrito estilo Lucide: cesta + ruedas bien visibles. */
export function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="8" cy="21" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="21" r="1.5" fill="currentColor" stroke="none" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

export function CartLink() {
  const lines = useCartStore((s) => s.lines);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const count = mounted ? cartLineCount(lines) : 0;

  return (
    <Link
      href="/carrito"
      className="relative flex shrink-0 items-center justify-center rounded-full p-2 text-brand transition hover:bg-surface-ice"
      aria-label={`Carrito de compras${count ? `, ${count} artículos` : ""}`}
    >
      <CartIcon className="h-7 w-7" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
