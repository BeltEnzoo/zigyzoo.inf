"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = { error: null };

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-center text-2xl font-bold text-brand">Panel Zigyzoo</h1>
      <p className="mt-2 text-center text-sm text-foreground/70">
        Usuario y contraseña configurados en Neon (<code className="rounded bg-surface-ice px-1">admin_users</code>
        ).
      </p>
      {initialError === "sin_permiso" && (
        <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-center text-sm text-amber-900">
          Tu sesión no es válida o la cuenta ya no tiene permiso. Volvé a ingresar.
        </p>
      )}
      <form action={formAction} className="mt-8 space-y-4">
        <div>
          <label htmlFor="login" className="mb-1 block text-sm font-semibold">
            Usuario
          </label>
          <input
            id="login"
            name="login"
            type="text"
            autoComplete="username"
            required
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-semibold">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
        </div>
        {state.error && (
          <p className="text-center text-sm text-red-600" role="alert">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-brand py-3 font-bold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm">
        <Link href="/" className="font-semibold text-brand hover:underline">
          Volver al sitio
        </Link>
      </p>
    </main>
  );
}
