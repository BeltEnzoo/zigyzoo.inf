/** URL pública del sitio (sin barra final). Usada en back_urls de Mercado Pago. */
export function getCheckoutBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (explicit && /^https?:\/\//i.test(explicit)) return explicit;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${host}`;
  }
  return "http://localhost:3000";
}

export function checkoutReturnUrls(base: string) {
  return {
    success: `${base}/carrito/pago/exitoso`,
    failure: `${base}/carrito/pago/error`,
    pending: `${base}/carrito/pago/pendiente`,
  };
}

/** MP solo acepta `auto_return` con back_urls en HTTPS (no sirve http://localhost en producción). */
export function canUseMercadoPagoAutoReturn(base: string): boolean {
  return base.startsWith("https://");
}
