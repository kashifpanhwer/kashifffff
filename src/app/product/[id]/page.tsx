import Shell from "@/components/Shell";
import ProductDetailClient from "@/components/ProductDetailClient";
import { getProductById, getProducts } from "@/lib/data";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  const product = await getProductById(productId);
  if (!product) notFound();

  const related = await getProducts({
    categorySlug: product.category?.slug,
    active: true,
  });
  const relatedProducts = related.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <Shell>
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </Shell>
  );
}
