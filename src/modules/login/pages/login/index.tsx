import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/password-input";

import { useAuthLogin } from "../../api";
import { useAuthStore } from "@/auth/store/authStore";

const formSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false).optional(),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const { mutateAsync: login, isSuccess } = useAuthLogin();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

useEffect(() => {
  if (isSuccess && user) {
    navigate({
      to: "/app/dashboard",
      replace: true,
    });
  }
}, [isSuccess, user, navigate]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await login({
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      console.error("Login failed", error);
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f6ff]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),transparent_45%)]" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-tl-[999px] bg-white/30" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-117.5 rounded-lg border border-slate-200/80 bg-white/95 p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              Welcome Back
            </h2>
            <p className="mt-1 text-sm text-slate-600 sm:text-sm">
              Please enter your credentials to access the floor.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-slate-800">
                      Email Address
                    </FormLabel>
                    <FormControl>
                     <Input
                          {...field}
                          placeholder="name@tailorflow.com"
                          className={`text-sm ${
                            form.formState.errors.email
                              ? "border-red-500"
                              : "border-slate-300"
                          }`}
                        />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium text-slate-800">
                        Password
                      </FormLabel>

                      <Button
                        variant="link"
                        className="h-auto p-0 text-xs font-medium text-blue-700"
                        type="button"
                        onClick={() => navigate({ to: "/forgot-password" })}
                      >
                        Forgot Password?
                      </Button>
                    </div>

                    <FormControl>
                      <PasswordInput
                          {...field}
                          className={`text-sm ${
                            form.formState.errors.password
                              ? "border-red-500"
                              : "border-slate-300"
                          }`}
                        />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2.5 space-y-0 pt-1">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-slate-300"
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer text-sm font-normal text-slate-700">
                      Stay signed in on this station
                    </FormLabel>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading || !form.formState.isValid}
                className="h-12 w-full rounded-xl bg-blue-700 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loging In...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Login In
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <span className="bg-white px-3">Enterprise Auth</span>
                </div>
              </div>
            </form>
          </Form>
        </div>

        <div className="mt-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
            <button className="transition-colors hover:text-slate-800">
              Help Center
            </button>
            <span className="text-slate-300">•</span>
            <button className="transition-colors hover:text-slate-800">
              IT Support
            </button>
            <span className="text-slate-300">•</span>
            <button className="transition-colors hover:text-slate-800">
              Privacy Policy
            </button>
          </div>

          
        </div>
      </div>
    </div>
  );
}