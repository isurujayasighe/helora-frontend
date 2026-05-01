import OrderPage from "@/modules/app/orders";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const booleanSearchParam = z.preprocess(
  (value) => value === true || value === "true",
  z.boolean(),
);

const ordersSearchSchema = z.object({
  addOrder: booleanSearchParam.optional().catch(false),
  customerId: z.string().optional(),
  measurementId: z.string().optional(),
  blockId: z.string().optional(),
  categoryId: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/app/orders/")({
  validateSearch: ordersSearchSchema,
  component: OrderPage,
  staticData: {
    title: "My Orders",
    requiresAuth: true,
    breadcrumbs: [
      {
        label: "My Orders",
        to: "/app/orders",
        permission: { action: "read", subject: "Orders" },
      },
    ],
  },
});