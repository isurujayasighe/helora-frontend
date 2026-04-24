import { useNavigate, useRouter } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GeneralErrorProps {
  error?: Error;
  reset?: () => void;
}

export function GeneralError({ error, reset }: GeneralErrorProps) {
  const router = useRouter();
  const navigate = useNavigate();

  // Handle retry logic
  const handleRetry = () => {
    if (reset) {
      reset(); // Reset the specific boundary
    } else {
      router.invalidate(); // Reload data for the current route
    }
  };

  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-6 px-4 text-center">
      {/* Icon Circle */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 border border-red-100">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground">
          We encountered an unexpected error. Our team has been notified.
        </p>
        
        {/* Only show technical details in Development */}
        {import.meta.env.DEV && error && (
          <div className="mt-4 rounded-md bg-muted/50 p-4 text-left font-mono text-xs text-red-600 overflow-auto max-h-40 border border-red-100">
            {error.message}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
        <Button onClick={handleRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Button variant="ghost" onClick={() => navigate({ to: "/" })}>
          <Home className="h-4 w-4 mr-2" />
          Go Home
        </Button>
      </div>
    </div>
  );
}