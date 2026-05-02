import  AccessControlPage from '@/modules/app/roles'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/app/role-permission/',
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

