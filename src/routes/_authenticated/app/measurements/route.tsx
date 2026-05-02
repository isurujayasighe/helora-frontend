import MeasurementFieldsPage from '@/modules/app/measurements'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/app/measurements')({
  component: MeasurementFieldsPage,
  staticData: {
    title: 'Measurements',
    requiresAuth: true,
    breadcrumbs: [
      {
        label: 'Measurements',
        to: '/$tenantId/admin/tenant-accounts',
        permission: { action: 'read', subject: 'Dashboard' },
      },
    ],
  },
})