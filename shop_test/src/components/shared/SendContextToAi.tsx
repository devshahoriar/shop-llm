/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import useCart from "@/hooks/useCart";
import { useSocketIo } from "@/hooks/useSocketIo";
import useUser from "@/hooks/useUser";
import type { ToolsResponse } from "@/types";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const ContextType = [
  "cart",
  "products",
  "user",
  "theme",
] as const;
type ContextTypeEnum = (typeof ContextType)[number];

const getPageData = () =>
  document.querySelector("#products")?.innerHTML ??
  document.querySelector("#product")?.innerHTML ??
  "";

const SendContextToAi = () => {
  const { isConnected, on, off, emit } = useSocketIo();
  const { state } = useCart();
  const { theme } = useTheme();
  const { data } = useUser();
  const pathname = usePathname();

  const sendContext = (response: ToolsResponse) => {
    console.log("Context requested:", response);
    const { contextType } = response.data as {
      contextType: ContextTypeEnum;
    };
    switch (contextType) {
      case "cart":
        emit("context", {
          name: "context",
          data: {
            cart: state,
          },
        });
        break;
      case "theme":
        emit("context", {
          name: "context",
          data: {
            theme,
          },
        });
        break;
      case "user":
        emit("context", {
          name: "context",
          data: {
            user: data?.email ?? "Guest",
          },
        });
        break;
      case "products":
        emit("context", {
          name: "context",
          data: {
            currentPage: pathname,
            pageData: getPageData(),
          },
        });
        break;
      default:
        emit("context", {
          name: "context",
          data: {
            error: `Unknown context type: ${contextType as string}. Valid ContextTypes: ${ContextType.join(", ").toString()}`,
          },
        });
        break;
    }
  };

  useEffect(() => {
    if (!isConnected) return;

    on("wantContext", sendContext);

    return () => {
      off("wantContext", sendContext);
    };
  }, [isConnected]);

  return null;
};

export default SendContextToAi;
