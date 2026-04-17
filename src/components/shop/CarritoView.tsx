"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/format";
import { cartSubtotal, useCartStore } from "@/store/cart";

export function CarritoView() {
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const clear = useCartStore((s) => s.clear);

  const subtotal = cartSubtotal(lines);

  if (lines.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-brand/30 bg-surface-ice/50 px-6 py-16 text-center">
        <p className="text-lg font-medium text-foreground/80">Tu carrito está vacío.</p>
        <Link
          href="/tienda"
          className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 font-bold text-white hover:brightness-110"
        >
          Ver tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ul className="divide-y divide-black/10 rounded-3xl border border-black/5 bg-white">
        {lines.map((line) => (
          <li
            key={line.lineId}
            className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6"
          >
            <div className="flex gap-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-surface-ice">
                {line.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={line.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-foreground/40">
                    Sin foto
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/tienda/${line.slug}`}
                  className="font-display font-bold text-brand hover:underline"
                >
                  {line.name}
                </Link>
                <p className="text-sm text-foreground/65">
                  {line.sizeLabel} · {formatMoney(line.price, line.currency)} c/u
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
              <div className="flex items-center gap-1 rounded-full border border-black/10 bg-white">
                <button
                  type="button"
                  className="px-3 py-2 text-lg leading-none text-brand hover:bg-surface-ice"
                  onClick={() => setQuantity(line.lineId, line.quantity - 1)}
                  aria-label="Quitar uno"
                >
                  −
                </button>
                <span className="min-w-8 text-center text-sm font-semibold">{line.quantity}</span>
                <button
                  type="button"
                  className="px-3 py-2 text-lg leading-none text-brand hover:bg-surface-ice"
                  onClick={() => setQuantity(line.lineId, line.quantity + 1)}
                  disabled={line.quantity >= line.maxStock}
                  aria-label="Agregar uno"
                >
                  +
                </button>
              </div>
              <p className="min-w-[7rem] text-right font-bold">
                {formatMoney(line.price * line.quantity, line.currency)}
              </p>
              <button
                type="button"
                onClick={() => removeLine(line.lineId)}
                className="text-sm font-semibold text-foreground/55 hover:text-accent-terracotta"
              >
                Quitar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-surface-mint/30 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-foreground/70">Subtotal</p>
          <p className="font-display text-2xl font-bold text-brand">
            {formatMoney(subtotal, lines[0]?.currency ?? "ARS")}
          </p>
          <p className="mt-2 text-xs text-foreground/60">
            Envío y pago: próximamente. Podés vaciar el carrito o seguir comprando.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => clear()}
            className="rounded-full border border-brand/30 px-5 py-2.5 text-sm font-semibold text-brand hover:bg-white"
          >
            Vaciar carrito
          </button>
          <Link
            href="/tienda"
            className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white hover:brightness-110"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
