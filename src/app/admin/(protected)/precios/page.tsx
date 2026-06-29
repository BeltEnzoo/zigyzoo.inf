import Link from "next/link";
import { PriceAdjustForm } from "@/components/admin/PriceAdjustForm";
import { getCategories } from "@/data/shop";
import { getCatalogSource } from "@/lib/catalog/catalog-source";
import { isGoogleSheetsWriteConfigured } from "@/lib/catalog/sheet-config";

export const dynamic = "force-dynamic";

export default async function AdminPreciosPage() {
  const catalog = getCatalogSource();
  const categories = await getCategories();
  const writeReady = isGoogleSheetsWriteConfigured();

  if (catalog !== "sheet") {
    return (
      <div>
        <Link href="/admin/productos" className="text-sm font-semibold text-brand hover:underline">
          ← Productos
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold text-brand">Ajustar precios</h1>
        <p className="mt-4 max-w-xl text-sm text-foreground/80">
          Con catálogo en Neon, editá precios en la Google Sheet y usá «Sincronizar Google Sheet →
          Neon» en Productos, o cambiá precios directo en la base.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/productos" className="text-sm font-semibold text-brand hover:underline">
        ← Productos
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold text-brand">Ajustar precios</h1>
      <p className="mt-2 max-w-xl text-sm text-foreground/75">
        Subí o bajá precios por porcentaje en la Google Sheet. Podés aplicar a todo el catálogo o
        solo a una categoría.
      </p>

      {!writeReady && (
        <p className="mt-4 max-w-xl rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Para escribir en la hoja configurá{" "}
          <code className="rounded bg-white/80 px-1">GOOGLE_SERVICE_ACCOUNT_EMAIL</code> y{" "}
          <code className="rounded bg-white/80 px-1">GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY</code>, y
          compartí la Google Sheet con el email de la cuenta de servicio como <strong>Editor</strong>
          .
        </p>
      )}

      <div className="mt-8">
        <PriceAdjustForm categories={categories} />
      </div>
    </div>
  );
}
