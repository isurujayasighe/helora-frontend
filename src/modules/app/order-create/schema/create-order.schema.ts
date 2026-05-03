import { z } from "zod";

export const measurementValuesSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.undefined(), z.null()]),
);

export const orderItemSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  blockId: z.string().optional(),
  measurementId: z.string().optional(),
  itemDescription: z.string().min(1, "Item description is required"),
  quantity: z.coerce.number().min(1, "Qty must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price must be 0 or more"),
  lineTotal: z.coerce.number().min(0),
  notes: z.string().optional(),
  tailorNote: z.string().optional(),
  status: z
    .enum(["PENDING", "CUTTING", "SEWING", "READY", "DELIVERED", "CANCELLED"])
    .default("PENDING"),

  blockMode: z.enum(["existing", "measurement-only"]).default("measurement-only"),
  measurements: measurementValuesSchema.default({}),
  measurementNote: z.string().optional(),
});

export const formSchema = z.object({
  phoneNumber: z.string().min(7, "Phone number is required"),
  customerMode: z.enum(["existing", "new"]).default("existing"),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerTown: z.string().optional(),
  customerAddress: z.string().optional(),
  customerNotes: z.string().optional(),
  hospitalName: z.string().optional(),
  groupOrderId: z.string().optional(),

  orderNumber: z.string().optional(),
  orderDate: z.string().min(1, "Order date is required"),
  promisedDate: z.string().min(1, "Promised date is required"),
  completedAt: z.string().optional(),
  deliveredAt: z.string().optional(),

  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "CUTTING",
      "SEWING",
      "READY",
      "DELIVERED",
      "CANCELLED",
    ])
    .default("PENDING"),

  orderSource: z
    .enum(["DREZAURA", "PHYSICAL_SHOP", "PHONE_CALL", "WHATSAPP", "ONLINE"])
    .default("PHYSICAL_SHOP"),

  paymentStatus: z
    .enum(["UNPAID", "ADVANCE_PAID", "PARTIALLY_PAID", "PAID", "REFUNDED"])
    .default("UNPAID"),

  paymentMode: z
    .enum(["CASH", "ONLINE_TRANSFER", "BANK_DEPOSIT", "CARD", "MIXED"])
    .default("CASH"),

  totalQty: z.coerce.number().min(0).default(0),
  totalAmount: z.coerce.number().min(0).default(0),
  advanceAmount: z.coerce.number().min(0).default(0),
  balanceAmount: z.coerce.number().min(0).default(0),
  courierCharges: z.coerce.number().min(0).default(0),

  notes: z.string().optional(),
  specialNotes: z.string().optional(),

  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});