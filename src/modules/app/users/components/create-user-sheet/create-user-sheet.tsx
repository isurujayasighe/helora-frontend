import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UserPlus,
  Mail,
  Shield,
  Loader2,
  User,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useCreateUser } from "../../api/useCreateUser";
import { useGetRoles } from "@/api/useGetRoles";
import { showToastError } from "@/utils/show-toast-success";
import type { Role } from "@/modules/app/roles/types/role.types";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateUserDialog({ open, onClose }: Props) {
  const { data: rolesResponse, isLoading: isLoadingRoles } = useGetRoles();
  const roles = rolesResponse?.items ?? [];
  const { mutateAsync: createUser, isPending } = useCreateUser();

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      role: "",
      sendInvite: true,
    },

    onSubmit: async ({ value }) => {
      try {
        const [firstName, ...lastNameParts] = value.fullName.trim().split(/\s+/);

        await createUser({
          firstName,
          lastName: lastNameParts.join(" ") || undefined,
          email: value.email,
          roleId: value.role,
          status: "INVITED",
          isActiveAccess: true,
        });

        onClose();
      } catch (error) {
        console.error("Submission failed", error);
        showToastError(
          "Could not add staff member",
          "Please check the details and try again."
        );
      }
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isPending) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-lg p-0 sm:max-w-2xl gap-0">
        {/* Header */}
        <DialogHeader className="border-b bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <UserPlus className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-xl font-black tracking-tight text-slate-950">
                Add New Staff Member
              </DialogTitle>

              <DialogDescription className="mt-1 text-sm font-medium text-slate-500">
                Add someone who can use Helora ERP in your shop.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="max-h-[calc(92vh-150px)] overflow-y-auto bg-slate-50 p-5">
          <div className="space-y-4">
            {/* Staff details */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <User className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-950">
                    Staff Details
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Enter the person’s name and email address.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <form.Field
                  name="fullName"
                  children={(field) => (
                    <div className="grid gap-2">
                      <Label
                        htmlFor="fullName"
                        className="font-bold text-slate-700"
                      >
                        Staff name <span className="text-red-500">*</span>
                      </Label>

                      <Input
                        id="fullName"
                        placeholder="Example: Nimal Perera"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        className={cn(
                          "h-12 rounded-2xl bg-slate-50 text-base font-semibold shadow-none",
                          field.state.meta.errors.length &&
                            "border-red-500 focus-visible:ring-red-500"
                        )}
                      />

                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm font-semibold text-red-600">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                />

                <form.Field
                  name="email"
                  children={(field) => (
                    <div className="grid gap-2">
                      <Label
                        htmlFor="email"
                        className="font-bold text-slate-700"
                      >
                        Email address <span className="text-red-500">*</span>
                      </Label>

                      <div className="relative">
                        <Mail className="absolute left-4 top-4 h-4 w-4 text-slate-400" />

                        <Input
                          id="email"
                          type="email"
                          placeholder="Example: staff@shop.com"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          className={cn(
                            "h-12 rounded-2xl bg-slate-50 pl-10 text-base font-semibold shadow-none",
                            field.state.meta.errors.length &&
                              "border-red-500 focus-visible:ring-red-500"
                          )}
                        />
                      </div>

                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm font-semibold text-red-600">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </section>

            {/* Access */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Shield className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-950">
                    What can this person do?
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Select the correct access type for their work.
                  </p>
                </div>
              </div>

              {isLoadingRoles ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                </div>
              ) : roles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                  <AlertCircle className="mx-auto h-6 w-6 text-slate-400" />
                  <p className="mt-2 font-black text-slate-800">
                    No access types found
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Please add roles from settings before inviting staff.
                  </p>
                </div>
              ) : (
                <form.Field
                  name="role"
                  children={(field) => (
                    <div className="space-y-3">
                      <RadioGroup
                        value={field.state.value}
                        onValueChange={field.handleChange}
                        className="grid gap-3"
                      >
                        {roles.map((role: Role) => {
                          const isSelected = field.state.value === role.id;

                          return (
                            <Label
                              key={role.id}
                              htmlFor={role.id}
                              className={cn(
                                "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all",
                                "hover:border-slate-300 hover:bg-slate-50",
                                isSelected
                                  ? "border-slate-900 bg-slate-50 ring-2 ring-slate-900/10"
                                  : "border-slate-200 bg-white"
                              )}
                            >
                              <RadioGroupItem
                                value={role.id}
                                id={role.id}
                                className="mt-1"
                              />

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-black text-slate-950">
                                    {getFriendlyRoleName(role.name)}
                                  </p>

                                  {isSelected && (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                  )}
                                </div>

                                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                                  {getFriendlyRoleDescription(
                                    role.name,
                                    role.description ?? undefined
                                  )}
                                </p>
                              </div>
                            </Label>
                          );
                        })}
                      </RadioGroup>

                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm font-semibold text-red-600">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                />
              )}
            </section>

            {/* Invite option */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <form.Field
                name="sendInvite"
                children={(field) => (
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="sendInvite"
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.handleChange(Boolean(checked))
                      }
                      className="mt-1"
                    />

                    <div className="grid gap-1">
                      <Label
                        htmlFor="sendInvite"
                        className="cursor-pointer text-sm font-black text-slate-900"
                      >
                        Send invite email now
                      </Label>

                      <p className="text-xs font-semibold leading-5 text-slate-500">
                        This person will receive an email with instructions to
                        start using Helora ERP.
                      </p>
                    </div>
                  </div>
                )}
              />
            </section>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t bg-white px-5 py-4">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
              type="button"
              className="h-11 font-bold"
            >
              Cancel
            </Button>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit]) => (
                <Button
                  type="button"
                  onClick={form.handleSubmit}
                  disabled={!canSubmit || isPending}
                  className="h-11 min-w-36 font-bold"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Add Staff
                    </>
                  )}
                </Button>
              )}
            />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getFriendlyRoleName(roleName?: string) {
  const value = String(roleName || "").toLowerCase();

  if (value.includes("owner")) return "Shop Owner";
  if (value.includes("admin")) return "Admin";
  if (value.includes("manager")) return "Manager";
  if (value.includes("tailor")) return "Tailor";
  if (value.includes("cashier")) return "Cashier";
  if (value.includes("staff")) return "Staff Member";

  return roleName || "Staff Member";
}

function getFriendlyRoleDescription(roleName?: string, description?: string) {
  const value = String(roleName || "").toLowerCase();

  if (description) return description;

  if (value.includes("owner")) {
    return "Can manage everything in the shop system.";
  }

  if (value.includes("admin")) {
    return "Can manage users, settings, customers, orders, and reports.";
  }

  if (value.includes("manager")) {
    return "Can manage customers, orders, measurements, and daily work.";
  }

  if (value.includes("tailor")) {
    return "Can view assigned orders, measurements, and tailoring details.";
  }

  if (value.includes("cashier")) {
    return "Can handle customer payments, orders, and basic customer details.";
  }

  if (value.includes("staff")) {
    return "Can use basic Helora ERP features needed for daily work.";
  }

  return "Choose this if it matches the person’s work in the shop.";
}
