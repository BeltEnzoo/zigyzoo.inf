import { create } from "zustand";
import { persist } from "zustand/middleware";

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

type CartState = {
  lines: CartLine[];
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
  clear: () => void;
};

function lineId(productId: string, variantId: string) {
  return `${productId}::${variantId}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],

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
        set((state) => ({
          lines: state.lines
            .map((l) => {
              if (l.lineId !== lineId) return l;
              const q = Math.max(0, Math.min(quantity, l.maxStock));
              return { ...l, quantity: q };
            })
            .filter((l) => l.quantity > 0),
        }));
      },

      removeLine: (lineId) => {
        set((state) => ({
          lines: state.lines.filter((l) => l.lineId !== lineId),
        }));
      },

      clear: () => set({ lines: [] }),
    }),
    { name: "zigyzoo-cart" },
  ),
);

export function cartLineCount(lines: CartLine[]) {
  return lines.reduce((n, l) => n + l.quantity, 0);
}

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
}
