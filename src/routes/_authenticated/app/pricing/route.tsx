import PricingPage from "@/modules/app/pricing";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/pricing")({
  component: PricingPage,
  staticData: {
    title: "Pricing Setup",
    requiresAuth: true,
    breadcrumbs: [
      {
        label: "Pricing Setup",
        to: "/app/pricing",
        permission: { action: "read", subject: "settings" },
      },
    ],
  },
});
