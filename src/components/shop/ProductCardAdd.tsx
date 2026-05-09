"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CartIcon } from "@/components/shop/CartLink";
import { formatVariantOptionLabel } from "@/lib/shop/variant-label";
import { useCartStore } from "@/store/cart";
import type { ProductListItem } from "@/types/shop";

type Props = {
  product: ProductListItem;
  imageUrl: string | null;
};

export function ProductCardAdd({ product, imageUrl }: Props) {
  const router = useRouter();
  const addOrUpdateLine = useCartStore((s) => s.addOrUpdateLine);
  const variantsInStock = useMemo(
    () => product.product_variants.filter((v) => v.stock > 0),
    [product.product_variants],
  );

  const showVariantHint = useMemo(
    () =>
      product.product_variants.some(
        (v) =>
          (v.color_producto?.trim() ?? "") !== "" ||
          (v.tamano_producto?.trim() ?? "") !== "",
      ),
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

  function addOneToCart() {
    if (!selected || selected.stock <= 0) return false;
    addOrUpdateLine({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl,
      price: product.price,
      currency: product.currency,
      variantId: selected.id,
      sizeLabel: formatVariantOptionLabel(selected),
      quantity: 1,
      maxStock: selected.stock,
    });
    return true;
  }

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setMsg(null);
    if (!addOneToCart()) return;
    setMsg("¡Listo!");
    window.setTimeout(() => setMsg(null), 2000);
  }

  function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setMsg(null);
    if (!addOneToCart()) return;
    router.push("/carrito");
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
        {showVariantHint
          ? `Variante (orden: color, tamaño, talle) para ${product.name}`
          : `Talle para ${product.name}`}
      </label>
      {showVariantHint && (
        <p className="mb-1 text-[0.65rem] leading-snug text-foreground/55" aria-hidden="true">
          Color · tamaño · talle
        </p>
      )}
      <select
        id={`talle-${product.id}`}
        value={variantId}
        onChange={(e) => setVariantId(e.target.value)}
        title={
          showVariantHint
            ? "Orden en cada opción: color, tamaño, talle (si están cargados)"
            : undefined
        }
        className="min-h-11 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-[16px] font-medium text-foreground outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 sm:text-sm"
      >
        {variantsInStock.map((v) => (
          <option key={v.id} value={v.id}>
            {formatVariantOptionLabel(v)}
          </option>
        ))}
      </select>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-3 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
        >
          <CartIcon className="h-[1.125rem] w-[1.125rem] shrink-0 text-white" />
          Añadir al carrito
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          className="w-full rounded-full border-2 border-brand bg-transparent px-3 py-2.5 text-sm font-bold text-brand transition hover:bg-surface-ice"
        >
          Comprar ahora
        </button>
      </div>
      {msg && (
        <p className="text-center text-xs font-medium text-accent-sage" role="status">
          {msg}
        </p>
      )}
    </div>
  );
}
