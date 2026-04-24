import { z } from "zod";

export const createUserSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.string().min(1, "Please select a role"),
  sendInvite: z.boolean().default(true), // Checkbox to send email immediately
});

export type CreateUserForm = z.infer<typeof createUserSchema>;