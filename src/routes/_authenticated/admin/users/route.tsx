import UsersPage from "@/modules/admin/users";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

// 1. Define the schema for your URL search parameters
const userSearchSchema = z.object({
  userId: z.string().optional(),
  mode: z.string().optional(),
  tab: z.string().optional(),
  action: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersPage,
  // 2. Add the validation logic here
  validateSearch: (search) => userSearchSchema.parse(search),
  
  staticData: {
    title: "Users",
    requiresAuth: true,
    breadcrumbs: [
      {
        label: "Users",
        to: "/$tenantId/admin/users",
        permission: { action: "write", subject: "Users" },
      },
    ],
  },
});