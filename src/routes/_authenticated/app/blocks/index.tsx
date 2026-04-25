import BlocksPage from '@/modules/app/blocks'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/app/blocks/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <BlocksPage />
}
