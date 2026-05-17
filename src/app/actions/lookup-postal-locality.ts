"use server";

import { siteConfig } from "@/config/site";
import { normalizeArgentinePostalCode } from "@/lib/shipping/quote";

type NominatimResult = {
  display_name?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    suburb?: string;
    city_district?: string;
    state?: string;
    region?: string;
  };
};

function pickLocalityLabel(hit: NominatimResult): string | null {
  const a = hit.address;
  if (a) {
    const cityLike =
      a.city ||
      a.town ||
      a.village ||
      a.municipality ||
      a.city_district ||
      a.suburb;
    if (cityLike && a.state) return `${cityLike}, ${a.state}`;
    if (cityLike) return cityLike;
    if (a.state) return a.state;
  }
  if (hit.display_name) {
    const parts = hit.display_name.split(",").map((s) => s.trim());
    return parts.slice(0, 3).join(", ");
  }
  return null;
}

/** User-Agent exigido por Nominatim (OpenStreetMap). */
function nominatimUserAgent() {
  return `ZigyzooInfantil/1.0 (+${siteConfig.email})`;
}

async function nominatimSearch(
  params: Record<string, string>,
): Promise<NominatimResult[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "3");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": nominatimUserAgent(),
      "Accept-Language": "es",
    },
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as NominatimResult[]) : [];
}

/**
 * Intenta resolver ciudad/localidad a partir del CP (datos de OpenStreetMap / Nominatim).
 * Es orientativo: en Argentina un mismo CP puede cubrir varias zonas y los datos pueden estar incompletos.
 */
export async function lookupPostalLocality(
  raw: string,
): Promise<{ ok: true; label: string } | { ok: false }> {
  const normalized = normalizeArgentinePostalCode(raw);
  if (normalized.length < 4) {
    return { ok: false };
  }

  let hits = await nominatimSearch({
    postalcode: normalized,
    countrycodes: "ar",
  });

  if (hits.length === 0) {
    hits = await nominatimSearch({
      q: `${normalized}, Argentina`,
      countrycodes: "ar",
    });
  }

  const label = hits[0] ? pickLocalityLabel(hits[0]) : null;
  if (!label) {
    return { ok: false };
  }

  return { ok: true, label };
}
