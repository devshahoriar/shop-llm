'use client'
import type { Product } from '@/types';
import { ProductJsonLd as NextSeoProductJsonLd } from "next-seo";

interface ProductJsonLdProps {
  product: Product;
  baseUrl?: string;
}

const ProductJsonLd = ({
  product,
  baseUrl = "https://yupsis-delta.vercel.app",
}: ProductJsonLdProps) => {
  return (
    <NextSeoProductJsonLd
      productName={product.title}
      images={[product.image]}
      description={product.description}
      brand="YupStore"
      offers={[
        {
          price: product.price.toString(),
          priceCurrency: "USD",
          itemCondition: "https://schema.org/NewCondition",
          availability: "https://schema.org/InStock",
          url: `${baseUrl}/product/${product.id}`,
          seller: {
            name: "YupStore",
          },
        },
      ]}
      mpn={product.id.toString()}
    />
  );
};

export default ProductJsonLd;
