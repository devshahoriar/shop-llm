import { z } from "zod/v4";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import type { orderSchema } from "@/lib/validations";

const orders: Array<z.infer<typeof orderSchema>> = [];

const checkoutItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1),
  price: z.number().positive(),
});

const processCheckoutInputSchema = z.object({
  email: z.string().email(),
  shipping: z.object({
    firstName: z.string(),
    lastName: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
    phone: z.string(),
  }),
  billingAddress: z.object({
    sameAsShipping: z.boolean(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }),
  payment: z.object({
    cardNumber: z.string(),
    expiryMonth: z.string(),
    expiryYear: z.string(),
    cvv: z.string(),
    cardholderName: z.string(),
  }),
  newsletter: z.boolean().optional(),
  terms: z.boolean(),
  items: z.array(checkoutItemSchema),
});

type ProcessCheckoutInput = z.infer<typeof processCheckoutInputSchema>;

export const checkoutRouter = createTRPCRouter({
  // Process checkout
  processCheckout: publicProcedure
    .input(processCheckoutInputSchema)
    .mutation(async ({ input }: { input: ProcessCheckoutInput }) => {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Calculate totals
      const subtotal = input.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.08; // 8% tax
      const shipping = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
      const total = subtotal + tax + shipping;

      // Generate order ID
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create order
      const order: z.infer<typeof orderSchema> = {
        id: orderId,
        customerId: `CUST-${Date.now()}`, // In real app, this would be from auth
        items: input.items,
        subtotal,
        tax,
        shipping,
        total,
        status: "pending",
        shippingAddress: {
          firstName: input.shipping.firstName,
          lastName: input.shipping.lastName,
          address: input.shipping.address,
          city: input.shipping.city,
          state: input.shipping.state,
          zipCode: input.shipping.zipCode,
          country: input.shipping.country,
          phone: input.shipping.phone,
        },
        billingAddress: input.billingAddress.sameAsShipping ? {
          firstName: input.shipping.firstName,
          lastName: input.shipping.lastName,
          address: input.shipping.address,
          city: input.shipping.city,
          state: input.shipping.state,
          zipCode: input.shipping.zipCode,
          country: input.shipping.country,
        } : {
          firstName: input.billingAddress.firstName!,
          lastName: input.billingAddress.lastName!,
          address: input.billingAddress.address!,
          city: input.billingAddress.city!,
          state: input.billingAddress.state!,
          zipCode: input.billingAddress.zipCode!,
          country: input.billingAddress.country!,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store order (in real app, this would go to database)
      orders.push(order);

      return {
        success: true,
        orderId,
        order,
        message: "Order placed successfully!",
      };
    }),

  // Get order by ID
  getOrder: publicProcedure
    .input(z.object({ orderId: z.string() }))
    .query(({ input }: { input: { orderId: string } }) => {
      const order = orders.find(o => o.id === input.orderId);
      if (!order) {
        throw new Error("Order not found");
      }
      return order;
    }),

  // Calculate checkout totals
  calculateTotals: publicProcedure
    .input(z.object({
      items: z.array(checkoutItemSchema),
      shippingAddress: z.object({
        state: z.string(),
        country: z.string(),
      }).optional(),
    }))
    .query(({ input }: { input: { items: z.infer<typeof checkoutItemSchema>[]; shippingAddress?: { state: string; country: string } } }) => {
      const subtotal = input.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Calculate tax based on shipping address (simplified)
      let taxRate = 0.08; // Default 8%
      if (input.shippingAddress?.state === "CA") {
        taxRate = 0.0975; // California tax
      } else if (input.shippingAddress?.state === "NY") {
        taxRate = 0.08; // New York tax
      }
      
      const tax = subtotal * taxRate;
      const shipping = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
      const total = subtotal + tax + shipping;

      return {
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        shipping: Math.round(shipping * 100) / 100,
        total: Math.round(total * 100) / 100,
        freeShippingEligible: subtotal > 100,
        freeShippingRemaining: subtotal < 100 ? 100 - subtotal : 0,
      };
    }),
});
