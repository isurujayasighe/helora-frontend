import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "@tanstack/react-router";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  LockKeyhole, 
  Eye, 
  EyeOff, 
  Check 
} from "lucide-react";
import { cn } from "@/lib/utils"; // Ensure this import exists for conditional classes

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// --- Hooks ---
import { useValidateToken } from "../../api/useValidateActivationToken";
import { useResendActivation } from "../../api/useResendActivation";
import { useForgotPassword } from "../../api/useForgotPassword"; 
import { Route } from "@/routes/(auth)/activate-account";

// --- VALIDATION SCHEMA ---
const formSchema = z
  .object({
    newPassword: z.string().min(8, "Must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function ActivateAccountPage() {
  const { token, email } = Route.useSearch();
  const [showPassword, setShowPassword] = useState(false);

  const { 
    mutate: validateToken, 
    isPending: isValidating, 
    isError: isTokenInvalid 
  } = useValidateToken();

  const { 
    mutate: setPassword, 
    isPending: isSubmitting, 
    isSuccess: isChangeSuccess 
  } = useForgotPassword();

  const { mutate: resendLink, isPending: isResending } = useResendActivation();

  useEffect(() => {
    if (token && email) {
      validateToken({ token, email });
    }
  }, [token, email, validateToken]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Watch password for live validation UI
  const passwordValue = form.watch("newPassword");

  const requirements = [
    { label: "8+ characters", met: passwordValue.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(passwordValue) },
    { label: "Lowercase letter", met: /[a-z]/.test(passwordValue) },
    { label: "A number", met: /[0-9]/.test(passwordValue) },
    { label: "Special character", met: /[^A-Za-z0-9]/.test(passwordValue) },
  ];

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!email || !token) return;
    setPassword({
      email: email,
      token: token,
      newPassword: values.newPassword,
    });
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  if (isValidating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Verifying security token...</p>
      </div>
    );
  }

  if (isTokenInvalid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md shadow-lg border-destructive/20">
          <CardHeader className="text-center bg-destructive/5 pt-8">
            <div className="mx-auto bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive font-bold">Link Expired</CardTitle>
            <CardDescription>This invitation link is invalid or has expired.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button className="w-full" onClick={() => resendLink({email:email,url:window.location.origin })} disabled={isResending}>
              {isResending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Resend Activation Link
            </Button>
            <div className="mt-4 text-center">
               <Link to="/login" className="text-sm text-muted-foreground hover:underline">Return to Login</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isChangeSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4 animate-in zoom-in-95">
        <Card className="w-full max-w-md shadow-xl border-emerald-100">
          <CardHeader className="text-center">
            <div className="mx-auto bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <CardTitle className="text-xl">Account Activated!</CardTitle>
            <CardDescription>Your password has been set successfully. You can now login.</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pb-8 pt-2">
            <Button asChild className="w-full h-11 text-base">
              <Link to="/login">Go to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4 animate-in slide-in-from-bottom-4">
      <Card className="w-full max-w-md shadow-xl border-primary/10">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <LockKeyhole className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold">Set Your Password</CardTitle>
          <CardDescription>
            Create a secure password for <br />
            <span className="font-medium text-foreground bg-muted px-2 py-0.5 rounded text-xs">
              {email}
            </span>
          </CardDescription>

          <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-4 p-3 bg-muted/30 rounded-lg border border-border/50">
                      {requirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-2">
                          {req.met ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3px]" />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 ml-1" />
                          )}
                          <span className={cn(
                            "text-[11px] transition-colors duration-200",
                            req.met ? "text-emerald-700 font-bold" : "text-muted-foreground"
                          )}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                         
                          className="pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                      </div>
                    </FormControl>

                    {/* LIVE VALIDATION UI */}
                    
                    
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password"{...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 font-semibold mt-2 shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Setting Password...
                  </>
                ) : (
                  "Set Password & Activate"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}