function IconShield({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function IconTruck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.25 2.25 0 0 0-1.92-1.196H19.5M2.25 14.25h3.75m0 0h9m-9 0V9.75A2.25 2.25 0 0 1 6 7.5h6m0 0v6.75m0 0H9" />
    </svg>
  );
}

function IconGift({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  );
}

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

const items = [
  {
    title: "Empaque con mimo",
    text: "Papel kraft, moño, etiqueta con logo, bolsa friselina o embalaje cuidado: muchos clientes destacan lo delicado del envoltorio y los detalles para regalar.",
    Icon: IconGift,
  },
  {
    title: "Entregas destacadas",
    text: "En Mercado Libre tenemos reconocimiento por cumplir y adelantar entregas. Coordinamos cada envío con la misma seriedad en otros canales.",
    Icon: IconTruck,
  },
  {
    title: "Local de barrio",
    text: "Moises Lebensohn 306, Boulogne Sur Mer: vidriera y productos elogiados por quienes pasan o compran en persona. Cercanía real.",
    Icon: IconHome,
  },
  {
    title: "Postventa excelente",
    text: "Te acompañamos también después de comprar: respuesta rápida por WhatsApp, seguimiento del pedido y ayuda con cambios o dudas para que la experiencia termine bien.",
    Icon: IconShield,
  },
];

export function TrustStrip() {
  return (
    <section
      id="confianza"
      className="scroll-mt-24 border-y border-black/5 bg-white/80 px-4 py-12 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-center text-2xl font-bold text-brand sm:text-3xl">
          Por qué confiar en Zigyzoo
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-foreground/70">
          Más de tres años acompañando familias, con el cuidado de quien empaqueta cada pedido como
          si fuera para los suyos.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ title, text, Icon }) => (
            <li
              key={title}
              className="flex flex-col rounded-2xl border border-black/5 bg-surface-ice/60 p-5 shadow-sm"
            >
              <Icon className="h-9 w-9 shrink-0 text-brand" />
              <h3 className="mt-3 font-display text-lg font-bold text-brand">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
