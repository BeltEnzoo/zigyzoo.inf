import { siteConfig } from "@/config/site";
import { escapeHtml } from "@/lib/email/escape-html";
import type { StoredOrderLine } from "@/types/checkout-order";

type SaleEmailInput = {
  externalReference: string;
  buyerName: string;
  buyerEmail: string;
  lines: StoredOrderLine[];
};

export async function sendSaleApprovedEmail(input: SaleEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const toRaw = process.env.CONTACT_EMAIL_TO?.trim() || siteConfig.email;
  const from =
    process.env.CONTACT_EMAIL_FROM?.trim() ||
    "Zigyzoo <onboarding@resend.dev>";

  if (!apiKey || !toRaw) return;

  const itemsHtml = input.lines
    .map(
      (l) =>
        `<li>${escapeHtml(l.productName)} — ${escapeHtml(l.sizeLabel)} × ${l.quantity}</li>`,
    )
    .join("");

  const subject = `Venta web aprobada — ${input.buyerName || "Cliente"}`;
  const html = `
    <p><strong>Nueva venta aprobada</strong> en la tienda web.</p>
    <p><strong>Referencia:</strong> ${escapeHtml(input.externalReference)}</p>
    <p><strong>Cliente:</strong> ${escapeHtml(input.buyerName)} (${escapeHtml(input.buyerEmail)})</p>
    <p><strong>Productos:</strong></p>
    <ul>${itemsHtml}</ul>
    <p>El stock se actualizó en la Google Sheet si la API de escritura está configurada.</p>
  `.trim();

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: toRaw.split(/[,;]/).map((s) => s.trim()).filter(Boolean),
      subject,
      html,
    }),
  });
}
