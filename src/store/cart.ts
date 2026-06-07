import { create } from "zustand";
import { persist } from "zustand/middleware";
import { normalizeArgentinePostalCode } from "@/lib/shipping/quote";
import type { CheckoutBuyerPayload } from "@/types/checkout-buyer";
import { normalizeShippingMethod, type ShippingMethod } from "@/types/shipping";

export type CartLine = {
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  price: number;
  currency: string;
  variantId: string;
  sizeLabel: string;
  quantity: number;
  maxStock: number;
};

/** Envío confirmado en el checkout (persistido con el carrito). */
export type ShippingQuoteSnapshot = {
  method: ShippingMethod;
  /** CP normalizado (servidor lo recotiza al pagar). */
  normalizedPostalCode: string;
  costARS: number;
  label: string;
};

function emptyBuyer(): CheckoutBuyerPayload {
  return {
    firstName: "",
    lastName: "",
    dni: "",
    phone: "",
    email: "",
  };
}

type CartState = {
  lines: CartLine[];
  /** Datos del comprador para Mercado Pago y el pedido. */
  buyer: CheckoutBuyerPayload;
  /** Texto del input de CP (solo UX). */
  shippingPostalInput: string;
  /** Método elegido en paso envío (antes de confirmar cotización). */
  shippingMethod: ShippingMethod;
  shipping: ShippingQuoteSnapshot | null;
  addOrUpdateLine: (input: {
    productId: string;
    slug: string;
    name: string;
    imageUrl: string | null;
    price: number;
    currency: string;
    variantId: string;
    sizeLabel: string;
    quantity: number;
    maxStock: number;
  }) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  setShippingPostalInput: (value: string) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  setShippingQuote: (snapshot: ShippingQuoteSnapshot) => void;
  setBuyer: (patch: Partial<CheckoutBuyerPayload>) => void;
  clearShipping: () => void;
  clear: () => void;
};

function emptyShipping() {
  return {
    shippingPostalInput: "",
    shippingMethod: "correo_sucursal" as ShippingMethod,
    shipping: null as ShippingQuoteSnapshot | null,
  };
}

function emptyCartExtras() {
  return { ...emptyShipping(), buyer: emptyBuyer() };
}

function lineId(productId: string, variantId: string) {
  return `${productId}::${variantId}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      buyer: emptyBuyer(),
      ...emptyShipping(),

      addOrUpdateLine: (input) => {
        const id = lineId(input.productId, input.variantId);
        const qty = Math.max(1, Math.min(input.quantity, input.maxStock));
        set((state) => {
          const idx = state.lines.findIndex((l) => l.lineId === id);
          if (idx === -1) {
            return {
              lines: [
                ...state.lines,
                {
                  lineId: id,
                  productId: input.productId,
                  slug: input.slug,
                  name: input.name,
                  imageUrl: input.imageUrl,
                  price: input.price,
                  currency: input.currency,
                  variantId: input.variantId,
                  sizeLabel: input.sizeLabel,
                  quantity: qty,
                  maxStock: input.maxStock,
                },
              ],
            };
          }
          const next = [...state.lines];
          const merged = Math.min(
            next[idx].quantity + input.quantity,
            input.maxStock,
          );
          next[idx] = {
            ...next[idx],
            quantity: Math.max(1, merged),
            maxStock: input.maxStock,
            price: input.price,
            name: input.name,
            imageUrl: input.imageUrl,
          };
          return { lines: next };
        });
      },

      setQuantity: (lineId, quantity) => {
        set((state) => {
          const lines = state.lines
            .map((l) => {
              if (l.lineId !== lineId) return l;
              const q = Math.max(0, Math.min(quantity, l.maxStock));
              return { ...l, quantity: q };
            })
            .filter((l) => l.quantity > 0);
          return {
            lines,
            ...(lines.length === 0 ? emptyCartExtras() : {}),
          };
        });
      },

      removeLine: (lineId) => {
        set((state) => {
          const lines = state.lines.filter((l) => l.lineId !== lineId);
          return {
            lines,
            ...(lines.length === 0 ? emptyCartExtras() : {}),
          };
        });
      },

      setShippingPostalInput: (value) =>
        set((state) => {
          const norm = normalizeArgentinePostalCode(value);
          const shippingStale =
            state.shipping !== null && norm !== state.shipping.normalizedPostalCode;
          return {
            shippingPostalInput: value,
            ...(shippingStale ? { shipping: null } : {}),
          };
        }),

      setShippingMethod: (method) =>
        set({
          shippingMethod: method,
          shipping: null,
        }),

      setShippingQuote: (snapshot) =>
        set({
          shipping: snapshot,
          shippingMethod: snapshot.method,
        }),

      setBuyer: (patch) =>
        set((state) => ({
          buyer: { ...state.buyer, ...patch },
        })),

      clearShipping: () => set({ shipping: null }),

      clear: () => set({ lines: [], ...emptyCartExtras() }),
    }),
    {
      name: "zigyzoo-cart",
      merge: (persistedState, currentState) => {
        const p = persistedState as Partial<CartState> | undefined;
        if (!p) return currentState;
        return {
          ...currentState,
          ...p,
          buyer:
            p.buyer && typeof p.buyer === "object"
              ? { ...emptyBuyer(), ...p.buyer }
              : currentState.buyer,
          shippingMethod: normalizeShippingMethod(p.shippingMethod),
          shipping:
            p.shipping && typeof p.shipping === "object"
              ? {
                  ...p.shipping,
                  method: normalizeShippingMethod(p.shipping.method),
                }
              : currentState.shipping,
        };
      },
    },
  ),
);

export function cartLineCount(lines: CartLine[]) {
  return lines.reduce((n, l) => n + l.quantity, 0);
}

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
}

export function cartGrandTotal(lines: CartLine[], shippingCostARS: number | null) {
  return cartSubtotal(lines) + (shippingCostARS ?? 0);
}
