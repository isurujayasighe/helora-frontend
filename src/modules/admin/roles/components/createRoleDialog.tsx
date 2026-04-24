import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Plus, Loader2, Shield } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { useCreateRole } from "../api/useCreateRole";
import { useCan } from "@/auth/rbac/useCan";

// --- Schema ---
const createRoleSchema = z.object({
  roleName: z.string().min(1, "Required").max(5, "Max 5 chars"),
  description: z.string().optional(),
});

export function CreateRoleDialog() {
  const [open, setOpen] = useState(false);
  const { mutateAsync } = useCreateRole();

  const canCreate = useCan("create", "TenantRolePermission");

  const form = useForm({
    defaultValues: {
      roleName: "",
      description: "",
    },
    // 1. Move the adapter into the logic by specifying it here

    onSubmit: async ({ value }) => {
      try {
        await mutateAsync(value);
        setOpen(false);
        form.reset();
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="font-semibold h-8"
          title={
            canCreate
              ? "Create a new tenant account"
              : "You do not have permission to create a tenant account"
          }
          disabled={!canCreate}
        >
          <Plus className="mr-2 h-3.5 w-3.5" />
          Create Role
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Define a new functional role. You can assign permissions to this
            role later in the Access Policy tab.
          </DialogDescription>
        </DialogHeader>

        {/* Form Container */}
        <div className="grid gap-4 py-4">
          {/* Name Field */}
          <form.Field
            name="roleName"
            // If using the form-level adapter, you just pass the schema property
            validators={{
              onChange: createRoleSchema.shape.roleName,
            }}
            children={(field) => (
              <div className="grid gap-2">
                <Label htmlFor="roleName">Role Name *</Label>
                <Input
                  id="roleName"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={cn(
                    field.state.meta.errors.length > 0 && "border-red-500",
                  )}
                />
                {/* Note: errors is an array, check length */}
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-500">
                    {field.state.meta.errors
                      .map((error: any) =>
                        // If it's an object, get .message; otherwise, use the error itself
                        typeof error === "object" ? error.message : error,
                      )
                      .join(", ")}
                  </p>
                )}
              </div>
            )}
          />

          {/* Description Field */}
          <form.Field
            name="description"
            children={(field) => (
              <div className="grid gap-2">
                <Label htmlFor="roleDesc" className="text-left">
                  Description
                </Label>
                <Textarea
                  id="roleDesc"
                  placeholder="Briefly describe what this role is for..."
                  className="resize-none min-h-20"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            type="button"
          >
            Cancel
          </Button>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                onClick={form.handleSubmit}
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Role
              </Button>
            )}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
