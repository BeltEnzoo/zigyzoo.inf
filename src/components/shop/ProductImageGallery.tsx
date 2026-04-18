"use client";

import { useCallback, useEffect, useRef } from "react";
import { productImageFrameClass, productImageImgClass } from "@/lib/shop/product-image-spec";

export type GalleryImage = { id: string; url: string };

type Props = {
  images: GalleryImage[];
  activeIndex: number;
  onActiveIndexChange: (next: number) => void;
};

export function ProductImageGallery({ images, activeIndex, onActiveIndexChange }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const n = images.length;
  const idx = n === 0 ? 0 : Math.max(0, Math.min(activeIndex, n - 1));
  const current = images[idx];

  useEffect(() => {
    if (n > 0 && activeIndex >= n) onActiveIndexChange(0);
  }, [n, activeIndex, onActiveIndexChange]);

  const go = useCallback(
    (delta: number) => {
      if (n <= 1) return;
      const i = n === 0 ? 0 : Math.max(0, Math.min(activeIndex, n - 1));
      onActiveIndexChange((i + delta + n) % n);
    },
    [n, activeIndex, onActiveIndexChange],
  );

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    }
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [go]);

  if (n === 0) {
    return (
      <div className="flex max-h-56 items-center justify-center rounded-3xl bg-surface-ice/60 text-foreground/45 sm:max-h-64">
        Sin imágenes
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        ref={wrapRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Galería de fotos del producto"
        className="relative overflow-hidden rounded-3xl border border-black/5 bg-white outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      >
        <div className={productImageFrameClass}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt=""
            className={productImageImgClass}
            loading={idx === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        </div>

        {n > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white shadow-md backdrop-blur-sm transition hover:bg-black/60 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white/80"
              aria-label="Imagen anterior"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white shadow-md backdrop-blur-sm transition hover:bg-black/60 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white/80"
              aria-label="Imagen siguiente"
            >
              <ChevronRightIcon />
            </button>
            <p className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-2.5 py-0.5 text-[11px] font-medium text-white/95 backdrop-blur-sm">
              {idx + 1} / {n}
            </p>
          </>
        )}
      </div>

      {n > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:thin]">
          {images.map((im, i) => {
            const selected = i === idx;
            return (
              <button
                key={im.id}
                type="button"
                onClick={() => onActiveIndexChange(i)}
                className={`relative shrink-0 overflow-hidden rounded-xl border-2 bg-surface-ice/50 transition ${
                  selected
                    ? "border-brand ring-2 ring-brand/25"
                    : "border-black/10 opacity-85 hover:border-black/25 hover:opacity-100"
                }`}
                style={{ width: "4.5rem" }}
                aria-label={`Ver imagen ${i + 1}`}
                aria-current={selected ? "true" : undefined}
              >
                <div className="relative aspect-[768/1251] w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={im.url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 19l-7-7 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
