import  AccessControlPage from '@/modules/admin/roles'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/admin/role-permissions/',
)({
  component: AccessControlPage,
  staticData: {
    title: 'Role & Permissions',
    requiresAuth: true,
    breadcrumbs: [
      {
        label: 'Role & Permissions',
        to: '/$tenantId/admin/tenant-accounts',
        permission: { action: 'read', subject: 'Dashboard' },
      },
    ],
  },
})

