import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { GroupOrderDetailsPage } from "@/modules/app/group-orders/pages/group-order-details-page";

const booleanSearchParam = z.preprocess(
  (value) => value === true || value === "true",
  z.boolean()
);

const groupOrderDetailsSearchSchema = z.object({
  addOrder: booleanSearchParam.optional().catch(false),
});

export const Route = createFileRoute(
  "/_authenticated/app/group-orders/$groupOrderId"
)({
  validateSearch: groupOrderDetailsSearchSchema,
  component: GroupOrderDetailsPage,
});