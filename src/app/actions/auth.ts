"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import {
  clearAdminSessionCookie,
  createAdminSessionToken,
  isAuthConfigured,
  setAdminSessionCookie,
} from "@/lib/auth/session";
import { getSql } from "@/lib/db/neon";

export type LoginState = { error: string | null };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const login = String(formData.get("login") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!login || !password) {
    return { error: "Completá usuario y contraseña." };
  }

  const sql = getSql();
  if (!isAuthConfigured()) {
    return { error: "Falta AUTH_SECRET en .env.local (16+ caracteres)." };
  }
  if (!sql) {
    return {
      error:
        "DATABASE_URL inválida o de ejemplo. En Neon: Connect → copiá la URI completa (usuario, contraseña y host reales) en .env.local.",
    };
  }

  const rows = await sql`
    select id, email, password_hash, role
    from admin_users
    where lower(email) = ${login}
    limit 1
  `;
  const row = rows[0] as
    | { id: string; email: string; password_hash: string; role: string }
    | undefined;
  if (!row || !(await bcrypt.compare(password, row.password_hash))) {
    return { error: "Usuario o contraseña incorrectos." };
  }
  if (row.role !== "admin" && row.role !== "editor") {
    return { error: "Sin permiso." };
  }

  const token = await createAdminSessionToken({
    userId: row.id,
    email: row.email,
    role: row.role,
  });
  await setAdminSessionCookie(token);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
