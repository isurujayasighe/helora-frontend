"use client";

import { z } from "zod";
import { Loader2, UserPlus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useCreateCustomer } from "../api/useCreateCustomer";

const createCustomerSchema = z.object({
  fullName: z.string().min(1, "Customer name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  alternatePhone: z.string().optional(),
  town: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type CreateCustomerFormValues = z.infer<typeof createCustomerSchema>;

type CreateCustomerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (customerId: string) => void;
};

const defaultValues: CreateCustomerFormValues = {
  fullName: "",
  phoneNumber: "",
  alternatePhone: "",
  town: "",
  address: "",
  notes: "",
};

export function CreateCustomerDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateCustomerDialogProps) {
  const createCustomerMutation = useCreateCustomer();

  const form = useForm<CreateCustomerFormValues>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues,
  });

  const { control, handleSubmit, reset } = form;

  const handleClose = () => {
    reset(defaultValues);
    onOpenChange(false);
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      handleClose();
      return;
    }

    onOpenChange(true);
  };

  const onSubmit = async (values: CreateCustomerFormValues) => {
    const result = await createCustomerMutation.mutateAsync({
      fullName: values.fullName.trim(),
      phoneNumber: values.phoneNumber.trim(),
      alternatePhone: values.alternatePhone?.trim() || undefined,
      town: values.town?.trim() || undefined,
      address: values.address?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    });

    onCreated?.(result.data.id);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-h-[92vh] sm:max-w-3xl overflow-hidden p-0 gap-0">
        <DialogHeader className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <UserPlus className="h-4 w-4" />
                </span>
                Create Customer
              </DialogTitle>
              <p className="mt-1 text-sm text-slate-500">
                Add a new customer profile to use for orders and block
                assignments.
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(92vh-82px)] overflow-y-auto bg-slate-50/60">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5">
              <section className="rounded-xl border border-slate-200 bg-white">
                <SectionHeader
                  title="Customer Information"
                  description="Basic details used to identify and contact the customer."
                />

                <div className="grid gap-4 p-4 md:grid-cols-2">
                  <FormField
                    control={control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Dinesha Shamali" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="0718370292" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="alternatePhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alternative Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="0771234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="town"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Town</FormLabel>
                        <FormControl>
                          <Input placeholder="Pasgoda" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="No 12, Main Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white">
                <SectionHeader
                  title="Notes"
                  description="Optional internal note about this customer."
                />

                <div className="p-4">
                  <FormField
                    control={control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="VIP customer"
                            className="min-h-28 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={createCustomerMutation.isPending}
                >
                  {createCustomerMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Customer
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-slate-100 px-4 py-3">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-0.5 text-xs text-slate-500">{description}</p>
    </div>
  );
}