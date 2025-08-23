"use client";
import { ProductCard } from "@/components/shared/product-card";
import { ProductCardSkeleton } from "@/components/shared/product-card-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useCart from '@/hooks/useCart';
import useUser from "@/hooks/useUser";
import { api } from "@/trpc/react";
import type { Product } from "@/types";
import {
  ArrowLeft,
  Heart,
  RotateCcw,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Loading from "./loading";
import UnAuth from "@/components/shared/UnAuth";

export const ErrorBackButton = () => {
  const router = useRouter();
  return (
    <Button onClick={() => router.push("/products")}>
      Browse All Products
    </Button>
  );
};

export const BackButton = () => {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      onClick={() => router.back()}
      className="mb-2 -ml-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
};

export const FevButton = () => {
  const [isFavorite, setIsFavorite] = useState(false);
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setIsFavorite(!isFavorite)}
    >
      <Heart
        className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
      />
    </Button>
  );
};

export const ShareButton = ({ product }: { product: Product }) => {
  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      void navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };
  return (
    <Button variant="outline" size="icon" onClick={handleShare}>
      <Share2 className="h-4 w-4" />
    </Button>
  );
};

export const QuanControlAndAddCart = ({ product }: { product: Product }) => {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const handleAddToCart = () => {
    if (!product) return;

    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast.success(
      `${quantity} ${product.title}${quantity > 1 ? "s" : ""} added to cart!`,
    );
  };
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Quantity</label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(quantity + 1)}
          >
            +
          </Button>
        </div>
      </div>

      <Button onClick={handleAddToCart} size="lg" className="w-full">
        <ShoppingCart className="mr-2 h-5 w-5" />
        Add to Cart - ${(product.price * quantity).toFixed(2)}
      </Button>
    </div>
  );
};

export const RelatedProduct = ({ product }: { product: Product }) => {
  const { data: relatedProducts = [], isLoading: reLoadin } =
    api.product.getByCategory.useQuery(
      {
        category: product?.category ?? "",
        limit: 4,
        excludeId: product?.id,
      },
      { enabled: !!product?.category },
    );
  return (
    <div className="mt-16">
      <h2 className="mb-6 text-2xl font-bold">You might also like</h2>
      {reLoadin ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : relatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {relatedProducts.map((relatedProduct, index) => (
            <ProductCard
              key={relatedProduct.id}
              product={relatedProduct}
              pos={index}
            />
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground py-8 text-center">
          <p>No related products found in this category</p>
        </div>
      )}
    </div>
  );
};

export const FullPage = ({ product }: { product: Product }) => {


  return (
    <>
      <div className="min-h-screen">
        {/* Breadcrumb & Back Button */}
        <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <BackButton />
            <nav className="text-muted-foreground text-sm">
              <span>Products</span>
              <span className="mx-2">/</span>
              <Link
                className="text-foreground font-medium"
                href={`/products?category=${product.category}`}
              >
                {product.category}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground font-medium">
                {product.title}
              </span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div id='product' className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="bg-muted relative aspect-square overflow-hidden rounded-lg border">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="mb-2 flex items-start justify-between">
                  <Badge variant="secondary" className="mb-2">
                    {product.category}
                  </Badge>
                  <div className="flex gap-2">
                    <FevButton />
                    <ShareButton product={product} />
                  </div>
                </div>

                <h1 className="mb-2 text-3xl font-bold">{product.title}</h1>

                {/* Rating (placeholder since not in data) */}
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.floor(product.rating.rate)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground text-sm">
                    ({product.rating.rate}) · {product.rating.count} reviews
                  </span>
                </div>

                <div className="text-primary mb-6 text-3xl font-bold">
                  ${product.price.toFixed(2)}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="mb-2 font-semibold">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              <Separator />

              {/* Quantity & Add to Cart */}
              <QuanControlAndAddCart product={product} />

              <Separator />

              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-green-600" />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span>1 year warranty included</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RotateCcw className="h-5 w-5 text-purple-600" />
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          <RelatedProduct product={product} />
        </div>
      </div>
    </>
  );
};
