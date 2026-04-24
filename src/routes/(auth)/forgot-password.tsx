
import { ForgotPasswordPage } from '@/modules/login/pages/forgot-password'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/forgot-password')({
  component: ForgotPasswordPage,
})


