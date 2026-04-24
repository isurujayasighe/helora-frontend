import { Link } from "@tanstack/react-router";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 border border-border">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Page Not Found
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
      </div>

      <Button asChild>
        <Link to="/">Return Home</Link>
      </Button>
    </div>
  );
}