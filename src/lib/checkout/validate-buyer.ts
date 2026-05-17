import type { CheckoutBuyerPayload } from "@/types/checkout-buyer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Intenta armar `area_code` + `number` para la API de Mercado Pago (Argentina). */
export function parseArgentinePhoneForMp(
  raw: string,
): { area_code: string; number: string } | null {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("54")) d = d.slice(2);
  if (d.startsWith("9") && d.length >= 10) d = d.slice(1);
  if (d.startsWith("15") && d.length >= 10) d = d.slice(2);
  if (d.length < 8) return null;

  const number = d.slice(-8);
  const area = d.slice(0, d.length - 8);
  if (area.length < 2 || area.length > 4) return null;
  if (number.length !== 8) return null;
  return { area_code: area, number };
}

export type ValidatedBuyer = {
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  mpPhone: { area_code: string; number: string } | null;
  /** Teléfono tal como lo escribió el cliente (para metadata / pedidos). */
  phoneRaw: string;
};

export function validateBuyerPayload(
  input: CheckoutBuyerPayload,
): { ok: true; buyer: ValidatedBuyer } | { ok: false; error: string } {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email.trim().toLowerCase();
  const phoneRaw = input.phone.trim();
  const dniDigits = input.dni.replace(/\D/g, "");

  if (firstName.length < 2) {
    return { ok: false, error: "Ingresá tu nombre (al menos 2 letras)." };
  }
  if (lastName.length < 2) {
    return { ok: false, error: "Ingresá tu apellido (al menos 2 letras)." };
  }
  if (dniDigits.length < 7 || dniDigits.length > 8) {
    return { ok: false, error: "El DNI debe tener 7 u 8 dígitos." };
  }
  if (phoneRaw.length < 8) {
    return { ok: false, error: "Ingresá un número de celular válido." };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Ingresá un correo electrónico válido." };
  }

  const mpPhone = parseArgentinePhoneForMp(phoneRaw);

  return {
    ok: true,
    buyer: {
      firstName,
      lastName,
      dni: dniDigits,
      email,
      mpPhone,
      phoneRaw,
    },
  };
}
