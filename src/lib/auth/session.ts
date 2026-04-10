import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth/constants";

export type AdminSession = {
  userId: string;
  email: string;
  role: "admin" | "editor";
};

function getSecretKey() {
  const raw = process.env.AUTH_SECRET?.trim();
  if (!raw || raw.length < 16) {
    throw new Error("AUTH_SECRET debe tener al menos 16 caracteres (ideal 32+).");
  }
  return new TextEncoder().encode(raw);
}

export function isAuthConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET?.trim() && process.env.AUTH_SECRET.trim().length >= 16);
}

export async function createAdminSessionToken(session: AdminSession): Promise<string> {
  return new SignJWT({ email: session.email, role: session.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isAuthConfigured()) return null;
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const sub = payload.sub;
    const email = typeof payload.email === "string" ? payload.email : "";
    const role = payload.role === "admin" || payload.role === "editor" ? payload.role : null;
    if (!sub || !email || !role) return null;
    return { userId: sub, email, role };
  } catch {
    return null;
  }
}

export async function clearAdminSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_SESSION_COOKIE);
}

export async function setAdminSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}
