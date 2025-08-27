/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { api } from "@/trpc/react";
import type { Product } from "@/types";
import React, {
  createContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export type CartAction =
  | { type: "ADD_ITEM"; payload: Product }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartState }
  | {
      type: "AI_Cart";
      payload: {
        id: number;
        quantity: number;
      };
    };

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
};

function calculateTotal(items: CartItem[]): number {
  return items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
}

function calculateItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  // Ensure state is always properly initialized
  if (!state?.items) {
    state = initialState;
  }

  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.product.id === action.payload.id,
      );

      let newItems: CartItem[];
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.product.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        newItems = [...state.items, { product: action.payload, quantity: 1 }];
      }

      return {
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter(
        (item) => item.product.id !== action.payload,
      );
      return {
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items
        .map((item) =>
          item.product.id === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item,
        )
        .filter((item) => item.quantity > 0);

      return {
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    }

    case "CLEAR_CART": {
      return initialState;
    }

    case "LOAD_CART": {
      // Ensure loaded cart has proper structure
      const loadedCart = action.payload;
      if (!loadedCart?.items || !Array.isArray(loadedCart.items)) {
        return initialState;
      }
      return {
        items: loadedCart.items,
        total: loadedCart.total ?? calculateTotal(loadedCart.items),
        itemCount: loadedCart.itemCount ?? calculateItemCount(loadedCart.items),
      };
    }

    case "AI_Cart": {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.product.id === id);

      let newItems: CartItem[];
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.product.id === id
            ? { ...item, quantity: Math.max(0, quantity) }
            : item,
        );
      } else if (quantity > 0) {
        const product = api.product.getById.useQuery({ id }).data;
        if (!product) {
          return state;
        }
        newItems = [...state.items, { product, quantity }];
      } else {
        // If quantity is 0 and item doesn't exist, do nothing
        return state;
      }

      // Filter out items with quantity 0
      newItems = newItems.filter((item) => item.quantity > 0);

      return {
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    }

    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(
  undefined,
);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [ready, setReady] = React.useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage ? localStorage?.getItem("cart") : null;
    if (savedCart) {
      try {
        const parsedCart: CartState = JSON?.parse(savedCart);
        // Validate the parsed cart structure
        if (
          parsedCart &&
          typeof parsedCart === "object" &&
          Array.isArray(parsedCart.items)
        ) {
          dispatch({ type: "LOAD_CART", payload: parsedCart });
        } else {
          console.warn(
            "Invalid cart data in localStorage, using initial state",
          );
          localStorage.removeItem("cart");
        }
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // Save cart to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state));
  }, [state]);

  const addItem = (product: Product) => {
    dispatch({ type: "ADD_ITEM", payload: product });
  };

  const removeItem = (productId: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: productId });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  useEffect(() => {
    setReady(true);
  }, []);

  // this only for next js , it sometime throws error if not used
  if (!ready) {
    return null;
  }

  return (
    <CartContext.Provider
      value={{ state, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
