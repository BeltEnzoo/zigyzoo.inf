"use client";

import { useState } from "react";
import { createMercadoPagoPreference } from "@/app/actions/create-mp-preference";
import type { CartLine } from "@/store/cart";
import type { CheckoutBuyerPayload } from "@/types/checkout-buyer";

type Props = {
  lines: CartLine[];
  /** CP ingresado (el servidor recotiza al pagar). */
  postalCodeRaw: string;
  buyer: CheckoutBuyerPayload;
  /** Hubo “Calcular envío” y hay cotización vigente. */
  shippingReady: boolean;
  /** Datos del comprador válidos (nombre, DNI, mail, etc.). */
  buyerReady: boolean;
  disabled?: boolean;
};

export function MercadoPagoCheckoutButton({
  lines,
  postalCodeRaw,
  buyer,
  shippingReady,
  buyerReady,
  disabled,
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setError(null);
    setPending(true);
    try {
      const result = await createMercadoPagoPreference(lines, postalCodeRaw, buyer);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.location.href = result.url;
    } catch {
      setError("No se pudo conectar. Probá de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full sm:w-auto">
      <button
        type="button"
        onClick={handlePay}
        disabled={
          disabled || pending || lines.length === 0 || !shippingReady || !buyerReady
        }
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#009ee3] px-6 text-sm font-bold text-white shadow-md transition hover:brightness-110 disabled:opacity-50 sm:min-w-[14rem]"
      >
        {pending ? "Redirigiendo…" : "Pagar con Mercado Pago"}
      </button>
      {error && (
        <p className="mt-2 text-sm font-medium text-accent-terracotta" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
