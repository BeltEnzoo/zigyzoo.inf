import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sqlInstance: NeonQueryFunction<false, false> | null = null;

/** URL completa de Neon (copiada del dashboard), no un ejemplo con "...". */
function isPlausibleDatabaseUrl(raw: string | undefined): boolean {
  const u = raw?.trim() ?? "";
  if (u.length < 40) return false;
  if (!u.startsWith("postgresql://") && !u.startsWith("postgres://")) return false;
  if (u.includes("...")) return false;
  if (!u.includes("@")) return false;
  try {
    const normalized = u.startsWith("postgres://")
      ? `postgresql://${u.slice("postgres://".length)}`
      : u;
    const parsed = new URL(normalized);
    return Boolean(parsed.hostname?.includes(".") && parsed.pathname?.length > 1);
  } catch {
    return false;
  }
}

export function isNeonConfigured(): boolean {
  return isPlausibleDatabaseUrl(process.env.DATABASE_URL);
}

/** Cliente SQL server-side; null si falta DATABASE_URL o la URL no es válida. */
export function getSql(): NeonQueryFunction<false, false> | null {
  if (!isNeonConfigured()) return null;
  if (!sqlInstance) {
    const raw = process.env.DATABASE_URL!.trim();
    const url = raw.startsWith("postgres://")
      ? `postgresql://${raw.slice("postgres://".length)}`
      : raw;
    sqlInstance = neon(url);
  }
  return sqlInstance;
}
