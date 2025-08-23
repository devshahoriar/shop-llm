import ProductJsonLd from "@/components/shared/ProductJsonLd";
import { api, HydrateClient } from "@/trpc/server";
import { ErrorBackButton, FullPage } from "./client";
import { fetchProduct } from "@/server/services/product.services";
import type { Metadata } from "next";
import type { ResolvingMetadata } from "next";

// Generate static params for all products
export async function generateStaticParams() {
  const products = await fetchProduct();
  return products.map((product) => ({
    id: product.id.toString(),
  }));
}

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;
  // Fetch product data using your service
  const product = await api.product.getById({ id: parseInt(id) });

  const previousImages = (await parent).openGraph?.images ?? [];

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for does not exist.",
    };
  }

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      images: [product.image, ...previousImages],
      title: product.title,
      description: product.description,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await api.product.getById({
    id: parseInt(id),
  });

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <ErrorBackButton />
        </div>
      </div>
    );
  }

  return (
    <HydrateClient>
      <ProductJsonLd product={product} />
      <FullPage product={product} />
    </HydrateClient>
  );
}
