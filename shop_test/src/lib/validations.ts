import { z } from "zod/v4";

const validateZipCode = (value: string) => {
  return /^\d{5}(-\d{4})?$/.test(value);
};

const validatePhoneNumber = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

const validateCardNumber = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.length === 16;
};

const validateCVV = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.length >= 3 && cleaned.length <= 4;
};

const validateExpiryMonth = (value: string) => {
  const month = parseInt(value, 10);
  return month >= 1 && month <= 12;
};

const validateExpiryYear = (value: string) => {
  const year = parseInt(value, 10);
  const currentYear = new Date().getFullYear();
  return year >= currentYear && year <= currentYear + 20;
};

export const checkoutSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  
  shipping: z.object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters"),
    address: z
      .string()
      .min(1, "Address is required")
      .min(5, "Address must be at least 5 characters")
      .max(200, "Address must be less than 200 characters"),
    city: z
      .string()
      .min(1, "City is required")
      .min(2, "City must be at least 2 characters")
      .max(100, "City must be less than 100 characters"),
    state: z
      .string()
      .min(1, "State is required")
      .min(2, "State must be at least 2 characters")
      .max(50, "State must be less than 50 characters"),
    zipCode: z
      .string()
      .min(1, "ZIP code is required")
      .refine(validateZipCode, "Invalid ZIP code format (e.g., 12345 or 12345-6789)"),
    country: z
      .string()
      .min(1, "Country is required")
      .max(100, "Country must be less than 100 characters"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .refine(validatePhoneNumber, "Invalid phone number (10-15 digits)"),
  }),

  billingAddress: z.object({
    sameAsShipping: z.boolean(),
    firstName: z.string().max(50).optional(),
    lastName: z.string().max(50).optional(),
    address: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(50).optional(),
    zipCode: z.string().optional(),
    country: z.string().max(100).optional(),
  }),

  payment: z.object({
    cardNumber: z
      .string()
      .min(1, "Card number is required")
      .refine(validateCardNumber, "Card number must be 16 digits"),
    expiryMonth: z
      .string()
      .min(1, "Expiry month is required")
      .refine(validateExpiryMonth, "Invalid month (01-12)"),
    expiryYear: z
      .string()
      .min(1, "Expiry year is required")
      .refine(validateExpiryYear, "Invalid year or card expired"),
    cvv: z
      .string()
      .min(1, "CVV is required")
      .refine(validateCVV, "CVV must be 3 or 4 digits"),
    cardholderName: z
      .string()
      .min(1, "Cardholder name is required")
      .min(2, "Cardholder name must be at least 2 characters")
      .max(100, "Cardholder name must be less than 100 characters"),
  }),

  newsletter: z.boolean().optional(),
  terms: z
    .boolean()
    .refine((val) => val === true, "You must accept the terms and conditions"),
}).superRefine((data, ctx) => {
  if (!data.billingAddress.sameAsShipping) {
    const requiredFields = [
      { field: 'firstName', message: 'First name is required for billing address' },
      { field: 'lastName', message: 'Last name is required for billing address' },
      { field: 'address', message: 'Address is required for billing address' },
      { field: 'city', message: 'City is required for billing address' },
      { field: 'state', message: 'State is required for billing address' },
      { field: 'zipCode', message: 'ZIP code is required for billing address' },
      { field: 'country', message: 'Country is required for billing address' },
    ];

    requiredFields.forEach(({ field, message }) => {
      const value = data.billingAddress[field as keyof typeof data.billingAddress];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message,
          path: ['billingAddress', field],
        });
      }
    });

    if (data.billingAddress.zipCode && !validateZipCode(data.billingAddress.zipCode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid billing ZIP code format',
        path: ['billingAddress', 'zipCode'],
      });
    }
  }

  if (data.payment.expiryMonth && data.payment.expiryYear) {
    const month = parseInt(data.payment.expiryMonth, 10);
    const year = parseInt(data.payment.expiryYear, 10);
    const expiryDate = new Date(year, month - 1, 1);
    const currentDate = new Date();
    currentDate.setDate(1);

    if (expiryDate < currentDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Card has expired',
        path: ['payment', 'expiryMonth'],
      });
    }
  }
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const orderSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1),
    price: z.number().positive(),
  })),
  subtotal: z.number().positive(),
  tax: z.number().min(0),
  shipping: z.number().min(0),
  total: z.number().positive(),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
  shippingAddress: z.object({
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
    firstName: z.string(),
    lastName: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Order = z.infer<typeof orderSchema>;
