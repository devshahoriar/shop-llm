/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import useCart from '@/hooks/useCart';
import { useSocketIo } from "@/hooks/useSocketIo";
import type { ToolsResponse } from "@/types";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ManageToolsAction = () => {
  const { isConnected, on, off } = useSocketIo();
  const { setTheme } = useTheme();
  const router = useRouter();
  const { addItem,removeItem,updateQuantity } = useCart();

  const toolsHandler = (tool: ToolsResponse) => {
    console.log("Tools received:", tool);
    if (tool.name === "theme") {
      setTheme(tool.data?.value as string);
    }
    if (tool.name === "navigate") {
      router.push(tool.data?.value as string);
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
