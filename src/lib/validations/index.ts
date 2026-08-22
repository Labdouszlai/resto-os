import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const signUpSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const restaurantSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  currency: z.string().optional(),
  taxRate: z.number().optional(),
});

export const branchSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export const menuCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.number().optional(),
});

export const menuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  categoryId: z.string().min(1),
  preparationTime: z.number().optional(),
  isAvailable: z.boolean().optional(),
  taxRate: z.number().optional(),
  cost: z.number().optional(),
  sku: z.string().optional(),
});

export const modifierSchema = z.object({
  name: z.string().min(1),
  price: z.number().optional(),
});

export const tableSchema = z.object({
  number: z.number().min(1),
  capacity: z.number().min(1),
  branchId: z.string().optional(),
});

export const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const reservationSchema = z.object({
  customerId: z.string().optional(),
  tableId: z.string().optional(),
  date: z.string().min(1),
  time: z.string().min(1),
  partySize: z.number().min(1),
  notes: z.string().optional(),
  status: z.string().optional(),
});

export const employeeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.string().min(1),
  branchId: z.string().optional(),
  position: z.string().optional(),
  status: z.string().optional(),
  hireDate: z.string().optional(),
  salary: z.number().optional(),
});

export const ingredientSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  unit: z.string().min(1),
  currentStock: z.number().optional(),
  minimumStock: z.number().optional(),
  costPerUnit: z.number().optional(),
  supplierId: z.string().optional(),
  expirationDate: z.string().optional(),
});

export const supplierSchema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1),
  items: z.array(
    z.object({
      ingredientId: z.string().min(1),
      quantity: z.number().min(0),
      unitCost: z.number().min(0),
    })
  ),
  tax: z.number().optional(),
  notes: z.string().optional(),
});

export const orderSchema = z.object({
  type: z.string().min(1),
  tableId: z.string().optional(),
  customerId: z.string().optional(),
  branchId: z.string().optional(),
  notes: z.string().optional(),
});

export const orderItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().min(1),
  price: z.number().min(0),
  notes: z.string().optional(),
  modifiers: z.array(z.string()).optional(),
});

export const paymentSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().min(0),
  method: z.string().min(1),
  reference: z.string().optional(),
});

export const expenseSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  amount: z.number().min(0),
  date: z.string().min(1),
  paymentMethod: z.string().optional(),
  description: z.string().optional(),
  branchId: z.string().optional(),
});

export const searchQuerySchema = z.object({
  query: z.string().min(1),
});
