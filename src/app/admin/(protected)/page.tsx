import Link from "next/link";
import { getCatalogSource } from "@/lib/catalog/catalog-source";

export default async function AdminHomePage() {
  const catalog = getCatalogSource();
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand">Bienvenido al panel</h1>
      <p className="mt-2 max-w-xl text-foreground/80">
        Gestioná el catálogo: productos con precio, talles con stock e imágenes por URL.
        Mañana podés afinar flujos con la clienta.
      </p>
      <ul className="mt-8 flex flex-col gap-3 text-brand">
        <li>
          <Link href="/admin/productos" className="font-semibold underline">
            Ver productos
          </Link>
        </li>
        {catalog === "neon" && (
          <li>
            <Link href="/admin/productos/nuevo" className="font-semibold underline">
              Cargar nuevo producto
            </Link>
          </li>
        )}
        <li>
          <Link href="/tienda" className="font-semibold text-foreground/70 underline">
            Ver tienda pública
          </Link>
        </li>
      </ul>
    </div>
  );
}
