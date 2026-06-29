"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { getCatalogSource, SHEET_CATALOG_TAG } from "@/lib/catalog/catalog-source";
import {
  applySheetPriceAdjustment,
  previewSheetPriceAdjustment,
  updateSheetProductVariants,
  type PriceAdjustPreviewRow,
  type PriceAdjustScope,
} from "@/lib/catalog/sheet-operations";
import { isGoogleSheetsWriteConfigured } from "@/lib/catalog/sheet-config";
import { getSql } from "@/lib/db/neon";

async function requireSheetEditor(): Promise<{ ok: false; error: string } | { ok: true }> {
  const session = await getAdminSession();
  if (!session) return { ok: false, error: "No autorizado." };

  if (getCatalogSource() !== "sheet") {
    return { ok: false, error: "El ajuste de precios en hoja solo aplica con SHOP_CATALOG_SOURCE=sheet." };
  }

  if (!isGoogleSheetsWriteConfigured()) {
    return {
      ok: false,
      error:
        "Falta configurar GOOGLE_SERVICE_ACCOUNT_EMAIL y GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, y compartir la hoja con esa cuenta como Editor.",
    };
  }

  const sql = getSql();
  if (!sql) return { ok: false, error: "Base de datos no configurada." };

  const staff = await sql`
    select 1 as ok
    from admin_users
    where id = ${session.userId}::uuid and role in ('admin', 'editor')
    limit 1
  `;
  if (!staff.length) return { ok: false, error: "Sin permiso." };

  return { ok: true };
}

function parseScope(formData: FormData): PriceAdjustScope | { error: string } {
  const mode = String(formData.get("scope_mode") ?? "all");
  if (mode === "all") return { type: "all" };
  const categorySlug = String(formData.get("category_slug") ?? "").trim();
  if (!categorySlug) return { error: "Elegí una categoría." };
  return { type: "category", categorySlug };
}

function parsePercent(formData: FormData): number | { error: string } {
  const raw = String(formData.get("percent") ?? "").trim().replace(",", ".");
  const percent = Number(raw);
  if (!Number.isFinite(percent)) return { error: "Porcentaje inválido." };
  return percent;
}

export type PriceAdjustActionResult =
  | { ok: true; rows: PriceAdjustPreviewRow[] }
  | { ok: true; updated: number; message: string }
  | { ok: false; error: string };

export async function previewSheetPricesAction(
  formData: FormData,
): Promise<PriceAdjustActionResult> {
  const auth = await requireSheetEditor();
  if (!auth.ok) return auth;

  const percent = parsePercent(formData);
  if (typeof percent === "object" && "error" in percent) {
    return { ok: false, error: percent.error };
  }

  const scope = parseScope(formData);
  if ("error" in scope) return { ok: false, error: scope.error };

  const result = await previewSheetPriceAdjustment(percent, scope);
  if (!result.ok) return result;
  return { ok: true, rows: result.rows };
}

export async function applySheetPricesAction(
  formData: FormData,
): Promise<PriceAdjustActionResult> {
  const auth = await requireSheetEditor();
  if (!auth.ok) return auth;

  const percent = parsePercent(formData);
  if (typeof percent === "object" && "error" in percent) {
    return { ok: false, error: percent.error };
  }

  const scope = parseScope(formData);
  if ("error" in scope) return { ok: false, error: scope.error };

  const result = await applySheetPriceAdjustment(percent, scope);
  if (!result.ok) return result;

  revalidateTag(SHEET_CATALOG_TAG, "max");
  revalidatePath("/tienda");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/precios");

  return {
    ok: true,
    updated: result.updated,
    message: `Se actualizaron ${result.updated} precio(s) en la Google Sheet.`,
  };
}

export type UpdateStockActionResult = { ok: true; message: string } | { ok: false; error: string };

export async function updateSheetProductStocksAction(
  formData: FormData,
): Promise<UpdateStockActionResult> {
  const auth = await requireSheetEditor();
  if (!auth.ok) return auth;

  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return { ok: false, error: "Producto inválido." };

  const variants: { sizeLabel: string; stock: number }[] = [];
  for (let i = 0; i < 50; i++) {
    const sizeRaw = formData.get(`size_${i}`);
    const stockRaw = formData.get(`stock_${i}`);
    if (sizeRaw === null && stockRaw === null) break;
    const sizeLabel = String(sizeRaw ?? "").trim();
    const n = Number(String(stockRaw ?? "").trim());
    if (!Number.isFinite(n)) return { ok: false, error: `Stock inválido en la fila ${i + 1}.` };
    variants.push({ sizeLabel, stock: Math.max(0, Math.floor(n)) });
  }

  if (variants.length === 0) {
    return { ok: false, error: "Agregá al menos un talle con stock." };
  }

  const result = await updateSheetProductVariants(slug, variants);
  if (!result.ok) return result;

  revalidateTag(SHEET_CATALOG_TAG, "max");
  revalidatePath("/tienda");
  revalidatePath(`/tienda/${slug}`);
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${slug}/stock`);

  return { ok: true, message: "Talles y stock actualizados en la Google Sheet." };
}
