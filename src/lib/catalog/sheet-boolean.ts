/**
 * Interpreta `is_active` desde la hoja (Excel/Sheets pueden usar español o inglés).
 * Vacío → activo (misma convención que antes: no ocultar si falta el valor).
 */
export function parseSheetIsActive(raw: string): boolean {
  const t = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!t) return true;

  const falsy = new Set([
    "0",
    "false",
    "falso",
    "no",
    "n",
    "off",
    "inactivo",
    "inactive",
  ]);
  const truthy = new Set([
    "1",
    "true",
    "verdadero",
    "si",
    "yes",
    "y",
    "on",
    "activo",
    "active",
  ]);

  if (falsy.has(t)) return false;
  if (truthy.has(t)) return true;

  // Texto no reconocido: no forzar ocultar por un typo raro en la celda
  return true;
}
