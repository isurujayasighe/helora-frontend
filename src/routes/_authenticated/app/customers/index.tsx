// src/routes/_authenticated/app/customers/index.tsx

import CustomersPage from "@/modules/app/customers";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const booleanSearchParam = z.preprocess(
  (value) => value === true || value === "true",
  z.boolean(),
);

const customersSearchSchema = z.object({
  customerDetails: booleanSearchParam.optional().catch(false),
  customerId: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/app/customers/")({
  validateSearch: customersSearchSchema,
  component: CustomersPage,
  staticData: {
    title: "Customers",
    requiresAuth: true,
    breadcrumbs: [
      {
        label: "Customers",
        to: "/app/customers",
        permission: { action: "read", subject: "Customers" },
      },
    ],
  },
});