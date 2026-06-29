"use client";

import { useState, useTransition } from "react";
import {
  applySheetPricesAction,
  previewSheetPricesAction,
  type PriceAdjustActionResult,
} from "@/app/actions/sheet-catalog";
import { formatMoney } from "@/lib/format";
import type { Category } from "@/types/shop";

type PreviewRow = Extract<PriceAdjustActionResult, { ok: true; rows: unknown }>["rows"][number];

export function PriceAdjustForm({ categories }: { categories: Category[] }) {
  const [percent, setPercent] = useState("10");
  const [scopeMode, setScopeMode] = useState<"all" | "category">("all");
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "");
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function buildFormData(): FormData {
    const fd = new FormData();
    fd.set("percent", percent);
    fd.set("scope_mode", scopeMode);
    if (scopeMode === "category") fd.set("category_slug", categorySlug);
    return fd;
  }

  function onPreview() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await previewSheetPricesAction(buildFormData());
      if (!res.ok) {
        setError(res.error);
        setPreview(null);
        return;
      }
      if ("rows" in res) {
        setPreview(res.rows);
        setMessage(
          res.rows.length
            ? `${res.rows.length} producto(s) cambiarían de precio.`
            : "Ningún precio cambiaría con ese porcentaje y alcance.",
        );
      }
    });
  }

  function onApply() {
    if (!window.confirm("¿Aplicar el ajuste de precios en la Google Sheet? No se puede deshacer automáticamente.")) {
      return;
    }
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await applySheetPricesAction(buildFormData());
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if ("message" in res) {
        setMessage(res.message);
        setPreview(null);
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <label htmlFor="percent" className="mb-1 block text-sm font-semibold">
          Porcentaje de ajuste
        </label>
        <div className="flex items-center gap-2">
          <input
            id="percent"
            type="text"
            inputMode="decimal"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            className="w-32 rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
          <span className="text-sm text-foreground/70">% (ej. 10 sube 10%, -15 baja 15%)</span>
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Alcance</legend>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="scope"
            checked={scopeMode === "all"}
            onChange={() => setScopeMode("all")}
          />
          Todo el catálogo
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="scope"
            checked={scopeMode === "category"}
            onChange={() => setScopeMode("category")}
          />
          Solo una categoría
        </label>
        {scopeMode === "category" && (
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={onPreview}
          className="rounded-full border border-brand/30 bg-white px-5 py-2.5 text-sm font-bold text-brand hover:bg-surface-ice disabled:opacity-60"
        >
          {pending ? "Calculando…" : "Vista previa"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onApply}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-60"
        >
          Aplicar en la hoja
        </button>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-xl bg-accent-sage/15 px-3 py-2 text-sm text-brand">{message}</p>
      )}

      {preview && preview.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-black/10 bg-surface-ice/50">
              <tr>
                <th className="px-4 py-3 font-semibold text-brand">Producto</th>
                <th className="px-4 py-3 font-semibold text-brand">Antes</th>
                <th className="px-4 py-3 font-semibold text-brand">Después</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((row) => (
                <tr key={row.slug || row.name} className="border-b border-black/5">
                  <td className="px-4 py-3">{row.name || row.slug}</td>
                  <td className="px-4 py-3">{formatMoney(row.oldPrice, "ARS")}</td>
                  <td className="px-4 py-3 font-medium">{formatMoney(row.newPrice, "ARS")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
