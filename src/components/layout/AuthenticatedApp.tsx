import { useAuthStore } from "@/auth/store/authStore";
import { AbilityProvider } from "@/auth/rbac/AbilityProvider";
import { AuthenticatedLayout } from "./authenticated-layout";
import { Loader2 } from "lucide-react";

export function AuthenticatedApp() {
const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  // 2. Block rendering ONLY here while waiting for AuthProvider
  if (status === 'idle') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-muted/20">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <p className="text-sm text-muted-foreground">Verifying session...</p>
      </div>
    );
  }

  // 3. Double check (Redundant but safe)
  if (status === 'unauthenticated') {
     return null; // The beforeLoad guard usually handles this
  }

  return (
    <AbilityProvider permissions={user?.permissions}>
      <div className="layout-container">
          <AuthenticatedLayout/>
      </div>
    </AbilityProvider>
  );
}