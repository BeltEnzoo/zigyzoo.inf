import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoBanner } from "@/components/shop/DemoBanner";
import { ProductDetailMain } from "@/components/shop/ProductDetailMain";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getProductBySlug, getSimilarProducts } from "@/data/shop";
import { SimilarProductsSection } from "@/components/shop/SimilarProductsSection";
import { getWhatsAppUrl } from "@/config/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const similar = await getSimilarProducts(product);

  const wa = getWhatsAppUrl(
    `Hola, consulto por el producto: ${product.name} (${product.slug})`,
  );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <Link href="/tienda" className="text-sm font-semibold text-brand hover:underline">
          ← Volver a la tienda
        </Link>

        <div className="mt-6">
          <DemoBanner />
        </div>

        <ProductDetailMain product={product} whatsappHref={wa} />

        <SimilarProductsSection
          products={similar.products}
          matchedByCategories={similar.matchedByCategories}
        />
      </main>
      <SiteFooter />
    </>
  );
}
