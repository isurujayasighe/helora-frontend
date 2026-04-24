import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "@tanstack/react-router";
import { Loader2, Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";

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
import { useForgotPassword } from "../../api/useForgotPassword"; // The hook you created for "Complete Reset"
import { Route } from "@/routes/(auth)/reset-password";


const resetPasswordSchema = z
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

export function ResetPasswordPage() {
  // Get query params from URL (e.g. ?token=xyz&email=abc)
  const { token, email } = Route.useSearch();
  const [showPassword, setShowPassword] = useState(false);

  // Hook for final submission
  const { mutate: resetPassword, isPending, isSuccess } = useForgotPassword();

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof resetPasswordSchema>) => {
    if (!token || !email) {
      console.error("Missing token or email");
      return;
    }

    resetPassword({
      email: email,
      token: token,
      newPassword: values.newPassword,
    });
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Link</CardTitle>
            <CardDescription>
              This password reset link is missing required information. Please request a new link.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/forgot-password">Request New Link</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md shadow-xl border-emerald-100 animate-in zoom-in-95">
          <CardHeader className="text-center">
            <div className="mx-auto bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <CardTitle>Password Reset Complete</CardTitle>
            <CardDescription>
              Your password has been successfully updated. You can now log in with your new credentials.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/login">Go to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
             <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="h-5 w-5 text-primary" />
             </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Set new password</CardTitle>
          <CardDescription className="text-center">
            Must be at least 8 characters.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4 bg-muted/5">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Back to log in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}