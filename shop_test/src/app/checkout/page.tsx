"use client";

import UnAuth from "@/components/shared/UnAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import useCart from "@/hooks/useCart";
import useUser from "@/hooks/useUser";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validations";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, MapPin, Truck, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function CheckoutPage() {
  const [ready, setReady] = useState(false);
  const { state, clearCart } = useCart();
  const router = useRouter();
  const { isLoggedIn, isLoading, data } = useUser();

  useEffect(() => {
    setReady(true);
  }, []);

  const processCheckout = api.checkout.processCheckout.useMutation({
    onSuccess: (result) => {
      console.log("=== CHECKOUT DETAILS ===");
      console.log("Order", result);
      console.log("========================");

      toast.success(`Order placed successfully! Order ID: ${result.orderId}`);
      clearCart();
      router.push("/");
    },
    onError: (error) => {
      console.error("Checkout error:", error);
      toast.error("Failed to process order. Please try again.");
    },
  });

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: data?.email ?? "",
      shipping: {
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
        phone: "",
      },
      billingAddress: {
        sameAsShipping: true,
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
      payment: {
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        cardholderName: "",
      },
      newsletter: false,
      terms: false,
    },
  });

  // here i use register syntax
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;
  const sameAsShipping = watch("billingAddress.sameAsShipping");

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      const items = state.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      await processCheckout.mutateAsync({
        ...data,
        items,
      });
    } catch (error) {
      console.log("Checkout error:", error);
      throw new Error("Failed to process checkout");
    } finally {
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn && !isLoading) {
    return <UnAuth />;
  }

  if (state.items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Add some products to your cart to proceed with checkout.
          </p>
          <Button onClick={() => window.history.back()}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = state.total;
  const tax = subtotal * 0.08;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  return (
    <div className="bg-muted/30 min-h-screen py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">Complete your order below</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="text-destructive mt-1 text-sm">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="shipping.firstName">First Name</Label>
                      <Input
                        id="shipping.firstName"
                        {...register("shipping.firstName")}
                        placeholder="John"
                      />
                      {errors.shipping?.firstName && (
                        <p className="text-destructive mt-1 text-sm">
                          {errors.shipping.firstName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="shipping.lastName">Last Name</Label>
                      <Input
                        id="shipping.lastName"
                        {...register("shipping.lastName")}
                        placeholder="Doe"
                      />
                      {errors.shipping?.lastName && (
                        <p className="text-destructive mt-1 text-sm">
                          {errors.shipping.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="shipping.address">Address</Label>
                    <Input
                      id="shipping.address"
                      {...register("shipping.address")}
                      placeholder="123 Main Street"
                    />
                    {errors.shipping?.address && (
                      <p className="text-destructive mt-1 text-sm">
                        {errors.shipping.address.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="shipping.city">City</Label>
                      <Input
                        id="shipping.city"
                        {...register("shipping.city")}
                        placeholder="New York"
                      />
                      {errors.shipping?.city && (
                        <p className="text-destructive mt-1 text-sm">
                          {errors.shipping.city.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="shipping.state">State</Label>
                      <Input
                        id="shipping.state"
                        {...register("shipping.state")}
                        placeholder="NY"
                      />
                      {errors.shipping?.state && (
                        <p className="text-destructive mt-1 text-sm">
                          {errors.shipping.state.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="shipping.zipCode">ZIP Code</Label>
                      <Input
                        id="shipping.zipCode"
                        {...register("shipping.zipCode")}
                        placeholder="10001"
                      />
                      {errors.shipping?.zipCode && (
                        <p className="text-destructive mt-1 text-sm">
                          {errors.shipping.zipCode.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="shipping.country">Country</Label>
                      <Input
                        id="shipping.country"
                        {...register("shipping.country")}
                        placeholder="United States"
                      />
                      {errors.shipping?.country && (
                        <p className="text-destructive mt-1 text-sm">
                          {errors.shipping.country.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="shipping.phone">Phone Number</Label>
                      <Input
                        id="shipping.phone"
                        {...register("shipping.phone")}
                        placeholder="(555) 123-4567"
                      />
                      {errors.shipping?.phone && (
                        <p className="text-destructive mt-1 text-sm">
                          {errors.shipping.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Billing Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="billingAddress.sameAsShipping"
                      control={form.control}
                      render={({ field }) => (
                        <Checkbox
                          id="sameAsShipping"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="sameAsShipping">
                      Same as shipping address
                    </Label>
                  </div>

                  {!sameAsShipping && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="billingAddress.firstName">
                            First Name
                          </Label>
                          <Input
                            id="billingAddress.firstName"
                            {...register("billingAddress.firstName")}
                            placeholder="John"
                          />
                          {errors.billingAddress?.firstName && (
                            <p className="text-destructive mt-1 text-sm">
                              {errors.billingAddress.firstName.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="billingAddress.lastName">
                            Last Name
                          </Label>
                          <Input
                            id="billingAddress.lastName"
                            {...register("billingAddress.lastName")}
                            placeholder="Doe"
                          />
                          {errors.billingAddress?.lastName && (
                            <p className="text-destructive mt-1 text-sm">
                              {errors.billingAddress.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Add other billing fields similar to shipping */}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="payment.cardholderName">
                      Cardholder Name
                    </Label>
                    <Input
                      id="payment.cardholderName"
                      {...register("payment.cardholderName")}
                      placeholder="John Doe"
                    />
                    {errors.payment?.cardholderName && (
                      <p className="text-destructive mt-1 text-sm">
                        {errors.payment.cardholderName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="payment.cardNumber">Card Number</Label>
                    <Input
                      id="payment.cardNumber"
                      {...register("payment.cardNumber")}
                      placeholder="1234 5678 9012 3456"
                    />
                    {errors.payment?.cardNumber && (
                      <p className="text-destructive mt-1 text-sm">
                        {errors.payment.cardNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="payment.expiryMonth">Month</Label>
                      <Input
                        id="payment.expiryMonth"
                        {...register("payment.expiryMonth")}
                        placeholder="12"
                      />
                      {errors.payment?.expiryMonth && (
                        <p className="text-destructive mt-1 text-sm">
                          {errors.payment.expiryMonth.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="payment.expiryYear">Year</Label>
                      <Input
                        id="payment.expiryYear"
                        {...register("payment.expiryYear")}
                        placeholder="2025"
                      />
                      {errors.payment?.expiryYear && (
                        <p className="text-destructive mt-1 text-sm">
                          {errors.payment.expiryYear.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="payment.cvv">CVV</Label>
                      <Input
                        id="payment.cvv"
                        {...register("payment.cvv")}
                        placeholder="123"
                      />
                      {errors.payment?.cvv && (
                        <p className="text-destructive mt-1 text-sm">
                          {errors.payment.cvv.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms and Newsletter */}
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="newsletter"
                      control={form.control}
                      render={({ field }) => (
                        <Checkbox
                          id="newsletter"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="newsletter">
                      Subscribe to our newsletter for updates and offers
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="terms"
                      control={form.control}
                      render={({ field }) => (
                        <Checkbox
                          id="terms"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="terms">
                      I accept the terms and conditions
                    </Label>
                  </div>
                  {errors.terms && (
                    <p className="text-destructive text-sm">
                      {errors.terms.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={processCheckout.isPending}
              >
                {processCheckout.isPending
                  ? "Processing..."
                  : `Place Order - $${total.toFixed(2)}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center space-x-3"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-md">
                      <Image
                        src={item.product.image}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-medium">
                        {item.product.title}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {subtotal <= 50 && (
                  <div className="text-muted-foreground bg-muted rounded-lg p-3 text-sm">
                    💡 Add ${(50 - subtotal).toFixed(2)} more to get free
                    shipping!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
