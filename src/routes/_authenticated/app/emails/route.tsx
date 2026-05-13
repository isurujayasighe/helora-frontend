import EmailsPage from "@/modules/app/emails";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/emails")({
  component: EmailsPage,
  staticData: {
    title: "Email Messages",
    requiresAuth: true,
    breadcrumbs: [
      {
        label: "Email Messages",
        to: "/app/emails",
        permission: { action: "read", subject: "emails" },
      },
    ],
  },
});

