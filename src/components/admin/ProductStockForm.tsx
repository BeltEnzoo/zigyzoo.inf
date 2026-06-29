"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateSheetProductStocksAction } from "@/app/actions/sheet-catalog";

type VariantRow = {
  sizeLabel: string;
  stock: number;
};

type EditableRow = {
  key: string;
  sizeLabel: string;
  stock: string;
};

function toEditableRows(variants: VariantRow[]): EditableRow[] {
  return variants.map((v, i) => ({
    key: `row-${i}`,
    sizeLabel: v.sizeLabel,
    stock: String(v.stock),
  }));
}

export function ProductStockForm({
  slug,
  productName,
  variants,
}: {
  slug: string;
  productName: string;
  variants: VariantRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<EditableRow[]>(() => toEditableRows(variants));
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitAction(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const fd = new FormData();
    fd.set("slug", slug);
    rows.forEach((row, i) => {
      fd.set(`size_${i}`, row.sizeLabel);
      fd.set(`stock_${i}`, row.stock);
    });

    const res = await updateSheetProductStocksAction(fd);
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    setMessage(res.message);
    router.refresh();
  }

  function updateRow(index: number, patch: Partial<Pick<EditableRow, "sizeLabel" | "stock">>) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { key: `new-${Date.now()}`, sizeLabel: "", stock: "0" },
    ]);
  }

  function removeRow(index: number) {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  const total = rows.reduce((sum, row) => {
    const n = Number(row.stock);
    return sum + (Number.isFinite(n) && n > 0 ? Math.floor(n) : 0);
  }, 0);

  return (
    <form onSubmit={submitAction} className="mx-auto max-w-xl space-y-5">
      <p className="text-sm text-foreground/75">
        Producto: <strong className="text-brand">{productName}</strong>
      </p>

      <div className="space-y-3">
        {rows.map((row, i) => (
          <div
            key={row.key}
            className="flex flex-wrap items-end gap-3 rounded-2xl border border-black/5 bg-surface-ice/30 p-4"
          >
            <div className="min-w-[7rem] flex-1">
              <label htmlFor={`size-${row.key}`} className="mb-1 block text-xs font-semibold">
                Talle
              </label>
              <input
                id={`size-${row.key}`}
                type="text"
                required
                placeholder="4, 6, S, M…"
                value={row.sizeLabel}
                onChange={(e) => updateRow(i, { sizeLabel: e.target.value })}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
              />
            </div>
            <div className="w-28">
              <label htmlFor={`stock-${row.key}`} className="mb-1 block text-xs font-semibold">
                Stock
              </label>
              <input
                id={`stock-${row.key}`}
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                required
                value={row.stock}
                onChange={(e) => updateRow(i, { stock: e.target.value })}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(i)}
              disabled={rows.length <= 1}
              className="rounded-full px-3 py-2 text-sm font-semibold text-foreground/55 hover:bg-white hover:text-red-700 disabled:opacity-40"
              title={rows.length <= 1 ? "Debe quedar al menos un talle" : "Quitar talle"}
            >
              Quitar
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="rounded-full border border-brand/30 bg-white px-5 py-2.5 text-sm font-bold text-brand hover:bg-surface-ice"
      >
        + Agregar talle
      </button>

      <p className="text-sm text-foreground/70">
        Total en tienda: <strong>{total}</strong> unidad{total === 1 ? "" : "es"}
      </p>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-xl bg-accent-sage/15 px-3 py-2 text-sm text-brand">{message}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-brand py-3 font-bold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Guardando…" : "Guardar talles y stock"}
      </button>
    </form>
  );
}
