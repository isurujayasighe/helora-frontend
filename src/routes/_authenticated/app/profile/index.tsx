import ProfilePage from '@/modules/app/profile'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/app/profile/')({
  staticData: {
     title: 'Profile',
     requiresAuth: true,
     breadcrumbs: [
       {
         label: 'Profile',
         to: '/tenantId/app/profile',
         permission: { action: 'read', subject: 'Orders' },
       },
     ],
   },
  component: ProfilePage,
})

