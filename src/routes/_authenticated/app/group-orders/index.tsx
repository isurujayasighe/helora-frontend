import GroupOrdersPage from "@/modules/app/group-orders";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";


const booleanSearchParam = z.preprocess(
  (value) => value === true || value === "true",
  z.boolean()
);

const groupOrdersSearchSchema = z.object({
  create: booleanSearchParam.optional().catch(false),
});

export const Route = createFileRoute("/_authenticated/app/group-orders/")({
  validateSearch: groupOrdersSearchSchema,
  component: GroupOrdersPage,
});