
import OrderPage from "@/modules/app/orders";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/orders/")({
  component: OrderPage,
  staticData: {
     title: 'My Orders',
     requiresAuth: true,
     breadcrumbs: [
       {
         label: 'My Orders',
         to: '/$user-id/orders',
         permission: { action: 'read', subject: 'Orders' },
       },
     ],
   },
});
