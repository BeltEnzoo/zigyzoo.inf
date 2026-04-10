"use client";

import { logoutAction } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-full border border-brand/30 px-4 py-2 text-sm font-semibold text-brand hover:bg-surface-ice"
      >
        Salir
      </button>
    </form>
  );
}
