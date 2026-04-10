"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      body: String(data.get("body") ?? "").trim(),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus("error");
        setMessage(json.error ?? "No se pudo enviar. Probá de nuevo.");
        return;
      }
      setStatus("ok");
      setMessage("¡Gracias! Te vamos a responder pronto.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Error de red. Revisá tu conexión e intentá otra vez.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex max-w-lg flex-col gap-4"
      noValidate
    >
      <div>
        <label htmlFor="contact-name" className="mb-1 block text-sm font-semibold">
          Nombre
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-foreground shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
          placeholder="Tu nombre"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="mb-1 block text-sm font-semibold">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-foreground shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
          placeholder="nombre@ejemplo.com"
        />
      </div>
      <div>
        <label htmlFor="contact-phone" className="mb-1 block text-sm font-semibold">
          Teléfono <span className="font-normal text-foreground/60">(opcional)</span>
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-foreground shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
          placeholder="+54 9 ..."
        />
      </div>
      <div>
        <label htmlFor="contact-body" className="mb-1 block text-sm font-semibold">
          Mensaje
        </label>
        <textarea
          id="contact-body"
          name="body"
          required
          rows={5}
          className="w-full resize-y rounded-2xl border border-black/10 bg-white px-4 py-3 text-foreground shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
          placeholder="Escribinos tu consulta..."
        />
      </div>
      <p className="text-xs leading-relaxed text-foreground/65">
        Al enviar este formulario, aceptás que Zigyzoo use los datos facilitados
        únicamente para responder tu consulta, según la{" "}
        <Link href="/privacidad" className="font-semibold text-brand underline">
          Política de privacidad
        </Link>
        .
      </p>
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-8 text-base font-bold text-white shadow-md shadow-brand/20 transition hover:brightness-110 disabled:opacity-60"
      >
        {status === "loading" ? "Enviando…" : "Enviar mensaje"}
      </button>
      {(status === "ok" || status === "error") && message && (
        <p
          role="status"
          className={
            status === "ok"
              ? "text-center text-sm font-medium text-accent-sage"
              : "text-center text-sm font-medium text-accent-terracotta"
          }
        >
          {message}
        </p>
      )}
    </form>
  );
}
