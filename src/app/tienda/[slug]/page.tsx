import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/shop/AddToCart";
import { DemoBanner } from "@/components/shop/DemoBanner";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getProductBySlug } from "@/data/shop";
import { formatMoney } from "@/lib/format";
import { getWhatsAppUrl } from "@/config/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const totalStock = product.product_variants.reduce((s, v) => s + v.stock, 0);
  const wa = getWhatsAppUrl(
    `Hola, consulto por el producto: ${product.name} (${product.slug})`,
  );

  const sortedImages = [...product.product_images].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const firstImageUrl = sortedImages[0]?.url ?? null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <Link href="/tienda" className="text-sm font-semibold text-brand hover:underline">
          ← Volver a la tienda
        </Link>

        <div className="mt-6">
          <DemoBanner />
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="space-y-3">
            {sortedImages.length === 0 ? (
              <div className="flex max-h-56 items-center justify-center rounded-3xl bg-surface-ice/60 text-foreground/45 sm:max-h-64">
                Sin imágenes
              </div>
            ) : (
              sortedImages.map((im) => (
                <div
                  key={im.id}
                  className="overflow-hidden rounded-3xl border border-black/5 bg-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={im.url}
                    alt=""
                    className="max-h-64 w-full object-cover object-center sm:max-h-72"
                    loading="lazy"
                  />
                </div>
              ))
            )}
          </div>

          <div>
            {product.categories && (
              <p className="text-sm font-medium uppercase tracking-wide text-foreground/55">
                {product.categories.name}
              </p>
            )}
            <h1 className="mt-2 font-display text-3xl font-bold text-brand sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-3xl font-bold text-foreground">
              {formatMoney(product.price, product.currency)}
            </p>
            {product.description && (
              <p className="mt-6 whitespace-pre-wrap text-foreground/85 leading-relaxed">
                {product.description}
              </p>
            )}

            <AddToCart
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                currency: product.currency,
                imageUrl: firstImageUrl,
                variants: product.product_variants.map((v) => ({
                  id: v.id,
                  size_label: v.size_label,
                  stock: v.stock,
                })),
              }}
            />

            <div className="mt-8">
              <h2 className="font-display text-lg font-bold text-brand">Stock por talle</h2>
              <table className="mt-3 w-full max-w-md text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-left text-foreground/60">
                    <th className="pb-2 font-semibold">Talle</th>
                    <th className="pb-2 font-semibold">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {product.product_variants.map((v) => (
                    <tr key={v.id} className="border-b border-black/5">
                      <td className="py-2 font-medium">{v.size_label}</td>
                      <td className="py-2">{v.stock > 0 ? v.stock : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {product.product_variants.length === 0 && (
                <p className="text-sm text-foreground/65">Sin variantes cargadas.</p>
              )}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-brand bg-transparent px-8 text-base font-bold text-brand transition hover:bg-surface-ice"
              >
                Consultar por WhatsApp
              </a>
              {totalStock === 0 && (
                <span className="self-center text-sm text-foreground/65">
                  Producto sin stock; igual podés consultar disponibilidad futura.
                </span>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
