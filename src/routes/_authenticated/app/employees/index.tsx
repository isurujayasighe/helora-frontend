import EmployeePage from '@/modules/app/employees'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/app/employees/')({
  component: EmployeePage,
  staticData: {
    title: 'Employees',
    requiresAuth: true,
    breadcrumbs: [
      {
        label: 'Employees',
        to: '/$tenantId/admin/tenant-accounts',
        permission: { action: 'read', subject: 'Dashboard' },
      },
    ],
  },
})
