/** Datos del sitio — Zigyzoo Infantil */
export const siteConfig = {
  brand: "Zigyzoo",
  email: "zigyzoo.infantil@gmail.com",
  phoneDisplay: "+54 9 11 3271-0125",
  /** Para enlaces tel: */
  phoneTel: "+5491132710125",
  /** Número sin + ni espacios, para wa.me */
  whatsappE164: "5491132710125",
  whatsappPrefill:
    "Hola Zigyzoo, quiero hacer una consulta sobre productos o mi pedido.",
  /** Local comercial */
  address: {
    street: "Moises Lebensohn 306",
    postalLocality: "Boulogne Sur Mer (CP 1609)",
    partido: "San Isidro",
    province: "Provincia de Buenos Aires",
    country: "Argentina",
  },
  social: {
    instagram: "https://www.instagram.com/zigyzoo.infantil/",
    facebook: "https://www.facebook.com/profile.php?id=61587736510060",
    tiktok: "https://www.tiktok.com/@zigyzoo.arg?is_from_webapp=1&sender_device=pc",
    mercadoLibre: "https://www.mercadolibre.com.ar/pagina/zigyzootumundoinfantil",
  },
};

export function getAddressLines(): string[] {
  const a = siteConfig.address;
  return [
    `${a.street}`,
    `${a.postalLocality} · ${a.partido}`,
    `${a.province}, ${a.country}`,
  ];
}

export function getMapsSearchUrl(): string {
  const q = encodeURIComponent(
    `Moises Lebensohn 306, Boulogne Sur Mer, San Isidro, Buenos Aires, Argentina`,
  );
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function getWhatsAppUrl(prefillMessage?: string) {
  const base = `https://wa.me/${siteConfig.whatsappE164}`;
  const msg = prefillMessage ?? siteConfig.whatsappPrefill;
  if (msg?.trim()) {
    return `${base}?text=${encodeURIComponent(msg.trim())}`;
  }
  return base;
}
