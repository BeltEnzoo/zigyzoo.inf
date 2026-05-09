"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AddToCart } from "@/components/shop/AddToCart";
import { ProductImageGallery } from "@/components/shop/ProductImageGallery";
import { formatMoney } from "@/lib/format";
import type { ProductDetail } from "@/types/shop";

type Props = {
  product: ProductDetail;
  whatsappHref: string;
};

export function ProductDetailMain({ product, whatsappHref }: Props) {
  const sortedImages = useMemo(
    () => [...product.product_images].sort((a, b) => a.sort_order - b.sort_order),
    [product.product_images],
  );

  const sortedVariants = useMemo(
    () => [...product.product_variants].sort((a, b) => a.sort_order - b.sort_order),
    [product.product_variants],
  );

  const [imageIndex, setImageIndex] = useState(0);
  const [variantId, setVariantId] = useState<string>(() => sortedVariants[0]?.id ?? "");

  useEffect(() => {
    setImageIndex(0);
    setVariantId(sortedVariants[0]?.id ?? "");
    // Solo al navegar a otro producto (mismo orden que las fotos en catálogo).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sortedVariants deriva de product
  }, [product.id]);

  const safeIdx =
    sortedImages.length === 0 ? 0 : Math.min(imageIndex, Math.max(0, sortedImages.length - 1));
  const activeImageUrl = sortedImages[safeIdx]?.url ?? null;

  const handleImageIndexChange = useCallback(
    (i: number) => {
      setImageIndex(i);
      if (sortedVariants.length === 0) return;
      const vi = Math.min(i, sortedVariants.length - 1);
      const v = sortedVariants[vi];
      if (v) setVariantId(v.id);
    },
    [sortedVariants],
  );

  const handleVariantChange = useCallback(
    (id: string) => {
      setVariantId(id);
      if (sortedImages.length === 0) return;
      const j = sortedVariants.findIndex((v) => v.id === id);
      if (j >= 0) setImageIndex(Math.min(j, sortedImages.length - 1));
    },
    [sortedImages, sortedVariants],
  );

  const variants = product.product_variants;
  const hasColor = variants.some((v) => (v.color_producto?.trim() ?? "") !== "");
  const hasTamano = variants.some((v) => (v.tamano_producto?.trim() ?? "") !== "");
  const showVariantColumns = hasColor || hasTamano;
  const totalStock = variants.reduce((s, v) => s + v.stock, 0);

  const galleryImages = sortedImages.map((im) => ({ id: im.id, url: im.url }));

  const descriptionBlock =
    product.description ? (
      <div className="min-w-0 w-full max-w-full overflow-hidden rounded-2xl border border-black/5 bg-surface-ice/40 px-4 py-4 sm:px-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground/55">
          Descripción
        </p>
        <p className="mt-2 max-w-full whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/85 [overflow-wrap:anywhere] sm:text-base">
          {product.description}
        </p>
      </div>
    ) : null;

  return (
    <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
      {/* Galería primero en móvil; columna izquierda en desktop */}
      <div className="order-1 min-w-0 space-y-3 lg:order-none lg:col-start-1 lg:row-start-1">
        <ProductImageGallery
          images={galleryImages}
          activeIndex={imageIndex}
          onActiveIndexChange={handleImageIndexChange}
        />
        {sortedImages.length > 1 && sortedVariants.length > 1 && (
          <p className="text-xs leading-relaxed text-foreground/55">
            Cada foto se empareja con la variante en el mismo orden (primera imagen ↔ primera opción).
            Si hay distinta cantidad de fotos y variantes, se usa el índice disponible.
          </p>
        )}
      </div>

      {/* Título, compra y tabla antes que la descripción en móvil */}
      <div className="order-2 min-w-0 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start">
        {(product.categories_all?.length || product.categories) && (
          <div className="flex flex-wrap gap-2">
            {(product.categories_all?.length ? product.categories_all : [product.categories!]).map(
              (cat) => (
                <span
                  key={cat.id}
                  className="rounded-full border border-black/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-foreground/65"
                >
                  {cat.name}
                </span>
              ),
            )}
          </div>
        )}
        <h1 className="mt-2 break-words font-display text-3xl font-bold text-brand sm:text-4xl">
          {product.name}
        </h1>
        <p className="mt-4 text-3xl font-bold text-foreground">
          {formatMoney(product.price, product.currency)}
        </p>

        <AddToCart
          listAllVariants
          variantId={variantId}
          onVariantChange={handleVariantChange}
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            currency: product.currency,
            imageUrl: activeImageUrl,
            variants: sortedVariants.map((v) => ({
              id: v.id,
              size_label: v.size_label,
              stock: v.stock,
              color_producto: v.color_producto,
              tamano_producto: v.tamano_producto,
            })),
          }}
        />

        <div className="mt-8">
          <h2 className="font-display text-lg font-bold text-brand">Stock por variante</h2>
          <div className="-mx-4 mt-3 overflow-x-auto px-4 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:overflow-visible sm:px-0">
            <table className="w-full min-w-[18rem] max-w-2xl text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-foreground/60">
                {showVariantColumns ? (
                  <>
                    {hasColor && <th className="pb-2 pr-3 font-semibold">Color</th>}
                    {hasTamano && <th className="pb-2 pr-3 font-semibold">Tamaño</th>}
                    <th className="pb-2 pr-3 font-semibold">Talle</th>
                  </>
                ) : (
                  <th className="pb-2 pr-3 font-semibold">Talle</th>
                )}
                <th className="pb-2 font-semibold">Stock</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id} className="border-b border-black/5">
                  {showVariantColumns ? (
                    <>
                      {hasColor && (
                        <td className="max-w-[9rem] py-2 pr-3 font-medium break-words sm:max-w-none">
                          {v.color_producto?.trim() || "—"}
                        </td>
                      )}
                      {hasTamano && (
                        <td className="max-w-[7rem] py-2 pr-3 font-medium break-words sm:max-w-none">
                          {v.tamano_producto?.trim() || "—"}
                        </td>
                      )}
                      <td className="py-2 pr-3 font-medium break-words">{v.size_label}</td>
                    </>
                  ) : (
                    <td className="py-2 pr-3 font-medium break-words">{v.size_label}</td>
                  )}
                  <td className="py-2">{v.stock > 0 ? v.stock : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {variants.length === 0 && (
            <p className="text-sm text-foreground/65">Sin variantes cargadas.</p>
          )}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-brand bg-transparent px-8 text-base font-bold text-brand transition hover:bg-surface-ice"
          >
            Consultar por WhatsApp
          </a>
          {totalStock === 0 && (
            <span className="self-center text-sm text-foreground/65">
              Producto sin stock; igual podés consultar disponibilidad futura.
            </span>
          )}
        </div>
      </div>

      {/* Descripción al final en móvil; bajo la galería en desktop */}
      {descriptionBlock && (
        <div className="order-3 min-w-0 lg:order-none lg:col-start-1 lg:row-start-2 lg:self-start">
          {descriptionBlock}
        </div>
      )}
    </div>
  );
}
