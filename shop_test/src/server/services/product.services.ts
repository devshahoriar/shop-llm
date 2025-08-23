"use server";
import { ProductKey } from "@/data";
import type { Product } from "@/types";
import axios from "axios";
import { unstable_cache } from "next/cache";

export const fetchProduct = unstable_cache(
  async () =>
    (await axios.get<Product[]>("https://fakestoreapi.com/products")).data,
  [ProductKey],
  {
    revalidate: 1440, // 24 hours
    tags: [ProductKey],
  },
);

export const fetchProductById = async (pId: string | number) => {
  const cashedProduct = unstable_cache(
    async (id) =>
      (await axios.get<Product>(`https://fakestoreapi.com/products/${id}`))
        .data,
    ['id'],
    {
      revalidate: 1440, // 24 hours
      tags: [`${ProductKey}-${pId}`],
    },
  );
  return cashedProduct(pId);
};