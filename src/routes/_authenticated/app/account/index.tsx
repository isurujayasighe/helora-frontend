
import AccountPage from '@/modules/app/account'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/app/account/')({
  component: AccountPage,
  staticData: {
    title: 'My Account',
    requiresAuth: true,
    breadcrumbs: [
      {
        label: 'My Account',
        to: '/$user-id/account',
        permission: { action: 'read', subject: 'Account' },
      },
    ],
  },
})

