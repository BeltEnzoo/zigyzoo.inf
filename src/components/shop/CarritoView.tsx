"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { lookupPostalLocality } from "@/app/actions/lookup-postal-locality";
import { MercadoPagoCheckoutButton } from "@/components/shop/MercadoPagoCheckoutButton";
import { getWhatsAppUrl } from "@/config/site";
import { validateBuyerPayload } from "@/lib/checkout/validate-buyer";
import { formatMoney } from "@/lib/format";
import { buildCoordinarWhatsAppMessage } from "@/lib/shipping/build-coordinar-whatsapp-message";
import {
  formatNormalizedPostalCodeForStorage,
  isValidShippingPostalInput,
  quoteShippingByMethod,
  shippingMethodChargesInCheckout,
} from "@/lib/shipping/quote";
import { cartGrandTotal, cartSubtotal, useCartStore } from "@/store/cart";
import type { ShippingMethod } from "@/types/shipping";
import {
  SHIPPING_COORDINAR_LABEL,
  SHIPPING_CORREO_SUCURSAL_TITLE,
  SHIPPING_ENTREGA_PROPIA_TITLE,
} from "@/types/shipping";

const STEPS = [
  { n: 1, title: "Carrito", short: "Carrito" },
  { n: 2, title: "Tus datos", short: "Datos" },
  { n: 3, title: "Envío", short: "Envío" },
  { n: 4, title: "Pago", short: "Pago" },
] as const;

type Props = {
  /** Si falta `MERCADOPAGO_ACCESS_TOKEN` en el servidor, el botón queda deshabilitado. */
  mercadoPagoConfigured?: boolean;
};

export function CarritoView({ mercadoPagoConfigured = false }: Props) {
  const lines = useCartStore((s) => s.lines);
  const shippingPostalInput = useCartStore((s) => s.shippingPostalInput ?? "");
  const shipping = useCartStore((s) => s.shipping);
  const shippingMethod = useCartStore((s) => s.shippingMethod ?? "correo_sucursal");
  const buyer = useCartStore((s) => s.buyer);
  const setBuyer = useCartStore((s) => s.setBuyer);
  const setShippingPostalInput = useCartStore((s) => s.setShippingPostalInput);
  const setShippingMethod = useCartStore((s) => s.setShippingMethod);
  const setShippingQuote = useCartStore((s) => s.setShippingQuote);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const clear = useCartStore((s) => s.clear);

  const [step, setStep] = useState(1);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [localityLabel, setLocalityLabel] = useState<string | null>(null);
  const [localityLoading, setLocalityLoading] = useState(false);

  useEffect(() => {
    if (!shipping) {
      setLocalityLabel(null);
      setLocalityLoading(false);
      return;
    }
    let cancelled = false;
    setLocalityLoading(true);
    lookupPostalLocality(shipping.normalizedPostalCode)
      .then((loc) => {
        if (cancelled) return;
        setLocalityLabel(loc.ok ? loc.label : null);
      })
      .finally(() => {
        if (!cancelled) setLocalityLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shipping?.normalizedPostalCode]);

  const subtotal = cartSubtotal(lines);
  const grandTotal = cartGrandTotal(lines, shipping?.costARS ?? null);
  const currency = lines[0]?.currency ?? "ARS";
  const lineCount = lines.reduce((n, l) => n + l.quantity, 0);

  const buyerValidation = useMemo(() => validateBuyerPayload(buyer), [buyer]);
  const buyerReady = buyerValidation.ok;

  const coordinarWhatsAppHref = useMemo(() => {
    if (shipping?.method !== "coordinar") return null;
    return getWhatsAppUrl(
      buildCoordinarWhatsAppMessage({
        lines,
        buyer,
        postalCode: shipping.normalizedPostalCode,
        subtotal,
        currency,
      }),
    );
  }, [shipping, lines, buyer, subtotal, currency]);

  function selectShippingMethod(method: ShippingMethod) {
    if (method !== shippingMethod) setShippingMethod(method);
  }

  function handleQuoteShipping() {
    setQuoteError(null);
    if (!isValidShippingPostalInput(shippingPostalInput)) {
      setQuoteError(
        "Ingresá un código postal válido (4 dígitos, ej. 1000 o 1643, o con letra: C1425 / B1643).",
      );
      return;
    }
    const q = quoteShippingByMethod(shippingMethod, shippingPostalInput);
    if (!q) {
      setQuoteError(
        shippingMethod === "entrega_propia"
          ? "Entrega propia no está disponible para ese código postal. Probá Correo (sucursal) o coordinar con la tienda."
          : "Correo a sucursal no está disponible para ese código postal. Probá entrega propia o coordinar con la tienda.",
      );
      return;
    }
    setShippingQuote({
      method: shippingMethod,
      normalizedPostalCode: formatNormalizedPostalCodeForStorage(shippingPostalInput),
      costARS: q.costARS,
      label: q.label,
    });
  }

  function handleConfirmCoordinar() {
    setQuoteError(null);
    if (!isValidShippingPostalInput(shippingPostalInput)) {
      setQuoteError(
        "Ingresá tu código postal (4 dígitos o con letra, ej. 1000 o B1643) para coordinar el envío.",
      );
      return;
    }
    setShippingQuote({
      method: "coordinar",
      normalizedPostalCode: formatNormalizedPostalCodeForStorage(shippingPostalInput),
      costARS: 0,
      label: SHIPPING_COORDINAR_LABEL,
    });
  }

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
      {/* Indicador de pasos */}
      <nav aria-label="Pasos del checkout" className="rounded-2xl border border-black/5 bg-white px-3 py-4 sm:px-5">
        <ol className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          {STEPS.map((s, i) => {
            const done = step > s.n;
            const current = step === s.n;
            return (
              <li key={s.n} className="flex min-w-0 flex-1 items-center gap-2 sm:min-w-[4.5rem]">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold sm:h-10 sm:w-10 ${
                    current
                      ? "bg-brand text-white shadow-sm"
                      : done
                        ? "bg-brand/15 text-brand"
                        : "bg-surface-ice text-foreground/45"
                  }`}
                  aria-current={current ? "step" : undefined}
                >
                  {done ? "✓" : s.n}
                </div>
                <span
                  className={`hidden text-xs font-semibold sm:block sm:truncate ${
                    current ? "text-brand" : done ? "text-foreground/80" : "text-foreground/45"
                  }`}
                >
                  {s.title}
                </span>
                {i < STEPS.length - 1 && (
                  <span
                    className="mx-0.5 hidden h-px min-w-[0.5rem] flex-1 bg-black/10 sm:block"
                    aria-hidden
                  />
                )}
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-center text-xs text-foreground/55 sm:hidden">
          Paso {step} de {STEPS.length}: {STEPS[step - 1]?.title}
        </p>
      </nav>

      {/* Paso 1: carrito */}
      {step === 1 && (
        <>
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
                      className="break-words font-display font-bold text-brand hover:underline"
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
                      className="flex min-h-11 min-w-11 items-center justify-center text-xl leading-none text-brand hover:bg-surface-ice"
                      onClick={() => setQuantity(line.lineId, line.quantity - 1)}
                      aria-label="Quitar uno"
                    >
                      −
                    </button>
                    <span className="min-w-9 text-center text-sm font-semibold">{line.quantity}</span>
                    <button
                      type="button"
                      className="flex min-h-11 min-w-11 items-center justify-center text-xl leading-none text-brand hover:bg-surface-ice disabled:opacity-40"
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

          <div className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-surface-mint/30 p-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-4">
              <div>
                <p className="text-sm text-foreground/65">
                  {lineCount} {lineCount === 1 ? "producto" : "productos"}
                </p>
                <p className="font-display text-xl font-bold text-brand">
                  Subtotal {formatMoney(subtotal, currency)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-8 text-sm font-bold text-white shadow-sm hover:brightness-110"
              >
                Comprar
              </button>
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
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-bold text-brand ring-1 ring-black/10 hover:bg-surface-ice"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Pasos 2–4: resumen compacto del pedido */}
      {step >= 2 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-brand/20 bg-brand/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground/85">
            <span className="font-semibold text-brand">{lineCount}</span>{" "}
            {lineCount === 1 ? "producto" : "productos"} · Subtotal{" "}
            <span className="font-bold">{formatMoney(subtotal, currency)}</span>
          </p>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-left text-sm font-semibold text-brand underline-offset-2 hover:underline"
          >
            Editar carrito
          </button>
        </div>
      )}

      {/* Paso 2: datos */}
      {step === 2 && (
        <section className="rounded-2xl border border-black/5 bg-white px-4 py-5 sm:px-6">
          <h2 className="font-display text-lg font-bold text-brand">Tus datos</h2>
          <p className="mt-2 text-sm text-foreground/70">
            Los usamos para Mercado Pago y para contactarte si hace falta sobre el envío.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="cart-buyer-first" className="mb-1 block text-xs font-semibold text-foreground/70">
                Nombre
              </label>
              <input
                id="cart-buyer-first"
                type="text"
                autoComplete="given-name"
                value={buyer.firstName}
                onChange={(e) => setBuyer({ firstName: e.target.value })}
                className="min-h-12 w-full rounded-2xl border border-black/10 bg-surface-ice/40 px-4 py-3 text-[16px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="cart-buyer-last" className="mb-1 block text-xs font-semibold text-foreground/70">
                Apellido
              </label>
              <input
                id="cart-buyer-last"
                type="text"
                autoComplete="family-name"
                value={buyer.lastName}
                onChange={(e) => setBuyer({ lastName: e.target.value })}
                className="min-h-12 w-full rounded-2xl border border-black/10 bg-surface-ice/40 px-4 py-3 text-[16px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="cart-buyer-dni" className="mb-1 block text-xs font-semibold text-foreground/70">
                DNI
              </label>
              <input
                id="cart-buyer-dni"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Sin puntos"
                value={buyer.dni}
                onChange={(e) => setBuyer({ dni: e.target.value })}
                className="min-h-12 w-full rounded-2xl border border-black/10 bg-surface-ice/40 px-4 py-3 text-[16px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="cart-buyer-phone" className="mb-1 block text-xs font-semibold text-foreground/70">
                Celular
              </label>
              <input
                id="cart-buyer-phone"
                type="tel"
                autoComplete="tel"
                placeholder="Ej. 11 2345 6789"
                value={buyer.phone}
                onChange={(e) => setBuyer({ phone: e.target.value })}
                className="min-h-12 w-full rounded-2xl border border-black/10 bg-surface-ice/40 px-4 py-3 text-[16px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-3">
            <label htmlFor="cart-buyer-email" className="mb-1 block text-xs font-semibold text-foreground/70">
              Correo electrónico
            </label>
            <input
              id="cart-buyer-email"
              type="email"
              autoComplete="email"
              enterKeyHint="done"
              value={buyer.email}
              onChange={(e) => setBuyer({ email: e.target.value })}
              className="min-h-12 w-full rounded-2xl border border-black/10 bg-surface-ice/40 px-4 py-3 text-[16px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 sm:text-sm"
            />
          </div>
          {!buyerReady && buyerValidation.ok === false && (
            <p className="mt-3 text-sm font-medium text-accent-terracotta" role="status">
              {buyerValidation.error}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3 border-t border-black/10 pt-5">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-foreground/80 hover:bg-surface-ice"
            >
              Atrás
            </button>
            <button
              type="button"
              disabled={!buyerReady}
              onClick={() => setStep(3)}
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-brand px-8 text-sm font-bold text-white shadow-sm hover:brightness-110 disabled:opacity-45 sm:flex-none"
            >
              Continuar
            </button>
          </div>
        </section>
      )}

      {/* Paso 3: envío */}
      {step === 3 && (
        <section className="rounded-2xl border border-black/5 bg-white px-4 py-5 sm:px-6">
          <h2 className="font-display text-lg font-bold text-brand">Envío</h2>
          <p className="mt-2 text-sm text-foreground/70">
            Elegí cómo querés recibir el pedido. Entrega propia (CABA/GBA) y Correo en sucursal muestran el precio al
            instante según tu CP; también podés coordinar por WhatsApp (el envío se abona aparte).
          </p>

          <fieldset className="mt-4 space-y-2">
            <legend className="sr-only">Método de envío</legend>
            <label
              className={`flex cursor-pointer gap-3 rounded-2xl border px-4 py-3 transition ${
                shippingMethod === "entrega_propia"
                  ? "border-brand bg-brand/5 ring-2 ring-brand/20"
                  : "border-black/10 bg-surface-ice/30 hover:border-brand/30"
              }`}
            >
              <input
                type="radio"
                name="shipping-method"
                className="mt-1 accent-brand"
                checked={shippingMethod === "entrega_propia"}
                onChange={() => selectShippingMethod("entrega_propia")}
              />
              <span>
                <span className="font-semibold text-foreground">{SHIPPING_ENTREGA_PROPIA_TITLE}</span>
                <span className="mt-0.5 block text-sm text-foreground/65">
                  Entregamos nosotros en CABA y zonas de GBA según tu código postal.
                </span>
              </span>
            </label>
            <label
              className={`flex cursor-pointer gap-3 rounded-2xl border px-4 py-3 transition ${
                shippingMethod === "correo_sucursal"
                  ? "border-brand bg-brand/5 ring-2 ring-brand/20"
                  : "border-black/10 bg-surface-ice/30 hover:border-brand/30"
              }`}
            >
              <input
                type="radio"
                name="shipping-method"
                className="mt-1 accent-brand"
                checked={shippingMethod === "correo_sucursal"}
                onChange={() => selectShippingMethod("correo_sucursal")}
              />
              <span>
                <span className="font-semibold text-foreground">{SHIPPING_CORREO_SUCURSAL_TITLE}</span>
                <span className="mt-0.5 block text-sm text-foreground/65">
                  Retiro en sucursal del Correo Argentino (tarifa referencia ~1 kg).
                </span>
              </span>
            </label>
            <label
              className={`flex cursor-pointer gap-3 rounded-2xl border px-4 py-3 transition ${
                shippingMethod === "coordinar"
                  ? "border-brand bg-brand/5 ring-2 ring-brand/20"
                  : "border-black/10 bg-surface-ice/30 hover:border-brand/30"
              }`}
            >
              <input
                type="radio"
                name="shipping-method"
                className="mt-1 accent-brand"
                checked={shippingMethod === "coordinar"}
                onChange={() => selectShippingMethod("coordinar")}
              />
              <span>
                <span className="font-semibold text-foreground">Coordinar con la tienda</span>
                <span className="mt-0.5 block text-sm text-foreground/65">
                  Pagás solo los productos ahora; el envío lo definimos por WhatsApp.
                </span>
              </span>
            </label>
          </fieldset>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label htmlFor="cart-cp" className="mb-1 block text-xs font-semibold text-foreground/70">
                Código postal de envío
              </label>
              <input
                id="cart-cp"
                type="text"
                autoComplete="postal-code"
                enterKeyHint="done"
                placeholder="Ej. 1000, 1643, C1425 o B1643"
                value={shippingPostalInput}
                onChange={(e) => setShippingPostalInput(e.target.value)}
                className="min-h-12 w-full rounded-2xl border border-black/10 bg-surface-ice/40 px-4 py-3 text-[16px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 sm:text-sm"
              />
            </div>
            {shippingMethodChargesInCheckout(shippingMethod) ? (
              <button
                type="button"
                onClick={handleQuoteShipping}
                className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-brand px-6 text-sm font-bold text-white shadow-sm hover:brightness-110"
              >
                Calcular envío
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmCoordinar}
                className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-brand px-6 text-sm font-bold text-white shadow-sm hover:brightness-110"
              >
                Confirmar
              </button>
            )}
          </div>

          {(localityLoading || localityLabel) && (
            <div className="mt-3 rounded-xl border border-black/[0.06] bg-surface-ice/40 px-3 py-2.5">
              {localityLoading && <p className="text-sm text-foreground/60">Buscando localidad…</p>}
              {!localityLoading && localityLabel && (
                <>
                  <p className="text-sm text-foreground/85">
                    <span className="text-foreground/55">Localidad (referencia): </span>
                    <span className="font-semibold text-foreground">{localityLabel}</span>
                  </p>
                  <p className="mt-1 text-[0.65rem] leading-snug text-foreground/50">
                    Dato orientativo (OpenStreetMap). El envío se cotiza por las zonas de la tienda.
                  </p>
                </>
              )}
            </div>
          )}

          {quoteError && (
            <p className="mt-3 text-sm font-medium text-accent-terracotta" role="alert">
              {quoteError}
            </p>
          )}
          {shipping && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-foreground/85">
                <span className="font-semibold text-brand">{shipping.label}</span>
                {shippingMethodChargesInCheckout(shipping.method) && (
                  <>
                    {" · "}
                    <span className="font-bold">{formatMoney(shipping.costARS, currency)}</span>
                  </>
                )}
                {shipping.method === "coordinar" && (
                  <span className="mt-1 block text-foreground/65">
                    En Mercado Pago pagás solo los productos. El envío lo coordinamos por WhatsApp.
                  </span>
                )}
              </p>
              {shipping.method === "coordinar" && coordinarWhatsAppHref && (
                <a
                  href={coordinarWhatsAppHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#25D366] px-5 text-sm font-bold text-white shadow-sm hover:brightness-110"
                >
                  Escribinos por WhatsApp
                </a>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3 border-t border-black/10 pt-5">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-foreground/80 hover:bg-surface-ice"
            >
              Atrás
            </button>
            <button
              type="button"
              disabled={shipping === null}
              onClick={() => setStep(4)}
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-brand px-8 text-sm font-bold text-white shadow-sm hover:brightness-110 disabled:opacity-45 sm:flex-none"
            >
              Continuar al pago
            </button>
          </div>
        </section>
      )}

      {/* Paso 4: método de pago */}
      {step === 4 && (
        <div className="flex flex-col gap-6 rounded-2xl border border-black/5 bg-surface-mint/30 p-6">
          <div>
            <h2 className="font-display text-lg font-bold text-brand">Método de pago</h2>
            <p className="mt-2 text-sm text-foreground/70">
              Pagás de forma segura con Mercado Pago (tarjeta, efectivo en puntos de pago, etc., según lo que ofrezca MP).
              Si el botón está deshabilitado, falta configurar las credenciales en el servidor.
            </p>
          </div>

          <div className="space-y-2 border-b border-black/10 pb-4">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-foreground/70">Subtotal productos</span>
              <span className="font-semibold">{formatMoney(subtotal, currency)}</span>
            </div>
            {shipping && (
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-foreground/70">Envío ({shipping.label})</span>
                <span className="font-semibold">
                  {shipping.method === "coordinar"
                    ? "A coordinar"
                    : formatMoney(shipping.costARS, currency)}
                </span>
              </div>
            )}
            {shipping?.method === "coordinar" && coordinarWhatsAppHref && (
              <p className="text-xs text-foreground/60">
                Podés avisarnos el pedido por{" "}
                <a
                  href={coordinarWhatsAppHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand underline"
                >
                  WhatsApp
                </a>{" "}
                antes o después de pagar.
              </p>
            )}
            <div className="flex justify-between gap-4 pt-2">
              <span className="font-display text-lg font-bold text-brand">Total</span>
              <span className="font-display text-xl font-bold text-brand">
                {formatMoney(grandTotal, currency)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <MercadoPagoCheckoutButton
              lines={lines}
              postalCodeRaw={shippingPostalInput}
              buyer={buyer}
              shippingMethod={shipping?.method ?? "correo_sucursal"}
              shippingReady={shipping !== null}
              buyerReady={buyerReady}
              disabled={!mercadoPagoConfigured}
            />
            {!mercadoPagoConfigured && (
              <p className="text-xs text-foreground/55">
                Para activar el botón, configurá{" "}
                <code className="rounded bg-white/80 px-1 py-0.5 text-[0.65rem]">MERCADOPAGO_ACCESS_TOKEN</code> en
                el servidor.
              </p>
            )}
            {mercadoPagoConfigured && (
              <p className="text-xs text-foreground/55">
                Al completar el pago en Mercado Pago volverás al sitio con el resultado (exitoso, pendiente o error).
              </p>
            )}
          </div>

          <div className="border-t border-black/10 pt-4">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-foreground/80 hover:bg-surface-ice"
            >
              Atrás
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
