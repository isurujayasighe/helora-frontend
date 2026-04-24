import { z } from "zod";

export const profileSchema = z.object({
  gender: z.enum(["male", "female"]),
  fullName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address is required"),
  phone: z.string().min(10, "Invalid phone number"),
  mobile: z.string().min(10, "Invalid phone number"),
  dob: z.string().min(1, "Date of birth is required"),
  location: z.string().min(1, "Location is required"),
  postalCode: z.string().min(3, "Invalid postal code"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;