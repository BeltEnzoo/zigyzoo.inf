const testimonials = [
  {
    quote:
      "El empaque es una locura: papel kraft, moño, la bolsa de friselina con el logo… se nota que lo hacen con amor. Ideal para regalo.",
    name: "Comentario frecuente",
    detail: "Sobre el envoltorio",
  },
  {
    quote:
      "Me llegó antes de lo que decía Mercado Libre. Muy conforme con la entrega y la comunicación.",
    name: "Compras online",
    detail: "Entregas y plazos",
  },
  {
    quote:
      "Pasé por el local y la vidriera hermosa; productos divinos. Un lugar de barrio que en la zona hacía falta.",
    name: "Vecinas y vecinos",
    detail: "Boulogne Sur Mer",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 text-brand" aria-hidden>
      {"★★★★★".split("").map((s, i) => (
        <span key={i}>{s}</span>
      ))}
    </div>
  );
}

export function ClientesSection() {
  return (
    <section
      id="clientes"
      className="scroll-mt-24 bg-gradient-to-b from-surface-sand/50 to-[var(--color-fondo-pagina)] px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-center text-3xl font-bold text-brand sm:text-4xl">
          Lo que dicen quienes nos eligen
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-foreground/75">
          En Mercado Libre y en el local recibimos opiniones sobre el empaque, las entregas y la
          atención. Estos textos resumen el tipo de comentarios que nos motivan a seguir.
        </p>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <li
              key={t.name + t.detail}
              className="flex flex-col rounded-3xl border border-black/5 bg-white/90 p-6 shadow-sm"
            >
              <Stars />
              <blockquote className="mt-4 flex-1 break-words text-foreground/90">
                “{t.quote}”
              </blockquote>
              <footer className="mt-6 border-t border-black/5 pt-4 text-sm">
                <p className="font-semibold text-brand">{t.name}</p>
                <p className="text-foreground/60">{t.detail}</p>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
