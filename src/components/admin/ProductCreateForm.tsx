"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createProduct } from "@/app/actions/products";
import { PRODUCT_IMAGE_SPEC_LABEL } from "@/lib/shop/product-image-spec";
import type { Category } from "@/types/shop";

export function ProductCreateForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitAction(formData: FormData) {
    setLoading(true);
    setError(null);
    const res = await createProduct(formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <form action={submitAction} className="mx-auto max-w-xl space-y-5">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-semibold">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
        />
      </div>
      <div>
        <label htmlFor="slug" className="mb-1 block text-sm font-semibold">
          Slug URL <span className="font-normal text-foreground/55">(opcional)</span>
        </label>
        <input
          id="slug"
          name="slug"
          placeholder="remera-algodon (se genera del nombre si lo dejás vacío)"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
        />
      </div>
      <div>
        <label htmlFor="price" className="mb-1 block text-sm font-semibold">
          Precio (ARS)
        </label>
        <input
          id="price"
          name="price"
          type="text"
          required
          inputMode="decimal"
          placeholder="15999"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
        />
      </div>
      <div>
        <label htmlFor="category_id" className="mb-1 block text-sm font-semibold">
          Categoría
        </label>
        <select
          id="category_id"
          name="category_id"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
        >
          <option value="">— Sin categoría —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-semibold">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
        />
      </div>
      <div>
        <label htmlFor="image_urls" className="mb-1 block text-sm font-semibold">
          URLs de imágenes
        </label>
        <textarea
          id="image_urls"
          name="image_urls"
          rows={4}
          placeholder={
            "https://ejemplo.com/foto1.jpg\nhttps://ejemplo.com/foto2.jpg\n(o varias en una línea con | o ;)"
          }
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
        />
        <p className="mt-1 text-xs text-foreground/60">
          Una o más URLs por línea; en la misma línea podés separar con <strong>|</strong> o{" "}
          <strong>;</strong>. Imágenes recomendadas: <strong>{PRODUCT_IMAGE_SPEC_LABEL}</strong>{" "}
          (proporción vertical de ficha).
        </p>
      </div>
      <div>
        <label htmlFor="variants" className="mb-1 block text-sm font-semibold">
          Talles y stock
        </label>
        <textarea
          id="variants"
          name="variants"
          required
          rows={6}
          placeholder={"4, 2\n6, 5\n8, 0\n10, 3"}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
        />
        <p className="mt-1 text-xs text-foreground/60">
          Una línea por talle: <code className="rounded bg-surface-ice px-1">talle, stock</code>{" "}
          (números enteros).
        </p>
      </div>
      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-brand py-3 font-bold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Guardando…" : "Crear producto"}
      </button>
    </form>
  );
}
