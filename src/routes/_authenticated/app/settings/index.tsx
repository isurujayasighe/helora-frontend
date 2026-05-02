import SettingsPage from '@/modules/app/settings'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/app/settings/',
)({
  component: SettingsPage,
  staticData: {
    title: 'Settings',
    requiresAuth: true,
    breadcrumbs: [
      {
        label: 'Settings',
        to: '/$tenantId/app/settings',
        permission: { action: 'write', subject: 'Settings' },
      },
    ],
  },
})
