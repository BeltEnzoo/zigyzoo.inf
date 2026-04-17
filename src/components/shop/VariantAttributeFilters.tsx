"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type Props = {
  colorOptions: string[];
  tamanoOptions: string[];
};

export function VariantAttributeFilters({ colorOptions, tamanoOptions }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const pushWith = useCallback(
    (patch: { color?: string | null; tamano?: string | null }) => {
      const next = new URLSearchParams(sp.toString());
      if (patch.color !== undefined) {
        const v = patch.color?.trim();
        if (v) next.set("color", v);
        else next.delete("color");
      }
      if (patch.tamano !== undefined) {
        const v = patch.tamano?.trim();
        if (v) next.set("tamano", v);
        else next.delete("tamano");
      }
      const qs = next.toString();
      router.push(qs ? `/tienda?${qs}` : "/tienda");
    },
    [router, sp],
  );

  const colorVal = sp.get("color")?.trim() ?? "";
  const tamanoVal = sp.get("tamano")?.trim() ?? "";

  if (colorOptions.length === 0 && tamanoOptions.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      {colorOptions.length > 0 && (
        <div className="min-w-[10rem] flex-1">
          <label htmlFor="filter-color" className="mb-1 block text-xs font-semibold text-foreground/70">
            Color
          </label>
          <select
            id="filter-color"
            value={colorVal}
            onChange={(e) => {
              const v = e.target.value;
              pushWith({ color: v || null });
            }}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            <option value="">Todos los colores</option>
            {colorOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}
      {tamanoOptions.length > 0 && (
        <div className="min-w-[10rem] flex-1">
          <label htmlFor="filter-tamano" className="mb-1 block text-xs font-semibold text-foreground/70">
            Tamaño
          </label>
          <select
            id="filter-tamano"
            value={tamanoVal}
            onChange={(e) => {
              const v = e.target.value;
              pushWith({ tamano: v || null });
            }}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            <option value="">Todos los tamaños</option>
            {tamanoOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
