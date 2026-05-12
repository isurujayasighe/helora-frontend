import PackageTemplatesPage from "@/modules/app/package-templates";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/package-templates")({
  component: PackageTemplatesPage,
  staticData: {
    title: "Garment Sets",
    requiresAuth: true,
    breadcrumbs: [
      {
        label: "Garment Sets",
        to: "/app/package-templates",
        permission: { action: "read", subject: "settings-categories" },
      },
    ],
  },
});
