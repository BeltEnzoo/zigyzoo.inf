import { NextResponse } from "next/server";

const MAX_LEN = 4000;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Datos inválidos" }, { status: 400 });
  }

  const { name, email, phone, body: text } = body as Record<string, unknown>;

  const nameStr = typeof name === "string" ? name.trim() : "";
  const emailStr = typeof email === "string" ? email.trim() : "";
  const phoneStr = typeof phone === "string" ? phone.trim() : "";
  const textStr = typeof text === "string" ? text.trim() : "";

  if (!nameStr || nameStr.length > 200) {
    return NextResponse.json(
      { ok: false, error: "Revisá el nombre." },
      { status: 400 },
    );
  }
  if (!emailStr || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
    return NextResponse.json(
      { ok: false, error: "Revisá el email." },
      { status: 400 },
    );
  }
  if (!textStr || textStr.length > MAX_LEN) {
    return NextResponse.json(
      { ok: false, error: "El mensaje es obligatorio (máx. 4000 caracteres)." },
      { status: 400 },
    );
  }

  // Tratamiento conforme política de privacidad publicada; persistir o enviar mail según implementación.
  console.info("[contact]", { name: nameStr, email: emailStr, phone: phoneStr, text: textStr });

  return NextResponse.json({ ok: true });
}
