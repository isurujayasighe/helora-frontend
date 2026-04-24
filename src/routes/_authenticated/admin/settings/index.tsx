import SettingsPage from '@/modules/admin/settings'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/admin/settings/',
)({
  component: SettingsPage,
  staticData: {
    title: 'Settings',
    requiresAuth: true,
    breadcrumbs: [
      {
        label: 'Settings',
        to: '/$tenantId/admin/settings',
        permission: { action: 'write', subject: 'Settings' },
      },
    ],
  },
})
