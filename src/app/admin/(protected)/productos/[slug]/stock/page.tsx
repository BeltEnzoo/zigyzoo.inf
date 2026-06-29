import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductStockForm } from "@/components/admin/ProductStockForm";
import { getProductBySlug } from "@/data/shop";
import { getCatalogSource } from "@/lib/catalog/catalog-source";
import { isGoogleSheetsWriteConfigured } from "@/lib/catalog/sheet-config";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductStockPage({ params }: Props) {
  const { slug } = await params;
  const catalog = getCatalogSource();

  if (catalog !== "sheet") {
    return (
      <div>
        <Link href="/admin/productos" className="text-sm font-semibold text-brand hover:underline">
          ← Productos
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold text-brand">Actualizar stock</h1>
        <p className="mt-4 text-sm text-foreground/75">
          Con catálogo en Neon, editá el stock desde la base o sincronizá desde la Sheet.
        </p>
      </div>
    );
  }

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const variants = product.product_variants.map((v) => ({
    sizeLabel: v.size_label,
    stock: v.stock,
  }));

  if (variants.length === 0) {
    return (
      <div>
        <Link href="/admin/productos" className="text-sm font-semibold text-brand hover:underline">
          ← Productos
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold text-brand">Actualizar stock</h1>
        <p className="mt-4 text-sm text-foreground/75">
          Este producto no tiene talles cargados en la hoja. Revisá las columnas{" "}
          <code className="rounded bg-surface-ice px-1">sizes</code> y{" "}
          <code className="rounded bg-surface-ice px-1">stocks</code>.
        </p>
      </div>
    );
  }

  const sheetWrite = isGoogleSheetsWriteConfigured();

  return (
    <div>
      <Link href="/admin/productos" className="text-sm font-semibold text-brand hover:underline">
        ← Productos
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold text-brand">Actualizar stock</h1>
      <p className="mt-2 max-w-xl text-sm text-foreground/75">
        Editá, agregá o quitá talles y unidades. Se guarda en la Google Sheet y la tienda se
        actualiza al instante.
      </p>

      {!sheetWrite && (
        <p className="mt-4 max-w-xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Falta la cuenta de servicio de Google en el servidor para escribir en la hoja.
        </p>
      )}

      <div className="mt-8">
        <ProductStockForm slug={product.slug} productName={product.name} variants={variants} />
      </div>
    </div>
  );
}
