import CustomersPage from '@/modules/app/customers'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/app/customers/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CustomersPage />
}
