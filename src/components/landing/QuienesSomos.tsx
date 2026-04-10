export function QuienesSomos() {
  return (
    <section
      id="quienes-somos"
      className="scroll-mt-24 border-y border-black/5 bg-white/70 px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="font-display text-center text-3xl font-bold text-brand sm:text-4xl">
          Quiénes somos
        </h2>
        <p className="mt-3 text-center text-foreground/70">
          Nuestra esencia y la familia detrás de Zigyzoo
        </p>

        <div className="mt-12 space-y-8 text-lg leading-relaxed text-foreground/90">
          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-brand">¿Qué es Zigyzoo?</h3>
            <p>
              <strong className="text-brand">Zigyzoo</strong> nace de un deseo profundo: crear un
              espacio integral para la infancia, con inclusión, compromiso ecológico y una atención
              cercana que prioriza lo humano en cada experiencia.
            </p>
            <p className="text-foreground/85">
              Queremos simplificar la vida de las familias en un solo lugar: ropa, juguetes y más,
              con un servicio cálido y confiable. Los{" "}
              <strong className="text-brand">castores</strong> son nuestro símbolo: construyen refugios
              seguros y sostenibles, como el espacio que buscamos construir para cada hogar.
            </p>
            <p>
              <strong className="text-brand">Zigy</strong> remite al zigzag, el movimiento natural de
              los niños y niñas; <strong className="text-brand">Zoo</strong> representa refugio, hogar
              y cuidado.
            </p>
          </div>

          <div className="border-t border-black/10 pt-8 space-y-4">
            <h3 className="font-display text-xl font-bold text-brand">
              Una familia dedicada a facilitar la vida familiar
            </h3>
            <p>
              Somos una familia argentina que desde hace más de tres años gestiona un{" "}
              <strong className="text-brand">polirubro infantil</strong>: empezamos online y hoy también
              contamos con{" "}
              <strong className="text-brand">local a la calle</strong> en Boulogne Sur Mer, para estar
              más cerca de nuestra comunidad.
            </p>
            <p className="text-foreground/85">
              Trabajamos en equipo entre administración, comunicación y logística para ofrecer
              productos de calidad, cercanía real y entregas confiables, combinando valores de barrio
              con alcance nacional.
            </p>
            <p className="font-medium text-brand">
              Somos más que un negocio: somos una familia que quiere ser parte de la tuya. Gracias por
              confiar en nosotros.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
