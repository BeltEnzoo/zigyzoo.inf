"use client";

import { useEffect, useMemo, useState } from "react";
import { formatVariantOptionLabel } from "@/lib/shop/variant-label";
import { useCartStore } from "@/store/cart";

type Variant = {
  id: string;
  size_label: string;
  stock: number;
  color_producto?: string | null;
  tamano_producto?: string | null;
};

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    currency: string;
    imageUrl: string | null;
    variants: Variant[];
  };
};

export function AddToCart({ product }: Props) {
  const addOrUpdateLine = useCartStore((s) => s.addOrUpdateLine);
  const [variantId, setVariantId] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  const variantsInStock = useMemo(
    () => product.variants.filter((v) => v.stock > 0),
    [product.variants],
  );

  const showVariantHint = useMemo(
    () =>
      product.variants.some(
        (v) =>
          (v.color_producto?.trim() ?? "") !== "" ||
          (v.tamano_producto?.trim() ?? "") !== "",
      ),
    [product.variants],
  );

  useEffect(() => {
    if (!variantId && variantsInStock.length > 0) {
      setVariantId(variantsInStock[0].id);
    }
  }, [variantId, variantsInStock]);

  const selected = product.variants.find((v) => v.id === variantId);
  const maxQty = selected?.stock ?? 0;

  useEffect(() => {
    if (selected) setQty((q) => Math.min(Math.max(1, q), maxQty));
  }, [selected, maxQty]);

  function handleAdd() {
    setFeedback(null);
    if (!selected || maxQty <= 0) {
      setFeedback("Elegí una variante con stock.");
      return;
    }
    const q = Math.min(Math.max(1, qty), maxQty);
    addOrUpdateLine({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      currency: product.currency,
      variantId: selected.id,
      sizeLabel: formatVariantOptionLabel(selected),
      quantity: q,
      maxStock: selected.stock,
    });
    setFeedback("Agregado al carrito.");
  }

  if (variantsInStock.length === 0) {
    return (
      <p className="text-sm text-foreground/65">No hay variantes con stock por ahora.</p>
    );
  }

  return (
    <div className="mt-8 space-y-4 rounded-2xl border border-black/5 bg-surface-ice/40 p-5">
      <h2 className="font-display text-lg font-bold text-brand">Comprar</h2>
      <div>
        <label htmlFor="variant" className="mb-1 block text-sm font-semibold">
          Variante
        </label>
        {showVariantHint && (
          <p id="variant-hint" className="mb-2 text-xs leading-relaxed text-foreground/60">
            Orden en cada opción: color · tamaño · talle (solo aparecen los datos que
            tenga el producto).
          </p>
        )}
        <select
          id="variant"
          aria-describedby={showVariantHint ? "variant-hint" : undefined}
          className="w-full max-w-xs rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          value={variantId}
          onChange={(e) => {
            setVariantId(e.target.value);
            setQty(1);
          }}
        >
          <option value="">Elegí una variante</option>
          {variantsInStock.map((v) => (
            <option key={v.id} value={v.id}>
              {formatVariantOptionLabel(v)} ({v.stock} disponibles)
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="qty" className="mb-1 block text-sm font-semibold">
          Cantidad
        </label>
        <input
          id="qty"
          type="number"
          min={1}
          max={maxQty || 1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          disabled={!selected}
          className="w-24 rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25 disabled:opacity-50"
        />
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={!selected}
        className="inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-full bg-brand px-8 text-base font-bold text-white shadow-md transition hover:brightness-110 disabled:opacity-50 sm:w-auto"
      >
        Agregar al carrito
      </button>
      {feedback && (
        <p className="text-sm font-medium text-accent-sage" role="status">
          {feedback}
        </p>
      )}
    </div>
  );
}
