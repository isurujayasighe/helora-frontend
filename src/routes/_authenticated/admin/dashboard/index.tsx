
import Dashboard from '@/modules/admin/dashboard/dashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/dashboard/')({
  component: Dashboard,
  staticData: {
    title: 'Dashboard',
    requiresAuth: true,
    breadcrumbs: [
      {
        label: 'Admin Dashboard',
        to: '/$tenantId/admin/dashboard',
        permission: { action: 'read', subject: 'Dashboard' },
      },
    ],
  },
})

