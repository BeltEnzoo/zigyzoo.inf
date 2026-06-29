import { DEFAULT_GID, DEFAULT_SHEET_ID } from "@/lib/catalog/google-sheet";

export function getSheetSpreadsheetId(): string {
  return process.env.GOOGLE_SHEET_ID?.trim() || DEFAULT_SHEET_ID;
}

export function getSheetGid(): number {
  const raw = process.env.GOOGLE_SHEET_GID?.trim() || DEFAULT_GID;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export function isGoogleSheetsWriteConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim(),
  );
}
