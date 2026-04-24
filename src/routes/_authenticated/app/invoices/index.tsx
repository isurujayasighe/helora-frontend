
import InvoicePage from '@/modules/app/invoice'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/app/invoices/')({
  component: InvoicePage,
 
   staticData: {
     title: 'My Invoices',
     requiresAuth: true,
     breadcrumbs: [
       {
         label: 'My Invoices',
         to: '/$user-id/invoices',
         permission: { action: 'read', subject: 'Dashboard' },
       },
     ],
   },
 
})

