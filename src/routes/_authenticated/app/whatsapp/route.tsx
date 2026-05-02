import WhatsAppPage from '@/modules/app/whatsapp'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/app/whatsapp')({
  component: WhatsAppPage,
  staticData: {
    title: 'WhatsApp Integration',
    requiresAuth: true,
    breadcrumbs: [
      {
        label: 'WhatsApp Integration',
        to: '/$tenantId/admin/tenant-accounts',
        permission: { action: 'read', subject: 'Dashboard' },
      },
    ],
  },
})