import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "@tanstack/react-router";
import { Mail, ArrowLeft, Loader2, KeyRound } from "lucide-react";

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

import { useResendActivation } from "../../api/useResendActivation";

// Schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export function ForgotPasswordPage() {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { mutate: requestReset, isPending } = useResendActivation();

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

 const onSubmit = (values: z.infer<typeof forgotPasswordSchema>) => {
  // Pass an object containing both the email and the dynamic URL
  requestReset({ 
    email: values.email, 
    // This dynamically gets "https://hutchinsons.covalent-cloud.co.uk" or "localhost:3000"
    url: window.location.origin 
  }, {
    onSuccess: () => setIsEmailSent(true),
  });
};

  /* ----------------------------------------------------------------
   * STATE: EMAIL SENT SUCCESS
   * ---------------------------------------------------------------- */
  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md shadow-lg border-primary/10 animate-in fade-in zoom-in-95">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Check your inbox</CardTitle>
            <CardDescription className="pt-2">
              We've sent a password reset link to <br />
              <span className="font-medium text-foreground">
                {form.getValues("email")}
              </span>
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-2 pt-6">
            <Button variant="outline" asChild className="w-full">
              <Link to="/login">Back to Login</Link>
            </Button>
            <Button 
              variant="link" 
              className="text-xs text-muted-foreground"
              onClick={() => setIsEmailSent(false)}
            >
              Did not receive the email? Try again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  /* ----------------------------------------------------------------
   * STATE: INPUT FORM
   * ---------------------------------------------------------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
             <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <KeyRound className="h-5 w-5 text-primary" />
             </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Forgot password?</CardTitle>
          <CardDescription className="text-center">
            No worries, we'll send you reset instructions.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t p-4 bg-muted/5">
          <Link 
            to="/login" 
            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to log in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}