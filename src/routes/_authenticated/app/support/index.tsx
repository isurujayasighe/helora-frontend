import { SupportPage } from '@/modules/app/support'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/app/support/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SupportPage/>
}
