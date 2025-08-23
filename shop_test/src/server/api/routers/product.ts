import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  fetchProduct,
  fetchProductById
} from "@/server/services/product.services";
import { z } from "zod/v4";

export const productRouter = createTRPCRouter({
  getFeatured: publicProcedure.query(async () => {
    const products = await fetchProduct();
    return products.slice(0, 4);
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => await fetchProductById(input.id)),
  getFilteredPaginated: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(12),
        cursor: z.number().default(0),
        search: z.string().optional(),
        category: z.string().optional(),
        sortBy: z.enum(["name", "price-low", "price-high"]).default("name"),
      }),
    )
    .query(async ({ input }) => {
      const { limit, cursor, search, category, sortBy } = input;
      const products = await fetchProduct();
      // Filter products
      const filteredProducts = products.filter((product) => {
        // Search filter
        const matchesSearch =
          !search ||
          product.title.toLowerCase().includes(search.toLowerCase()) ||
          product.description.toLowerCase().includes(search.toLowerCase());

        // Category filter
        const matchesCategory =
          !category || category === "all" || product.category === category;

        return matchesSearch && matchesCategory;
      });

      // Sort products
      filteredProducts.sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return a.price - b.price;
          case "price-high":
            return b.price - a.price;
          case "name":
          default:
            return a.title.localeCompare(b.title);
        }
      });

      // Paginate
      const startIndex = cursor;
      const endIndex = startIndex + limit;
      const items = filteredProducts.slice(startIndex, endIndex);
      const hasNextPage = endIndex < filteredProducts.length;

      return {
        items,
        nextCursor: hasNextPage ? endIndex : null,
        hasNextPage,
        totalCount: filteredProducts.length,
        totalProducts: products.length,
      };
    }),

  // Get unique categories
  getCategories: publicProcedure.query(async () => {
    const products = await fetchProduct();
    const categories = [...new Set(products.map((p) => p.category))];
    return categories;
  }),

  // Get products by category (for related products)
  getByCategory: publicProcedure
    .input(
      z.object({
        category: z.string(),
        limit: z.number().default(4),
        excludeId: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { category, limit, excludeId } = input;
      const products = await fetchProduct();

      return products
        .filter((p) => p.category === category && p.id !== excludeId)
        .slice(0, limit);
    }),
});
