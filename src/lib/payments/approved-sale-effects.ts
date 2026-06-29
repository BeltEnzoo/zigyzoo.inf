import { revalidatePath, revalidateTag } from "next/cache";
import { getCatalogSource, SHEET_CATALOG_TAG } from "@/lib/catalog/catalog-source";
import { decrementSheetStockForOrder } from "@/lib/catalog/sheet-operations";
import { sendSaleApprovedEmail } from "@/lib/email/send-sale-email";
import { getSql } from "@/lib/db/neon";
import type { StoredOrderLine } from "@/types/checkout-order";

function parseOrderItemsJson(raw: unknown): StoredOrderLine[] {
  if (!Array.isArray(raw)) return [];
  const out: StoredOrderLine[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const slug = typeof o.slug === "string" ? o.slug.trim() : "";
    const variantIndex = typeof o.variantIndex === "number" ? o.variantIndex : -1;
    const quantity = typeof o.quantity === "number" ? o.quantity : 0;
    const productName = typeof o.productName === "string" ? o.productName : "";
    const sizeLabel = typeof o.sizeLabel === "string" ? o.sizeLabel : "";
    if (!slug || variantIndex < 0 || quantity <= 0) continue;
    out.push({ slug, variantIndex, quantity, productName, sizeLabel });
  }
  return out;
}

/**
 * Tras un pago aprobado: baja stock en Sheet (una sola vez) y avisa por email.
 */
export async function runApprovedSaleSideEffects(
  externalReference: string,
): Promise<void> {
  const sql = getSql();
  if (!sql) return;

  let rows: { order_items_json: unknown; buyer_email: string; buyer_first_name: string }[];
  try {
    rows = (await sql`
      update public.checkout_sessions
      set stock_adjusted_at = coalesce(stock_adjusted_at, now())
      where external_reference = ${externalReference}
        and payment_status = 'approved'
        and stock_adjusted_at is null
      returning order_items_json, buyer_email, buyer_first_name
    `) as { order_items_json: unknown; buyer_email: string; buyer_first_name: string }[];
  } catch {
    return;
  }

  if (!rows.length) return;

  const lines = parseOrderItemsJson(rows[0].order_items_json);
  const buyerEmail = rows[0].buyer_email;
  const buyerName = rows[0].buyer_first_name;

  if (getCatalogSource() === "sheet" && lines.length > 0) {
    const stockResult = await decrementSheetStockForOrder(lines);
    if (!stockResult.ok) {
      console.error("[runApprovedSaleSideEffects] stock:", stockResult.error);
      try {
        await sql`
          update public.checkout_sessions
          set stock_adjusted_at = null
          where external_reference = ${externalReference}
        `;
      } catch {
        /* reintento en próximo webhook */
      }
    } else {
      revalidateTag(SHEET_CATALOG_TAG, "max");
      revalidatePath("/tienda");
    }
  }

  void sendSaleApprovedEmail({
    externalReference,
    buyerName,
    buyerEmail,
    lines,
  }).catch((e) => console.error("[sendSaleApprovedEmail]", e));
}
