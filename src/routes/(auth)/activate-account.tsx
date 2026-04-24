import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ActivateAccountPage } from "@/modules/login/pages/activate-account/activateAccountPage";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";

// 1. Schema
const activateSearchSchema = z.object({
  token: z.string().min(1, "Token is required"),
  email: z.string().email("Invalid email format"),
});

// 2. Route Definition with Error Handling
export const Route = createFileRoute("/(auth)/activate-account")({
  validateSearch: (search) => activateSearchSchema.parse(search),
  
  component: ActivateAccountPage,

  // 👇 ADD THIS: Error Component catches the validation failure
  errorComponent: () => {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4 text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <XCircle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Invalid Activation Link</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          The link you clicked is missing required information (token or email). 
          It may have expired or was copied incorrectly.
        </p>
        <Button asChild>
          <Link to="/login">Return to Login</Link>
        </Button>
      </div>
    );
  },
});