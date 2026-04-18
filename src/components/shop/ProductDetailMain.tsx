"use client";

import { useMemo, useState } from "react";
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

  const [imageIndex, setImageIndex] = useState(0);
  const last = Math.max(0, sortedImages.length - 1);
  const safeIdx = sortedImages.length === 0 ? 0 : Math.min(imageIndex, last);
  const activeImageUrl = sortedImages[safeIdx]?.url ?? null;

  const variants = product.product_variants;
  const hasColor = variants.some((v) => (v.color_producto?.trim() ?? "") !== "");
  const hasTamano = variants.some((v) => (v.tamano_producto?.trim() ?? "") !== "");
  const showVariantColumns = hasColor || hasTamano;
  const totalStock = variants.reduce((s, v) => s + v.stock, 0);

  const galleryImages = sortedImages.map((im) => ({ id: im.id, url: im.url }));

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      <div className="space-y-3">
        <ProductImageGallery
          images={galleryImages}
          activeIndex={imageIndex}
          onActiveIndexChange={setImageIndex}
        />
        {product.description && (
          <div className="rounded-2xl border border-black/5 bg-surface-ice/40 px-4 py-4 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/55">
              Descripción
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85 sm:text-base">
              {product.description}
            </p>
          </div>
        )}
      </div>

      <div>
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
        <h1 className="mt-2 font-display text-3xl font-bold text-brand sm:text-4xl">
          {product.name}
        </h1>
        <p className="mt-4 text-3xl font-bold text-foreground">
          {formatMoney(product.price, product.currency)}
        </p>

        <AddToCart
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            currency: product.currency,
            imageUrl: activeImageUrl,
            variants: product.product_variants.map((v) => ({
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
          <table className="mt-3 w-full max-w-2xl text-sm">
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
                        <td className="py-2 pr-3 font-medium">{v.color_producto?.trim() || "—"}</td>
                      )}
                      {hasTamano && (
                        <td className="py-2 pr-3 font-medium">{v.tamano_producto?.trim() || "—"}</td>
                      )}
                      <td className="py-2 pr-3 font-medium">{v.size_label}</td>
                    </>
                  ) : (
                    <td className="py-2 pr-3 font-medium">{v.size_label}</td>
                  )}
                  <td className="py-2">{v.stock > 0 ? v.stock : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  );
}
