import { siteConfig } from "@/config/site";
import { escapeHtml } from "@/lib/email/escape-html";

export type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  body: string;
};

export type SendContactResult =
  | { ok: true }
  | { ok: false; code: "not_configured" | "provider_error"; message: string };

/**
 * Envía el mensaje del formulario con Resend (HTTPS).
 * Requiere RESEND_API_KEY y, en producción, remitente/dominio válidos en Resend.
 */
export async function sendContactEmail(payload: ContactPayload): Promise<SendContactResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const toRaw = process.env.CONTACT_EMAIL_TO?.trim() || siteConfig.email;
  const from =
    process.env.CONTACT_EMAIL_FROM?.trim() ||
    "Zigyzoo <onboarding@resend.dev>";

  if (!apiKey) {
    return {
      ok: false,
      code: "not_configured",
      message: "El envío de mensajes no está configurado en el servidor.",
    };
  }

  const toList = toRaw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (toList.length === 0) {
    return {
      ok: false,
      code: "not_configured",
      message: "Falta CONTACT_EMAIL_TO o email del sitio.",
    };
  }

  const { name, email, phone, body } = payload;
  const subject = `Consulta web Zigyzoo — ${name}`;
  const html = `
    <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
    ${
      phone
        ? `<p><strong>Teléfono:</strong> ${escapeHtml(phone)}</p>`
        : "<p><strong>Teléfono:</strong> —</p>"
    }
    <p><strong>Mensaje:</strong></p>
    <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(body)}</pre>
  `.trim();

  const text = [
    `Nombre: ${name}`,
    `Email: ${email}`,
    `Teléfono: ${phone || "—"}`,
    "",
    "Mensaje:",
    body,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: toList,
      reply_to: email,
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("[contact] Resend", res.status, errText);
    return {
      ok: false,
      code: "provider_error",
      message: "No se pudo enviar el mensaje. Intentá de nuevo más tarde.",
    };
  }

  return { ok: true };
}
