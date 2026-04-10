import Link from "next/link";
import { ProductCreateForm } from "@/components/admin/ProductCreateForm";
import { getCategories } from "@/data/shop";

export const dynamic = "force-dynamic";

export default async function NuevoProductoPage() {
  const categories = await getCategories();

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
        (sin subir archivos al servidor).
      </p>
      <div className="mt-8">
        <ProductCreateForm categories={categories} />
      </div>
    </div>
  );
}
