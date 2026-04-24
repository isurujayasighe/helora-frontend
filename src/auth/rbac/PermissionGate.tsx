import { useCan } from "@/auth/rbac/useCan"; // Use the hook
import type { Actions, Subjects } from "@/auth/rbac/rbac.types";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

//  DELETE THIS LINE
// import { ability } from "../config/abacContext"; 

interface PermissionGateProps {
  action: Actions;
  subject: Subjects; // Use specific type instead of string
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  action,
  subject,
  children,
  fallback,
}: PermissionGateProps) {
  
  // FIX: Use the hook to check the Context
  const allowed = useCan(action, subject);
  
  const navigate = useNavigate();

  // Debugging
  console.log(`Checking: ${action} -> ${subject} = ${allowed}`);

  if (!allowed) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-[80vh] w-full flex items-center justify-center p-6 animate-in fade-in duration-500">
        <Card className="max-w-120 w-full shadow-2xl border-muted/40 bg-card overflow-hidden relative">
          
          <div className="h-2 w-full bg-linear-to-r from-red-500 via-orange-500 to-red-500" />

          <div className="p-8 flex flex-col items-center text-center">
            
            <div className="mb-6 relative">
              <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center">
                <ShieldX className="h-10 w-10 text-red-600" />
              </div>
            </div>

            <h1 className="text-xl font-bold text-foreground mb-3 tracking-tight">
              Access Restricted
            </h1>
            
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              You do not have the required permissions 
              <span className="mx-1 px-1.5 py-0.5 rounded bg-muted text-xs font-mono text-foreground font-medium">
                {action}:{subject}
              </span>
            </p>

            <div className="w-full flex flex-col gap-3">
              <Button 
                variant="default" 
                className="w-full h-11"
                onClick={() => navigate({ to: "/" })}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Button>
            </div>
            
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}