import "@tanstack/react-router";

declare module "@tanstack/react-router" {
  interface RouteMeta {
    breadcrumbs?: {
      label: string;
      to?: string;
      permission?: {
        action: string;
        subject: string;
      };
    }[];
    actions?: React.ReactNode;
  }
}
