// src/schema/userForm.ts
import { z } from "zod";

export const editUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  roleId: z.string().min(1, "Please select a role"),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;