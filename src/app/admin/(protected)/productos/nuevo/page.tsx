import Link from "next/link";
import { ProductCreateForm } from "@/components/admin/ProductCreateForm";
import { getCategories } from "@/data/shop";
import { getCatalogSource } from "@/lib/catalog/catalog-source";
import { isGoogleSheetsWriteConfigured } from "@/lib/catalog/sheet-config";

export const dynamic = "force-dynamic";

export default async function NuevoProductoPage() {
  const catalog = getCatalogSource();
  const categories = await getCategories();
  const sheetWrite = catalog === "sheet" && isGoogleSheetsWriteConfigured();

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
      {catalog === "sheet" ? (
        <p className="mt-2 max-w-xl text-sm text-foreground/75">
          El producto se agrega como fila nueva en la Google Sheet. También podés editar la hoja a
          mano y usar <strong>Actualizar catálogo (hoja)</strong> en Productos.
        </p>
      ) : (
        <p className="mt-2 max-w-xl text-sm text-foreground/75">
          Precio único por producto; stock por cada talle. Imágenes solo con URL
          (sin subir archivos al servidor). Fotos de producto: <strong>768×1251 px</strong> para
          coincidir con la grilla de la tienda.
        </p>
      )}

      {catalog === "sheet" && !sheetWrite && (
        <p className="mt-4 max-w-xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Falta la cuenta de servicio de Google en el servidor (
          <code className="rounded bg-white/80 px-1">GOOGLE_SERVICE_ACCOUNT_*</code>). Completá el
          formulario abajo para ver el error al guardar, o agregá filas directo en la Sheet.
        </p>
      )}

      <div className="mt-8">
        <ProductCreateForm categories={categories} />
      </div>
    </div>
  );
}
