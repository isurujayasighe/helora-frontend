"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Loader2 } from "lucide-react";
import { useChangePassword } from "@/modules/login/api/useChangePassword";
// Import your new hooks and skeleton
import { useGetPersonProfile } from "@/api/useGetUserProfile";
import { Skeleton } from "@/components/ui/skeleton";

import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "./schema/changePasswordSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { profileSchema, type ProfileFormValues } from "./schema/schema";
import { AnimatePresence, motion } from "framer-motion";
import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { fadeUp } from "@/components/motions/MotionFade";
import { Card, CardContent } from "@/components/ui/card";
import { PasswordInput } from "@/components/password-input";

export default function ProfilePage() {
  const [activeSection, setActiveSection] = React.useState<
    "profile" | "password"
  >("profile");
  const toggleSection = (section: "profile" | "password") =>
    setActiveSection(section);

  // --- 1. Fetch Profile Data ---
  const { data: profile, isLoading } = useGetPersonProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    // Use values to reactive sync with API data
    values: React.useMemo(() => {
      // Helper updated to use "communications" (plural) array
      const getCommValue = (method: "EMAIL" | "PHONE" | "MOBILE") => {
        const found = profile?.communicationMethods?.find(
          (c) => c.method === method,
        );
        return found?.value || "Value not provided";
      };

      return {
        fullName: profile?.name || "",
        lastName: "",
        email: getCommValue("EMAIL"),
        phone: getCommValue("PHONE"),
        address: profile?.addresses?.[0]?.address01 || "",
        address02: profile?.addresses?.[0]?.address02 || "", // This will trigger the hide logic if empty
        state: profile?.addresses?.[0]?.state || "",
        location: profile?.addresses?.[0]?.city || "",
        country: profile?.addresses?.[0]?.country || "",
        postalCode: profile?.addresses?.[0]?.zipCode || "",
        gender: "male",
        mobile: getCommValue("MOBILE"), // Assuming you have a method for mobile or fallback to phone
        dob: "",
      };
    }, [profile]),
  });

  return (
    <PermissionGate action="read" subject="profile">
      <AnimatePresence mode="wait">
        <motion.div
          key="account"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.1, ease: "easeOut" }}
          // p-2 for mobile, lg:p-10 for large screens (1024px+)
          className="space-y-6 pb-10 p-2 lg:p-8 max-w-7xl mx-auto py-4 "
        >
          <div className="max-w-4xl mx-auto min-h-screen p-6 md:p-8">
            {/* Section Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Profile Information
              </h1>
            </div>

            {/* Custom Tabs (matching shadcn aesthetics) */}
            <div className="flex gap-4 mb-6 border-b border-slate-200">
              <button
                onClick={() => toggleSection("profile")}
                className={cn(
                  "pb-3 text-sm font-medium transition-all border-b-2 -mb-px",
                  activeSection === "profile"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                Profile Information
              </button>
              <button
                onClick={() => toggleSection("password")}
                className={cn(
                  "pb-3 text-sm font-medium transition-all border-b-2 -mb-px",
                  activeSection === "password"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                Security
              </button>
            </div>

            {/* Shadcn Card Layout */}
            <Card className="border border-slate-200">
              {/* <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">
                  {activeSection === "profile"
                    ? "Profile Details"
                    : "Security Settings"}
                </CardTitle>
                <CardDescription>
                  {activeSection === "profile"
                    ? "Update your personal information and public profile."
                    : "Change your password and manage your security sessions."}
                </CardDescription>
              </CardHeader> */}

              <CardContent className="space-y-6">
                {activeSection === "profile" ? (
                  isLoading ? (
                    <ProfileSkeleton />
                  ) : (
                    <ProfileContent form={form} />
                  )
                ) : (
                  <ChangePasswordContent />
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </AnimatePresence>
    </PermissionGate>
  );
}

/* ================= PROFILE CONTENT ================= */

function ProfileContent({ form }: { form: any }) {
  const inputClass = cn(
    "bg-slate-50 border-slate-200 cursor-not-allowed",
    "disabled:opacity-100 disabled:text-slate-900 ", // This forces the value color
  );
  const labelClass = "text-slate-900 font-   mb-1.5";

  // Watch address02 to determine visibility
  const address02Value = form.watch("address02");
  const hasAddress02 = address02Value && address02Value.trim() !== "";

  return (
    <div className="space-y-10">
      <Form {...form}>
        <form className="space-y-8">
          {/* Section 1: Identity */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-6 capitalize tracking-wider">
              Personal Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className={inputClass} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Email Address</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className={inputClass} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-6 capitalize tracking-wider">
              Communication Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => {
                  const isNotProvided = field.value === "Number not provided";

                  return (
                    <FormItem>
                      <FormLabel className={labelClass}>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          className={cn(
                            inputClass,
                            isNotProvided && "italic text-slate-400", // Visual cue for missing data
                          )}
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => {
                  const isNotProvided = field.value === "Number not provided";

                  return (
                    <FormItem>
                      <FormLabel className={labelClass}>
                        Mobile Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          className={cn(
                            inputClass,
                            isNotProvided && "italic text-slate-400", // Visual cue for missing data
                          )}
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>

          {/* Section 2: Full Address Mapping */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-6 capitalize tracking-wider">
              Registered Address
            </h3>

            {/* Main Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Address 01 - Spans full width if Address 02 is hidden */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className={cn(!hasAddress02 && "md:col-span-2")}>
                    <FormLabel className={labelClass}>
                      Address Line 01
                    </FormLabel>
                    <FormControl>
                      <Input {...field} disabled className={inputClass} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Address 02 - Hidden if empty */}
              {hasAddress02 && (
                <FormField
                  control={form.control}
                  name="address02"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>
                        Address Line 02
                      </FormLabel>
                      <FormControl>
                        <Input {...field} disabled className={inputClass} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {/* Sub-grid for City, State, County, and Zip - Spans full 2 columns of parent grid */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
                {/* City */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>City</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className={inputClass} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* State */}
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>State</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className={inputClass} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* County */}
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Country</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className={inputClass} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Zip Code */}
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Zip Code</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className={inputClass} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Note: Save button has been removed as per requirements */}
          <div className="flex items-center gap-2 px-1">
            <Info className="h-3 w-3 text-slate-400" />
            <p className="text-xs text-slate-400 italic">
              Profile changes are restricted for your account type. Contact
              support to request updates.
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}

/* ================= SKELETON LOADING ================= */

function ProfileSkeleton() {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <div className="md:col-span-2 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

/* ================= CHANGE PASSWORD CONTENT ================= */
// ... (Remains the same as your provided code)
/* ================= CHANGE PASSWORD CONTENT ================= */

function ChangePasswordContent() {
  const { mutate: changePassword, isPending } = useChangePassword();
  const inputClass =
    "bg-white border-slate-200 focus-visible:ring-2 focus-visible:ring-[#4F46E5]/20 focus-visible:border-[#4F46E5]";
  const labelClass = "text-slate-600 font-medium mb-1.5";

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: ChangePasswordFormValues) {
    changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  }

  return (
    <div className="max-w-4xl">
      <h3 className="text-sm font-bold text-slate-900 mb-6">Change Password</h3>
      <Form {...passwordForm}>
        <form
          onSubmit={passwordForm.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <FormField
            control={passwordForm.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Current Password</FormLabel>
                <FormControl>
                 <PasswordInput
                        {...field}
                        className={inputClass}
                      />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>New Password</FormLabel>
                  <FormControl>
                     <PasswordInput
                        {...field}
                        className={inputClass}
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Confirm Password</FormLabel>
                  <FormControl>
                     <PasswordInput
                        {...field}
                        className={inputClass}
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-8 h-10 rounded-md font-medium"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
