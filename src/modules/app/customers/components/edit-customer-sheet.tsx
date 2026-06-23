"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Loader2, Phone, Save, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/errors/api-error-response";

import { useGetCustomerById } from "../api/useGetCustomerbyId";
import { useUpdateCustomer } from "../api/useUpdateCustomer";

const editCustomerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Customer name is required")
    .max(200, "Customer name must be 200 characters or less"),
  phoneNumber: z.string().max(30, "Phone number must be 30 characters or less"),
  alternatePhone: z
    .string()
    .max(30, "Alternative phone must be 30 characters or less"),
  town: z.string().max(100, "Town must be 100 characters or less"),
  address: z.string().max(500, "Address must be 500 characters or less"),
  notes: z.string().max(1000, "Notes must be 1000 characters or less"),
});

type EditCustomerValues = z.infer<typeof editCustomerSchema>;

const emptyValues: EditCustomerValues = {
  fullName: "",
  phoneNumber: "",
  alternatePhone: "",
  town: "",
  address: "",
  notes: "",
};

type EditCustomerSheetProps = {
  customerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void | Promise<void>;
};

export function EditCustomerSheet({
  customerId,
  open,
  onOpenChange,
  onUpdated,
}: EditCustomerSheetProps) {
  const {
    data: customer,
    isLoading,
    isError,
  } = useGetCustomerById(customerId, open);
  const updateCustomer = useUpdateCustomer();

  const form = useForm<EditCustomerValues>({
    resolver: zodResolver(editCustomerSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (!open) {
      form.reset(emptyValues);
      return;
    }

    if (customer) {
      form.reset({
        fullName: customer.fullName ?? "",
        phoneNumber: customer.phoneNumber ?? "",
        alternatePhone: customer.alternatePhone ?? "",
        town: customer.town ?? "",
        address: customer.address ?? "",
        notes: customer.notes ?? "",
      });
    }
  }, [customer, form, open]);

  const handleSubmit = async (values: EditCustomerValues) => {
    if (!customerId) return;

    try {
      await updateCustomer.mutateAsync({
        customerId,
        payload: {
          fullName: values.fullName.trim(),
          phoneNumber: values.phoneNumber.trim(),
          alternatePhone: values.alternatePhone.trim(),
          town: values.town.trim(),
          address: values.address.trim(),
          notes: values.notes.trim(),
        },
      });

      toast.success("Customer updated successfully");
      await onUpdated?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update customer."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserRound className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg">Edit Customer</DialogTitle>
              <DialogDescription className="mt-1">
                Update identity, contact information, address, and internal
                notes. Block assignments are managed separately.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Loading customer details...
          </div>
        ) : isError || !customer ? (
          <div className="min-h-80 p-4">
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              Customer details could not be loaded. Please try again.
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form
              id="edit-customer-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4"
            >
              <CustomerEditSection
                icon={UserRound}
                title="Customer Identity"
                description="The name used across orders, blocks, and measurements."
              >
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Customer name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CustomerEditSection>

              <CustomerEditSection
                icon={Phone}
                title="Contact Details"
                description="Keep phone numbers and location information current."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alternatePhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alternative Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Alternative phone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="town"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Town</FormLabel>
                        <FormControl>
                          <Input placeholder="Town" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CustomerEditSection>

              <CustomerEditSection
                icon={FileText}
                title="Address & Notes"
                description="Store delivery information and useful internal context."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Customer address"
                            className="min-h-28 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Customer notes"
                            className="min-h-28 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CustomerEditSection>
            </form>
          </Form>
        )}

        <DialogFooter className="border-t px-5 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateCustomer.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-customer-form"
            disabled={isLoading || !customer || updateCustomer.isPending}
          >
            {updateCustomer.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CustomerEditSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border p-4">
      <div className="mb-4 flex items-center gap-3 border-b pb-3">
        <div className="flex size-8 items-center justify-center rounded-md bg-muted">
          <Icon className="size-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
