import { importPKCS8, SignJWT } from "jose";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

let cachedToken: { value: string; expiresAt: number } | null = null;

function serviceAccountPrivateKey(): string | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();
  if (!raw) return null;
  return raw.replace(/\\n/g, "\n");
}

/** Token OAuth para Google Sheets API (cuenta de servicio). */
export async function getGoogleSheetsAccessToken(): Promise<string | null> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const keyPem = serviceAccountPrivateKey();
  if (!email || !keyPem) return null;

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.value;
  }

  try {
    const privateKey = await importPKCS8(keyPem, "RS256");
    const jwt = await new SignJWT({ scope: SHEETS_SCOPE })
      .setProtectedHeader({ alg: "RS256" })
      .setIssuedAt()
      .setIssuer(email)
      .setSubject(email)
      .setAudience("https://oauth2.googleapis.com/token")
      .setExpirationTime("1h")
      .sign(privateKey);

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    if (!res.ok) {
      console.error("[google-sheets-auth]", res.status, await res.text().catch(() => ""));
      return null;
    }

    const data = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!data.access_token) return null;

    const ttlMs = (data.expires_in ?? 3600) * 1000;
    cachedToken = { value: data.access_token, expiresAt: now + ttlMs };
    return data.access_token;
  } catch (e) {
    console.error("[google-sheets-auth]", e);
    return null;
  }
}
