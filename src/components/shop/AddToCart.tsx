"use client";

import { useRouter } from "next/navigation";
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
  /** Ficha de producto: listar todas las variantes (p. ej. para alinear con fotos por índice). */
  listAllVariants?: boolean;
  /** Modo controlado desde el padre (galería sincronizada). */
  variantId?: string;
  onVariantChange?: (variantId: string) => void;
};

export function AddToCart({
  product,
  listAllVariants = false,
  variantId: controlledVariantId,
  onVariantChange,
}: Props) {
  const router = useRouter();
  const addOrUpdateLine = useCartStore((s) => s.addOrUpdateLine);
  const isControlled = typeof onVariantChange === "function";
  const [internalVariantId, setInternalVariantId] = useState<string>("");
  const variantId = isControlled ? (controlledVariantId ?? "") : internalVariantId;
  const setVariantId = isControlled ? onVariantChange! : setInternalVariantId;

  const [qty, setQty] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  const variantsInStock = useMemo(
    () => product.variants.filter((v) => v.stock > 0),
    [product.variants],
  );

  const variantsForSelect = useMemo(() => {
    if (listAllVariants) return product.variants;
    return variantsInStock;
  }, [listAllVariants, product.variants, variantsInStock]);

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
    if (isControlled) return;
    if (!variantId && variantsInStock.length > 0) {
      setInternalVariantId(variantsInStock[0].id);
    }
  }, [isControlled, variantId, variantsInStock]);

  const selected = product.variants.find((v) => v.id === variantId);
  const maxQty = selected?.stock ?? 0;

  useEffect(() => {
    if (selected) setQty((q) => Math.min(Math.max(1, q), maxQty));
  }, [selected, maxQty]);

  function addSelectionToCart(): boolean {
    if (!selected || maxQty <= 0) return false;
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
    return true;
  }

  function handleAdd() {
    setFeedback(null);
    if (!addSelectionToCart()) {
      setFeedback("Elegí una variante con stock.");
      return;
    }
    setFeedback("Agregado al carrito.");
  }

  function handleBuyNow() {
    setFeedback(null);
    if (!addSelectionToCart()) {
      setFeedback("Elegí una variante con stock.");
      return;
    }
    router.push("/carrito");
  }

  if (product.variants.length === 0) {
    return (
      <p className="text-sm text-foreground/65">No hay variantes cargadas.</p>
    );
  }

  if (!listAllVariants && variantsInStock.length === 0) {
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
          className="w-full max-w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[16px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/25 sm:max-w-xs sm:text-sm"
          value={variantId}
          onChange={(e) => {
            setVariantId(e.target.value);
            setQty(1);
          }}
        >
          {!isControlled && <option value="">Elegí una variante</option>}
          {variantsForSelect.map((v) => (
            <option key={v.id} value={v.id}>
              {formatVariantOptionLabel(v)}
              {v.stock > 0 ? ` (${v.stock} disponibles)` : " (sin stock)"}
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
          inputMode="numeric"
          min={1}
          max={maxQty || 1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          disabled={!selected}
          className="min-h-12 w-full max-w-[8rem] rounded-2xl border border-black/10 bg-white px-4 py-3 text-[16px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/25 disabled:opacity-50 sm:w-24 sm:text-sm"
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selected || maxQty <= 0}
          className="inline-flex min-h-12 w-full max-w-full items-center justify-center rounded-full bg-brand px-6 text-base font-bold text-white shadow-md transition hover:brightness-110 disabled:opacity-50 sm:w-auto sm:max-w-xs"
        >
          Agregar al carrito
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!selected || maxQty <= 0}
          className="inline-flex min-h-12 w-full max-w-full items-center justify-center rounded-full border-2 border-brand bg-transparent px-6 text-base font-bold text-brand transition hover:bg-surface-ice disabled:opacity-50 sm:w-auto sm:max-w-xs"
        >
          Comprar ahora
        </button>
      </div>
      {feedback && (
        <p className="text-sm font-medium text-accent-sage" role="status">
          {feedback}
        </p>
      )}
    </div>
  );
}
