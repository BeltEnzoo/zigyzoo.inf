import { getSql } from "@/lib/db/neon";

export type AdminCheckoutRow = {
  id: string;
  externalReference: string;
  createdAt: string;
  buyerFirstName: string;
  buyerLastName: string;
  buyerDni: string;
  buyerPhone: string;
  buyerEmail: string;
  shippingPostalCode: string | null;
  shippingMethod: string | null;
  shippingLabel: string | null;
  totalAmountArs: number | null;
  paymentStatus: string | null;
  paidAt: string | null;
};

export type AdminClientRow = {
  buyerEmail: string;
  buyerFirstName: string;
  buyerLastName: string;
  buyerDni: string;
  buyerPhone: string;
  checkoutCount: number;
  lastCheckoutAt: string;
  lastTotalAmountArs: number | null;
};

type CheckoutDbRow = {
  id: string;
  external_reference: string;
  created_at: Date | string;
  buyer_first_name: string;
  buyer_last_name: string;
  buyer_dni: string;
  buyer_phone: string;
  buyer_email: string;
  shipping_postal_code?: string | null;
  shipping_method?: string | null;
  shipping_label?: string | null;
  total_amount_ars?: string | number | null;
  payment_status?: string | null;
  paid_at?: Date | string | null;
};

function toAmount(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function mapCheckout(r: CheckoutDbRow): AdminCheckoutRow {
  return {
    id: r.id,
    externalReference: r.external_reference,
    createdAt:
      r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    buyerFirstName: r.buyer_first_name,
    buyerLastName: r.buyer_last_name,
    buyerDni: r.buyer_dni,
    buyerPhone: r.buyer_phone,
    buyerEmail: r.buyer_email,
    shippingPostalCode: r.shipping_postal_code ?? null,
    shippingMethod: r.shipping_method ?? null,
    shippingLabel: r.shipping_label ?? null,
    totalAmountArs: toAmount(r.total_amount_ars),
    paymentStatus: r.payment_status ?? null,
    paidAt:
      r.paid_at == null
        ? null
        : r.paid_at instanceof Date
          ? r.paid_at.toISOString()
          : String(r.paid_at),
  };
}

async function fetchApprovedCheckoutRows(
  sql: NonNullable<ReturnType<typeof getSql>>,
  limit: number,
): Promise<CheckoutDbRow[]> {
  try {
    const rows = await sql`
      select
        id,
        external_reference,
        created_at,
        buyer_first_name,
        buyer_last_name,
        buyer_dni,
        buyer_phone,
        buyer_email,
        shipping_postal_code,
        shipping_method,
        shipping_label,
        total_amount_ars,
        payment_status,
        paid_at
      from public.checkout_sessions
      where payment_status = 'approved'
      order by coalesce(paid_at, created_at) desc
      limit ${limit}
    `;
    return rows as CheckoutDbRow[];
  } catch (e) {
    console.warn("[fetchApprovedCheckoutRows] filtered query failed", e);
    return [];
  }
}

/** Solo ventas con pago aprobado en Mercado Pago. */
export async function getAdminCheckouts(limit = 200): Promise<AdminCheckoutRow[]> {
  const sql = getSql();
  if (!sql) return [];

  try {
    const rows = await fetchApprovedCheckoutRows(sql, limit);
    return rows.map(mapCheckout).filter((r) => r.paymentStatus === "approved");
  } catch (e) {
    console.error("[getAdminCheckouts]", e);
    return [];
  }
}

export async function getAdminClients(limit = 500): Promise<AdminClientRow[]> {
  const sql = getSql();
  if (!sql) return [];

  try {
    try {
      const rows = await sql`
        select
          buyer_email,
          max(buyer_first_name) as buyer_first_name,
          max(buyer_last_name) as buyer_last_name,
          max(buyer_dni) as buyer_dni,
          max(buyer_phone) as buyer_phone,
          count(*)::int as checkout_count,
          max(created_at) as last_checkout_at,
          (
            select total_amount_ars
            from public.checkout_sessions s2
            where s2.buyer_email = checkout_sessions.buyer_email
            order by created_at desc
            limit 1
          ) as last_total_amount_ars
        from public.checkout_sessions
        group by buyer_email
        order by max(created_at) desc
        limit ${limit}
      `;
      return mapClientRows(rows as Parameters<typeof mapClientRows>[0]);
    } catch (e) {
      console.warn("[getAdminClients] full query failed, using base columns", e);
      const rows = await sql`
        select
          buyer_email,
          max(buyer_first_name) as buyer_first_name,
          max(buyer_last_name) as buyer_last_name,
          max(buyer_dni) as buyer_dni,
          max(buyer_phone) as buyer_phone,
          count(*)::int as checkout_count,
          max(created_at) as last_checkout_at
        from public.checkout_sessions
        group by buyer_email
        order by max(created_at) desc
        limit ${limit}
      `;
      return mapClientRows(rows as Parameters<typeof mapClientRows>[0]);
    }
  } catch (e) {
    console.error("[getAdminClients]", e);
    return [];
  }
}

export type SalesPanelDiagnostics = {
  sessionCount: number | null;
  approvedCount: number | null;
  paymentStatusColumnMissing: boolean;
};

/** Para diagnosticar panel Ventas vs datos en Neon. */
export async function getSalesPanelDiagnostics(): Promise<SalesPanelDiagnostics> {
  const sql = getSql();
  if (!sql) {
    return { sessionCount: null, approvedCount: null, paymentStatusColumnMissing: false };
  }

  try {
    const totalRows = await sql`select count(*)::int as c from public.checkout_sessions`;
    const sessionCount = (totalRows[0] as { c: number }).c ?? 0;

    try {
      const approvedRows = await sql`
        select count(*)::int as c
        from public.checkout_sessions
        where payment_status = 'approved'
      `;
      return {
        sessionCount,
        approvedCount: (approvedRows[0] as { c: number }).c ?? 0,
        paymentStatusColumnMissing: false,
      };
    } catch {
      return {
        sessionCount,
        approvedCount: null,
        paymentStatusColumnMissing: true,
      };
    }
  } catch {
    return { sessionCount: null, approvedCount: null, paymentStatusColumnMissing: false };
  }
}

function mapClientRows(
  rows: {
    buyer_email: string;
    buyer_first_name: string;
    buyer_last_name: string;
    buyer_dni: string;
    buyer_phone: string;
    checkout_count: number;
    last_checkout_at: Date | string;
    last_total_amount_ars?: string | number | null;
  }[],
): AdminClientRow[] {
  return rows.map((r) => ({
    buyerEmail: r.buyer_email,
    buyerFirstName: r.buyer_first_name,
    buyerLastName: r.buyer_last_name,
    buyerDni: r.buyer_dni,
    buyerPhone: r.buyer_phone,
    checkoutCount: r.checkout_count,
    lastCheckoutAt:
      r.last_checkout_at instanceof Date
        ? r.last_checkout_at.toISOString()
        : String(r.last_checkout_at),
    lastTotalAmountArs: toAmount(r.last_total_amount_ars),
  }));
}
