import { ResetPasswordPage } from '@/modules/login/pages/reset-password'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

// Define the schema for your URL search parameters (?token=...&email=...)
const resetPasswordSearchSchema = z.object({
  token: z.string().optional().catch(''),
  email: z.string().optional().catch(''),
})

export const Route = createFileRoute('/(auth)/reset-password')({
  // Add this validation logic
  validateSearch: (search) => resetPasswordSearchSchema.parse(search),
  component: ResetPasswordPage, // You can pass the component directly
})