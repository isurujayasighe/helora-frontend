import CategoryPage from '@/modules/app/categories'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/app/category')({
  component: CategoryPage,
  staticData: {
    title: 'Category',
    requiresAuth: true,
    breadcrumbs: [
      {
        label: 'Category',
        to: '/$tenantId/admin/tenant-accounts',
        permission: { action: 'read', subject: 'Dashboard' },
      },
    ],
  },
})