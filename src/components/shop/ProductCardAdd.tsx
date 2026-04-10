"use client";

import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/store/cart";
import type { ProductListItem } from "@/types/shop";

type Props = {
  product: ProductListItem;
  imageUrl: string | null;
};

export function ProductCardAdd({ product, imageUrl }: Props) {
  const addOrUpdateLine = useCartStore((s) => s.addOrUpdateLine);
  const variantsInStock = useMemo(
    () => product.product_variants.filter((v) => v.stock > 0),
    [product.product_variants],
  );
  const [variantId, setVariantId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!variantId && variantsInStock.length > 0) {
      setVariantId(variantsInStock[0].id);
    }
  }, [variantId, variantsInStock]);

  const selected = product.product_variants.find((v) => v.id === variantId);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setMsg(null);
    if (!selected || selected.stock <= 0) return;
    addOrUpdateLine({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl,
      price: product.price,
      currency: product.currency,
      variantId: selected.id,
      sizeLabel: selected.size_label || "?",
      quantity: 1,
      maxStock: selected.stock,
    });
    setMsg("¡Listo!");
    window.setTimeout(() => setMsg(null), 2000);
  }

  if (variantsInStock.length === 0) {
    return (
      <p className="mt-3 text-xs text-foreground/50" onClick={(e) => e.stopPropagation()}>
        Sin stock
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
      <label className="sr-only" htmlFor={`talle-${product.id}`}>
        Talle para {product.name}
      </label>
      <select
        id={`talle-${product.id}`}
        value={variantId}
        onChange={(e) => setVariantId(e.target.value)}
        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium text-foreground outline-none focus:border-brand focus:ring-1 focus:ring-brand/30"
      >
        {variantsInStock.map((v) => (
          <option key={v.id} value={v.id}>
            Talle {v.size_label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleAdd}
        className="w-full rounded-full bg-brand py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
      >
        Agregar al carrito
      </button>
      {msg && (
        <p className="text-center text-xs font-medium text-accent-sage" role="status">
          {msg}
        </p>
      )}
    </div>
  );
}
