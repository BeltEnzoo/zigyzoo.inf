import Link from "next/link";
import type { ReactNode } from "react";

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "¿Cómo pago?",
    a: "Aceptamos Mercado Pago (tarjeta de crédito y débito) en compras online, transferencia bancaria cuando lo coordinemos, y en el local efectivo con descuento según la promoción vigente. También podés comprar a través de nuestra tienda en Mercado Libre.",
  },
  {
    q: "¿Cómo elijo el talle?",
    a: "En cada producto publicaremos tabla de talles y medidas en centímetros. Las prendas pueden variar levemente según tela y corte; si tenés dudas, consultanos por WhatsApp antes de comprar.",
  },
  {
    q: "¿Puedo cambiar o devolver un producto?",
    a: "Sí, dentro de los plazos y condiciones que publiquemos (estado del producto, etiquetas, comprobante). Los consumidores gozan además de los derechos de la Ley de Defensa del Consumidor (N.º 24.240), incluido el derecho de arrepentimiento en compras a distancia cuando la normativa lo habilite y no exista causa de exclusión.",
  },
  {
    q: "¿Cuánto tarda el envío?",
    a: "Los plazos y costos de envío son los indicados al finalizar la compra o en la sección Envíos y medios de pago. Son estimativos en días hábiles y pueden variar por zona, feriados o demoras del transportista.",
  },
  {
    q: "¿Emiten factura?",
    a: "Sí. Emitimos la factura o comprobante fiscal que corresponda según tu condición frente al IVA y los datos que nos informes, conforme la normativa de la AFIP.",
  },
  {
    q: "¿Los precios incluyen impuestos?",
    a: "Los precios publicados en pesos argentinos incluyen impuestos nacionales que correspondan según el tipo de operación y comprobante, salvo aclaración expresa en contrario en el carrito o checkout. Intereses o cargos del banco o de la plataforma de pago se informan al elegir cuotas o medio de pago.",
  },
  {
    q: "¿Qué pasa con mis datos personales?",
    a: (
      <>
        Los tratamos conforme a la{" "}
        <Link href="/privacidad" className="font-semibold text-brand underline">
          Política de privacidad
        </Link>
        , la Ley 25.326 y la normativa vigente. Podés ejercer tus derechos
        contactándonos por los medios indicados en esa página.
      </>
    ),
  },
];

export function FaqSection() {
  return (
    <section
      id="preguntas-frecuentes"
      className="scroll-mt-24 bg-white/70 px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="font-display text-center text-3xl font-bold text-brand sm:text-4xl">
          Preguntas frecuentes
        </h2>
        <p className="mt-3 text-center text-foreground/75">
          Información orientativa. En caso de discrepancia, prevalecen los{" "}
          <Link href="/terminos" className="font-semibold text-brand underline">
            términos y condiciones
          </Link>{" "}
          y lo acordado al confirmar tu pedido.
        </p>
        <div className="mt-10 space-y-3">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-black/5 bg-surface-ice/50 px-5 py-1 shadow-sm open:bg-white open:shadow-md"
            >
              <summary className="cursor-pointer list-none py-4 font-semibold text-brand outline-none marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-3">
                  {item.q}
                  <span
                    className="text-xl leading-none text-brand/60 transition group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </span>
              </summary>
              <div className="border-t border-black/5 pb-4 pt-2 text-foreground/85 leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
