import {
  normalizeHeader,
  parseCsv,
  type RowMap,
} from "@/lib/catalog/google-sheet";
import { getGoogleSheetsAccessToken } from "@/lib/catalog/google-sheets-auth";
import { getSheetGid, getSheetSpreadsheetId } from "@/lib/catalog/sheet-config";

export type SheetGrid = {
  sheetTitle: string;
  headers: string[];
  headerIndex: Map<string, number>;
  rows: string[][];
  /** Fila 1-based en la hoja (headers = 1, primer producto = 2). */
  dataRowNumbers: number[];
};

function columnIndexToA1(colIndex: number): string {
  let n = colIndex;
  let s = "";
  while (n >= 0) {
    s = String.fromCharCode((n % 26) + 65) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
}

function cellA1(row1Based: number, colIndex: number): string {
  return `${columnIndexToA1(colIndex)}${row1Based}`;
}

async function sheetsFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getGoogleSheetsAccessToken();
  if (!token) throw new Error("Google Sheets API no configurada (cuenta de servicio).");

  return fetch(`https://sheets.googleapis.com/v4/spreadsheets/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

async function resolveSheetTitle(spreadsheetId: string, gid: number): Promise<string> {
  const res = await sheetsFetch(`${spreadsheetId}?fields=sheets(properties(sheetId,title))`);
  if (!res.ok) {
    throw new Error(`No se pudo leer la hoja: ${await res.text().catch(() => res.statusText)}`);
  }
  const data = (await res.json()) as {
    sheets?: { properties?: { sheetId?: number; title?: string } }[];
  };
  const match = data.sheets?.find((s) => s.properties?.sheetId === gid);
  if (match?.properties?.title) return match.properties.title;
  if (data.sheets?.[0]?.properties?.title) return data.sheets[0].properties.title;
  throw new Error("No se encontró la pestaña del catálogo en la Google Sheet.");
}

/** Lee la grilla completa de la pestaña del catálogo. */
export async function fetchSheetGrid(): Promise<SheetGrid> {
  const spreadsheetId = getSheetSpreadsheetId();
  const sheetTitle = await resolveSheetTitle(spreadsheetId, getSheetGid());
  const range = encodeURIComponent(`${sheetTitle}!A:ZZ`);
  const res = await sheetsFetch(`${spreadsheetId}/values/${range}`);
  if (!res.ok) {
    throw new Error(`Error leyendo valores: ${await res.text().catch(() => res.statusText)}`);
  }
  const data = (await res.json()) as { values?: string[][] };
  const matrix = data.values ?? [];
  if (matrix.length < 2) {
    return {
      sheetTitle,
      headers: matrix[0]?.map(normalizeHeader) ?? [],
      headerIndex: new Map(),
      rows: [],
      dataRowNumbers: [],
    };
  }

  const headers = matrix[0].map(normalizeHeader);
  const headerIndex = new Map<string, number>();
  headers.forEach((h, i) => {
    if (h) headerIndex.set(h, i);
  });

  const rows: string[][] = [];
  const dataRowNumbers: number[] = [];
  for (let i = 1; i < matrix.length; i++) {
    const line = matrix[i];
    if (!line.some((c) => String(c ?? "").trim().length > 0)) continue;
    rows.push(line);
    dataRowNumbers.push(i + 1);
  }

  return { sheetTitle, headers, headerIndex, rows, dataRowNumbers };
}

export function rowToMap(grid: SheetGrid, row: string[]): RowMap {
  const map: RowMap = {};
  for (let c = 0; c < grid.headers.length; c++) {
    const h = grid.headers[c];
    if (!h) continue;
    map[h] = String(row[c] ?? "").trim();
  }
  return map;
}

export function pickHeaderIndex(grid: SheetGrid, ...keys: string[]): number {
  for (const k of keys) {
    const idx = grid.headerIndex.get(k);
    if (idx !== undefined) return idx;
  }
  return -1;
}

export async function batchUpdateSheetCells(
  sheetTitle: string,
  updates: { row1Based: number; colIndex: number; value: string }[],
): Promise<void> {
  if (updates.length === 0) return;
  const spreadsheetId = getSheetSpreadsheetId();
  const data = updates.map((u) => ({
    range: `${sheetTitle}!${cellA1(u.row1Based, u.colIndex)}`,
    values: [[u.value]],
  }));

  const res = await sheetsFetch(`${spreadsheetId}/values:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({
      valueInputOption: "USER_ENTERED",
      data,
    }),
  });

  if (!res.ok) {
    throw new Error(`Error actualizando celdas: ${await res.text().catch(() => res.statusText)}`);
  }
}

export async function appendSheetRow(sheetTitle: string, values: string[]): Promise<void> {
  const spreadsheetId = getSheetSpreadsheetId();
  const range = encodeURIComponent(`${sheetTitle}!A:ZZ`);
  const res = await sheetsFetch(
    `${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      body: JSON.stringify({ values: [values] }),
    },
  );
  if (!res.ok) {
    throw new Error(`Error agregando fila: ${await res.text().catch(() => res.statusText)}`);
  }
}

/** Fallback CSV (solo lectura) si hace falta validar sin API. */
export async function fetchSheetCsvMatrix(): Promise<string[][]> {
  const id = getSheetSpreadsheetId();
  const gid = getSheetGid();
  const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo exportar CSV de la hoja.");
  return parseCsv(await res.text());
}
