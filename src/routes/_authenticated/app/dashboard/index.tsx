import Dashboard from '@/modules/app/dashboard/dashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/app/dashboard/'
)({
  component: Dashboard,

  staticData: {
    title: 'Dashboard',
    requiresAuth: true,
    breadcrumbs: [
      {
        label: 'Dashboard',
        to: '/$tenantId/dashboard',
        permission: { action: 'read', subject: 'Dashboard' },
      },
    ],
  },

})
