"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useCart from '@/hooks/useCart';

interface CartModalProps {
  onClose: () => void;
}

export function CartModal({ onClose }: CartModalProps) {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  if (state.items.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Shopping Cart</h3>
        <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Shopping Cart</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCart}
          className="text-muted-foreground hover:text-destructive"
        >
          Clear All
        </Button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {state.items.map((item) => (
          <div key={item.product.id} className="flex items-center space-x-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-md">
              <Image
                src={item.product.image}
                alt={item.product.title}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">{item.product.title}</h4>
              <p className="text-sm text-muted-foreground">
                ${item.product.price.toFixed(2)}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() =>
                  updateQuantity(item.product.id, item.quantity - 1)
                }
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() =>
                  updateQuantity(item.product.id, item.quantity + 1)
                }
              >
                <Plus className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(item.product.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Items ({state.itemCount})</span>
          <span>${state.total.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>${state.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Button className="w-full" onClick={handleCheckout}>
          Checkout
        </Button>
        <Button variant="outline" className="w-full" onClick={onClose}>
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
