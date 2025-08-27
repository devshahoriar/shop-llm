/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import useCart from "@/hooks/useCart";
import { useSocketIo } from "@/hooks/useSocketIo";
import { fetchProductById } from "@/server/services/product.services";
import type { ToolsResponse } from "@/types";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ManageToolsAction = () => {
  const { isConnected, on, off } = useSocketIo();
  const { setTheme } = useTheme();
  const router = useRouter();
  const { addItem, removeItem } = useCart();

  const toolsHandler = async (tool: ToolsResponse) => {
    console.log("Tools received:", tool);
    if (tool.name === "theme") {
      setTheme(tool.data?.value as string);
    }
    if (tool.name === "navigate") {
      router.push(tool.data?.value as string);
    }
    if (tool.name === "cart") {
      const { action, productId } = tool.data;
      const product = await fetchProductById(Number(productId));
      if (action === "add") {
        addItem(product);
      } else if (action === "remove") {
        removeItem(product.id);
      }
    }
  };

  useEffect(() => {
    if (!isConnected) return;

    on("tools", toolsHandler);

    return () => {
      off("tools", toolsHandler);
    };
  }, [isConnected]);
  return null;
};

export default ManageToolsAction;
