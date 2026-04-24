// src/rbac/SuperAdminGate.tsx
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useCan } from "@/auth/rbac/useCan";
import type { Actions, Subjects } from "./rbac.types";

interface PermissionGateProps {
  action: Actions;
  subject: Subjects;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminGate({ action, subject, children }: PermissionGateProps) {
   const allowed = useCan(action, subject);
  const navigate = useNavigate();

  if (!allowed) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center px-6">
        <div className="max-w-lg w-full text-center space-y-6">
          {/* Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <ShieldAlert className="h-7 w-7 text-muted-foreground" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold tracking-tight">
            This section is for administrators
          </h1>

          {/* Explanation */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            You’re signed in successfully, but your account doesn’t include
            access to admin-level settings like user management or platform
            configuration.
          </p>

          <p className="text-sm text-muted-foreground">
            You can continue working in the portal using the features available
            to your role.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Button
              variant="default"
              onClick={() => navigate({ to: "/login" })}
            >
              Go to my workspace
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                (window.location.href = "mailto:admin@yourcompany.com")
              }
            >
              Request admin access
            </Button>
          </div>

          {/* Soft footer hint */}
          <p className="text-xs text-muted-foreground pt-4">
            If you believe this access should be available to you, please
            contact your organization's administrator.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
