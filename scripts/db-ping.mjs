/**
 * Prueba conexión a Neon: npm run db:ping
 * Lee DATABASE_URL de .env.local o .env (sin dependencias extra).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

function loadEnvFile(name) {
  const p = resolve(process.cwd(), name);
  if (!existsSync(p)) return;
  const text = readFileSync(p, "utf8");
  for (const line of text.split(/\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const raw = process.env.DATABASE_URL?.trim();
if (!raw || raw.includes("...")) {
  console.error(
    "Falta DATABASE_URL válida en .env.local o .env (copiá la URI completa desde Neon).",
  );
  process.exit(1);
}

const url = raw.startsWith("postgres://")
  ? `postgresql://${raw.slice("postgres://".length)}`
  : raw;

try {
  const sql = neon(url);
  const rows = await sql`
    select
      1 as ok,
      current_database() as database,
      current_user as role
  `;
  console.log("Conexión a Neon OK:");
  console.log(rows[0]);
} catch (e) {
  console.error("Error de conexión:", e instanceof Error ? e.message : e);
  process.exit(1);
}
