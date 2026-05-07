"use client";

import { z } from "zod";
import { Loader2, PackagePlus, UserPlus, X } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useGetCategories } from "@/api/useGetCategories";

const createCustomerSchema = z
  .object({
    fullName: z.string().min(1, "Customer name is required"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    alternatePhone: z.string().optional(),
    town: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
    hasLegacyBlock: z.boolean().default(false),
    blockCategoryId: z.string().optional(),
    blockNumber: z.string().optional(),
    readyMadeSize: z.string().optional(),
    sizeLabel: z.string().optional(),
    fitNotes: z.string().optional(),
    blockDescription: z.string().optional(),
    blockRemarks: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (!values.hasLegacyBlock) return;

    if (!values.blockCategoryId?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["blockCategoryId"],
        message: "Block category is required",
      });
    }

    if (!values.blockNumber?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["blockNumber"],
        message: "Block number is required",
      });
    }
  });

type CreateCustomerFormInput = z.input<typeof createCustomerSchema>;
type CreateCustomerFormValues = z.output<typeof createCustomerSchema>;

type CreateCustomerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (customerId: string) => void;
};

const defaultValues: CreateCustomerFormInput = {
  fullName: "",
  phoneNumber: "",
  alternatePhone: "",
  town: "",
  address: "",
  notes: "",
  hasLegacyBlock: false,
  blockCategoryId: "",
  blockNumber: "",
  readyMadeSize: "",
  sizeLabel: "",
  fitNotes: "",
  blockDescription: "",
  blockRemarks: "",
};

export function CreateCustomerDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateCustomerDialogProps) {
  const createCustomerMutation = useCreateCustomer();
  const { data: categories = [], isLoading: isCategoriesLoading } =
    useGetCategories();

  const form = useForm<CreateCustomerFormInput, any, CreateCustomerFormValues>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues,
  });

  const { control, handleSubmit, reset, watch, setValue } = form;
  const hasLegacyBlock = watch("hasLegacyBlock");
  const activeCategories = categories.filter((category) => category.isActive);

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

  const onSubmit: SubmitHandler<CreateCustomerFormValues> = async (values) => {
    const result = await createCustomerMutation.mutateAsync({
      fullName: values.fullName.trim(),
      phoneNumber: values.phoneNumber.trim(),
      alternatePhone: values.alternatePhone?.trim() || undefined,
      town: values.town?.trim() || undefined,
      address: values.address?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
      legacyBlock: values.hasLegacyBlock
        ? {
            categoryId: values.blockCategoryId?.trim() ?? "",
            blockNumber: values.blockNumber?.trim() ?? "",
            readyMadeSize: values.readyMadeSize?.trim() || undefined,
            sizeLabel: values.sizeLabel?.trim() || undefined,
            fitNotes: values.fitNotes?.trim() || undefined,
            description: values.blockDescription?.trim() || undefined,
            remarks: values.blockRemarks?.trim() || undefined,
          }
        : undefined,
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
                  title="Legacy Block"
                  description="Optional block details from old records. When filled, the block is created and linked to this customer."
                />

                <div className="space-y-4 p-4">
                  <FormField
                    control={control}
                    name="hasLegacyBlock"
                    render={({ field }) => (
                      <FormItem className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              const enabled = checked === true;
                              field.onChange(enabled);

                              if (!enabled) {
                                setValue("blockCategoryId", "", {
                                  shouldDirty: true,
                                  shouldValidate: false,
                                });
                                setValue("blockNumber", "", {
                                  shouldDirty: true,
                                  shouldValidate: false,
                                });
                                setValue("readyMadeSize", "", {
                                  shouldDirty: true,
                                  shouldValidate: false,
                                });
                                setValue("sizeLabel", "", {
                                  shouldDirty: true,
                                  shouldValidate: false,
                                });
                                setValue("fitNotes", "", {
                                  shouldDirty: true,
                                  shouldValidate: false,
                                });
                                setValue("blockDescription", "", {
                                  shouldDirty: true,
                                  shouldValidate: false,
                                });
                                setValue("blockRemarks", "", {
                                  shouldDirty: true,
                                  shouldValidate: false,
                                });
                              }
                            }}
                            className="mt-1"
                          />
                        </FormControl>

                        <div className="min-w-0">
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <PackagePlus className="h-4 w-4 text-slate-500" />
                            Create block with customer
                          </FormLabel>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Use this for legacy entries where the customer and
                            their block number already exist in paper records.
                          </p>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  {hasLegacyBlock && (
                    <div className="grid gap-4 rounded-lg border border-blue-100 bg-blue-50/40 p-4 md:grid-cols-2">
                      <FormField
                        control={control}
                        name="blockCategoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Block Category</FormLabel>
                            <Select
                              value={field.value ?? ""}
                              disabled={isCategoriesLoading}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full bg-white">
                                  <SelectValue
                                    placeholder={
                                      isCategoriesLoading
                                        ? "Loading categories..."
                                        : "Select category"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>

                              <SelectContent>
                                {activeCategories.map((category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.id}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="blockNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Block No</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="36-B-12"
                                className="bg-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="readyMadeSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ready-made Size</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="M"
                                className="bg-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="sizeLabel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Size Label</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Medium"
                                className="bg-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="fitNotes"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Fit Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Loose fit around waist"
                                className="min-h-20 resize-none bg-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="blockRemarks"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Block Remarks</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Imported from old register"
                                className="min-h-20 resize-none bg-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
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
                  {hasLegacyBlock
                    ? "Create Customer & Block"
                    : "Create Customer"}
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
