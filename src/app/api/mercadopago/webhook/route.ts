import { NextResponse } from "next/server";
import { syncCheckoutFromMercadoPagoPayment } from "@/lib/payments/update-checkout-payment";

/** IPN de Mercado Pago: confirma pagos aprobados en `checkout_sessions`. */
async function handleNotification(req: Request) {
  const url = new URL(req.url);
  const topic = url.searchParams.get("topic") ?? url.searchParams.get("type");
  const id =
    url.searchParams.get("id") ??
    url.searchParams.get("data.id") ??
    url.searchParams.get("data_id");

  if (topic === "payment" && id) {
    await syncCheckoutFromMercadoPagoPayment(id);
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  return handleNotification(req);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (body && typeof body === "object") {
      const topic = (body as { type?: string; topic?: string }).type ?? (body as { topic?: string }).topic;
      const dataId =
        (body as { data?: { id?: string } }).data?.id ??
        (body as { id?: string }).id;
      if ((topic === "payment" || topic === "topic_payment") && dataId) {
        await syncCheckoutFromMercadoPagoPayment(String(dataId));
        return NextResponse.json({ ok: true });
      }
    }
  } catch {
    /* usar query string abajo */
  }
  return handleNotification(req);
}
