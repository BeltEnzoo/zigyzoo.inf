"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function IconCheck() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-sage/25 text-accent-sage">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>
  );
}

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s.replace(/\+/g, " "));
  } catch {
    return s;
  }
}

type ToastMode = "success" | "error" | null;

export function CatalogSyncToast() {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const [mode, setMode] = useState<ToastMode>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const handledKey = useRef<string | null>(null);
  const dismissTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const readParams = () => {
      const fromUrl =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : new URLSearchParams(queryString);
      const fallback = new URLSearchParams(queryString);
      const sync = fromUrl.get("sync") ?? fallback.get("sync");
      const detail = fromUrl.get("detail") ?? fallback.get("detail");
      return { sync, detail };
    };

    const clearDismissTimer = () => {
      if (dismissTimerRef.current !== undefined) {
        window.clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = undefined;
      }
    };

    const apply = () => {
      const { sync, detail } = readParams();
      if (!sync) {
        handledKey.current = null;
        setMode(null);
        setErrorText(null);
        clearDismissTimer();
        return;
      }

      const key = `${sync}:${detail ?? ""}`;
      if (handledKey.current === key) return;
      handledKey.current = key;

      clearDismissTimer();

      if (sync === "refresh" || sync === "ok") {
        setMode("success");
        dismissTimerRef.current = window.setTimeout(() => {
          dismissTimerRef.current = undefined;
          setMode(null);
          handledKey.current = null;
          routerRef.current.replace("/admin/productos");
        }, 3000);
        return;
      }

      if (sync === "error") {
        setMode("error");
        setErrorText(
          detail
            ? safeDecode(detail)
            : "Error al actualizar. Revisá la hoja y la configuración.",
        );
        dismissTimerRef.current = window.setTimeout(() => {
          dismissTimerRef.current = undefined;
          setMode(null);
          setErrorText(null);
          handledKey.current = null;
          routerRef.current.replace("/admin/productos");
        }, 6000);
      }
    };

    apply();
    const tLate = window.setTimeout(apply, 0);
    const tRetry = window.setTimeout(apply, 120);

    return () => {
      window.clearTimeout(tLate);
      window.clearTimeout(tRetry);
      clearDismissTimer();
      handledKey.current = null;
    };
  }, [queryString]);

  if (!mode) return null;

  if (mode === "success") {
    return (
      <div
        className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2"
        role="status"
      >
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-lg">
          <IconCheck />
          <span className="text-sm font-semibold text-foreground">Actualización completa</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex max-w-md -translate-x-1/2"
      role="alert"
    >
      <div className="pointer-events-auto rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-lg">
        {errorText}
      </div>
    </div>
  );
}
