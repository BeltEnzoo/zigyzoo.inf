import Image from "next/image";
import photo1 from "../../../img/1.jpeg";
import photo2 from "../../../img/2.jpeg";
import photo3 from "../../../img/3.jpeg";
import photo4 from "../../../img/4.jpeg";

const items = [
  { src: photo1, label: "Novedades" },
  { src: photo2, label: "Regalitos" },
  { src: photo3, label: "Momentos felices" },
  { src: photo4, label: "Todo para peques" },
] as const;

export function GaleriaInfantil() {
  return (
    <section className="border-y border-black/5 bg-gradient-to-b from-surface-ice/40 to-white px-4 py-14 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand/80">
            Universo Zigyzoo
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-brand sm:text-4xl">
            Un rincón bien infantil
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-foreground/75">
            Colores, ternura y detalles que hacen única cada compra. Mirá algunas imágenes de
            nuestro mundo.
          </p>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <li
              key={item.label}
              className="group relative overflow-hidden rounded-3xl border border-black/5 bg-white p-2 shadow-sm transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                <Image
                  src={item.src}
                  alt={item.label}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand shadow-sm">
                {["★", "❤", "✦", "☁"][i]} {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

