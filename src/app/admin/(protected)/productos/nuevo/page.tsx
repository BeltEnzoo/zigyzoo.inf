import Link from "next/link";
import { ProductCreateForm } from "@/components/admin/ProductCreateForm";
import { getCategories } from "@/data/shop";
import { getCatalogSource } from "@/lib/catalog/catalog-source";

export const dynamic = "force-dynamic";

export default async function NuevoProductoPage() {
  const catalog = getCatalogSource();
  const categories = await getCategories();

  if (catalog === "sheet") {
    return (
      <div>
        <Link
          href="/admin/productos"
          className="text-sm font-semibold text-brand hover:underline"
        >
          ← Volver a productos
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold text-brand">Nuevo producto</h1>
        <p className="mt-4 max-w-xl text-sm text-foreground/80">
          Con <code className="rounded bg-surface-ice px-1">SHOP_CATALOG_SOURCE=sheet</code> el
          catálogo se carga solo desde la Google Sheet. Agregá o editá filas en la hoja y usá{" "}
          <strong className="text-brand">Actualizar catálogo (hoja)</strong> en la lista de
          productos. En <code className="rounded bg-surface-ice px-1">image_urls</code>, usá fotos{" "}
          <strong>768×1251 px</strong> para la misma proporción que la tienda.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/productos"
        className="text-sm font-semibold text-brand hover:underline"
      >
        ← Volver a productos
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold text-brand">
        Nuevo producto
      </h1>
      <p className="mt-2 max-w-xl text-sm text-foreground/75">
        Precio único por producto; stock por cada talle. Imágenes solo con URL
        (sin subir archivos al servidor). Fotos de producto: <strong>768×1251 px</strong> para
        coincidir con la grilla de la tienda.
      </p>
      <div className="mt-8">
        <ProductCreateForm categories={categories} />
      </div>
    </div>
  );
}
