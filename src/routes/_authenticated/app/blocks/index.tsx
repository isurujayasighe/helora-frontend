import BlocksPage from '@/modules/app/blocks'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const blocksSearchSchema = z.object({
  viewBlockId: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/app/blocks/')({
  validateSearch: (search) => blocksSearchSchema.parse(search),
  component: RouteComponent,
})

function RouteComponent() {
  return <BlocksPage />
}
