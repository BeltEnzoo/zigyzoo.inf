"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cart";

/** Mercado Pago redirige con collection_status / status en la URL (Checkout Pro). */
export function PaymentExitosoClient() {
  const searchParams = useSearchParams();
  const clear = useCartStore((s) => s.clear);

  const collectionStatus = searchParams.get("collection_status");
  const status = searchParams.get("status");

  const approved = useMemo(() => {
    const s = collectionStatus ?? status;
    return s === "approved";
  }, [collectionStatus, status]);

  useEffect(() => {
    if (approved) clear();
  }, [approved, clear]);

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-black/5 bg-white px-6 py-10 text-center shadow-sm">
      {approved ? (
        <>
          <p className="font-display text-2xl font-bold text-brand">¡Pago aprobado!</p>
          <p className="mt-3 text-foreground/80">
            Gracias por tu compra. Te contactaremos si hace falta confirmar envío o datos del pedido.
          </p>
        </>
      ) : (
        <>
          <p className="font-display text-2xl font-bold text-brand">Pago recibido o en proceso</p>
          <p className="mt-3 text-foreground/80">
            Si el estado no figura como aprobado aún, puede estar pendiente con tu banco o Mercado Pago.
            Revisá tu correo o la app de Mercado Pago.
          </p>
        </>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/tienda"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-6 text-sm font-bold text-white hover:brightness-110"
        >
          Seguir comprando
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-brand px-6 text-sm font-bold text-brand hover:bg-surface-ice"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
