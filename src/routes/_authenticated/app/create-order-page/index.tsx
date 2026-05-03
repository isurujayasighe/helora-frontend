import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { CreateOrderPage } from "@/modules/app/order-create/index";

const booleanSearchParam = z.preprocess(
  (value) => value === true || value === "true",
  z.boolean()
);

const orderCreateSearchSchema = z.object({
  customerId: z.string().optional(),
  measurementId: z.string().optional(),
  blockId: z.string().optional(),
  categoryId: z.string().optional(),

  /**
   * Optional context when creating from group order page.
   */
  groupOrderId: z.string().optional(),

  /**
   * Optional source preset when opening from WhatsApp / phone / shop flow.
   */
  orderSource: z
    .enum(["DREZAURA", "PHYSICAL_SHOP", "PHONE_CALL", "WHATSAPP", "ONLINE"])
    .optional(),

  /**
   * Optional navigation behavior.
   * Example: /app/order-create?printDraft=true
   */
  printDraft: booleanSearchParam.optional().catch(false),
});

export const Route = createFileRoute("/_authenticated/app/create-order-page/")({
  validateSearch: orderCreateSearchSchema,
  component: OrderCreateRoute,
  staticData: {
    title: "Create Order",
    requiresAuth: true,
    breadcrumbs: [
      {
        label: "Orders",
        to: "/app/orders",
        permission: { action: "read", subject: "orders" },
      },
      {
        label: "Create Order",
        to: "/app/order-create",
        permission: { action: "create", subject: "orders" },
      },
    ],
  },
});

function OrderCreateRoute() {
  const search = Route.useSearch();

  return (
    <CreateOrderPage
      prefill={{
        customerId: search.customerId,
        measurementId: search.measurementId,
        blockId: search.blockId,
        categoryId: search.categoryId,
      }}
    />
  );
}