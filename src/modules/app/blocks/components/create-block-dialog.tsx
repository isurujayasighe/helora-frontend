// src/modules/app/blocks/components/create-block-dialog.tsx

"use client";

import * as React from "react";
import { z } from "zod";
import {
  BadgeCheck,
  CheckCircle2,
  Loader2,
  PackagePlus,
  Plus,
  Ruler,
  Save,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/lib/utils";
import { useGetCategories } from "@/api/useGetCategories";
import { useGetLatestMeasurement } from "@/api/useGetLatestMeasurement";
import {
  useCreateBlock,
  type CreateBlockPayload,
} from "@/modules/app/blocks/api/useCreateBlock";
import { CustomerPhoneLookupField } from "@/components/layout/components/customer-phone-lookup-field";
import type { CustomerLookupItem } from "@/api/useGetCustomerLookup";

/* ------------------------------------------------------------------ */
/* Validation                                                         */
/* ------------------------------------------------------------------ */

const createBlockSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  phoneNumber: z.string().optional(),
  customerTown: z.string().optional(),
  customerAddress: z.string().optional(),
  customerNotes: z.string().optional(),
  hospitalName: z.string().optional(),

  categoryId: z.string().min(1, "Category is required"),
  measurementId: z.string().optional(),

  blockNumber: z.string().min(1, "Block number is required"),
  readyMadeSize: z.string().optional(),
  sizeLabel: z.string().optional(),
  fitNotes: z.string().optional(),
  versionNo: z.coerce.number().min(1).default(1),
  previousBlockId: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).default("ACTIVE"),
  remarks: z.string().optional(),
  legacyId: z.coerce.number().optional(),
  isDefault: z.boolean().default(true),
});

type CreateBlockFormInput = z.input<typeof createBlockSchema>;
type CreateBlockFormValues = z.output<typeof createBlockSchema>;

type CustomerAssignment = {
  customerId: string;
  customerName: string;
  phoneNumber?: string;
  town?: string;
  hospitalName?: string;
  measurementId?: string;
  measurementNumber?: string;
  isDefault: boolean;
};

type CreateBlockDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

const defaultValues: CreateBlockFormInput = {
  customerId: "",
  customerName: "",
  phoneNumber: "",
  customerTown: "",
  customerAddress: "",
  customerNotes: "",
  hospitalName: "",

  categoryId: "",
  measurementId: "",

  blockNumber: "",
  readyMadeSize: "",
  sizeLabel: "",
  fitNotes: "",
  versionNo: 1,
  previousBlockId: "",
  description: "",
  status: "ACTIVE",
  remarks: "",
  legacyId: undefined,
  isDefault: true,
};

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function SectionCard({
  title,
  description,
  icon: Icon,
  className,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "rounded-lg border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <CardHeader className="border-b border-slate-100 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Icon className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <CardTitle className="text-sm font-bold text-slate-900">
              {title}
            </CardTitle>

            {description && (
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

const fieldClassName =
  "h-10 rounded-lg border-slate-200 bg-white shadow-none focus-visible:ring-2 focus-visible:ring-slate-900/10";

const readOnlyFieldClassName =
  "h-10 rounded-lg border-slate-200 bg-slate-50 pr-10 shadow-none";

const textAreaClassName =
  "min-h-24 resize-none rounded-lg border-slate-200 bg-white shadow-none focus-visible:ring-2 focus-visible:ring-slate-900/10";

function toOptionalString(value?: string | null) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
}

function toOptionalNumber(value?: number | null) {
  if (value === undefined || value === null) return undefined;

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) return undefined;

  return numberValue;
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function CreateBlockDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateBlockDialogProps) {
  const [selectedCustomer, setSelectedCustomer] =
    React.useState<CustomerLookupItem | null>(null);
  const [customerAssignments, setCustomerAssignments] = React.useState<
    CustomerAssignment[]
  >([]);
  const [lookupResetKey, setLookupResetKey] = React.useState(0);

  const createBlockMutation = useCreateBlock();

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useGetCategories();

  const form = useForm<CreateBlockFormInput, unknown, CreateBlockFormValues>({
    resolver: zodResolver(createBlockSchema),
    defaultValues,
  });

  const { control, setValue, reset } = form;

  const customerId = useWatch({
    control,
    name: "customerId",
  });

  const categoryId = useWatch({
    control,
    name: "categoryId",
  });

  const measurementId = useWatch({
    control,
    name: "measurementId",
  });

  const {
    data: latestMeasurement,
    isLoading: isLatestMeasurementLoading,
    isFetching: isLatestMeasurementFetching,
    isError: isLatestMeasurementError,
  } = useGetLatestMeasurement({
    customerId,
    categoryId,
    enabled: Boolean(open && customerId && categoryId),
  });

  React.useEffect(() => {
    if (!open) return;
    if (!customerId || !categoryId) return;
    if (isLatestMeasurementLoading || isLatestMeasurementFetching) return;

    setValue("measurementId", latestMeasurement?.id ?? "", {
      shouldDirty: true,
      shouldValidate: false,
    });
  }, [
    open,
    customerId,
    categoryId,
    latestMeasurement?.id,
    isLatestMeasurementLoading,
    isLatestMeasurementFetching,
    setValue,
  ]);

  const categoryItems = React.useMemo(() => {
    const value = categories as unknown;

    if (Array.isArray(value)) return value;

    if (
      value &&
      typeof value === "object" &&
      Array.isArray((value as { data?: unknown }).data)
    ) {
      return (value as { data: typeof categories }).data;
    }

    return [];
  }, [categories]);

  const activeCategories = React.useMemo(() => {
    return categoryItems
      .filter((category) => category.isActive)
      .map((category) => ({
        id: category.id,
        name: category.name,
      }));
  }, [categoryItems]);

  const clearDraftCustomer = React.useCallback(() => {
    setSelectedCustomer(null);
    setLookupResetKey((key) => key + 1);

    setValue("customerId", "", {
      shouldDirty: true,
      shouldValidate: false,
    });
    setValue("customerName", "", {
      shouldDirty: true,
      shouldValidate: false,
    });
    setValue("phoneNumber", "", {
      shouldDirty: true,
      shouldValidate: false,
    });
    setValue("customerTown", "", {
      shouldDirty: true,
      shouldValidate: false,
    });
    setValue("customerAddress", "", {
      shouldDirty: true,
      shouldValidate: false,
    });
    setValue("customerNotes", "", {
      shouldDirty: true,
      shouldValidate: false,
    });
    setValue("hospitalName", "", {
      shouldDirty: true,
      shouldValidate: false,
    });
    setValue("measurementId", "", {
      shouldDirty: true,
      shouldValidate: false,
    });
    setValue("isDefault", true, {
      shouldDirty: true,
      shouldValidate: false,
    });
  }, [setValue]);

  const previousCategoryIdRef = React.useRef("");

  React.useEffect(() => {
    if (!open) {
      previousCategoryIdRef.current = "";
      return;
    }

    const previousCategoryId = previousCategoryIdRef.current;

    if (previousCategoryId && previousCategoryId !== categoryId) {
      setCustomerAssignments([]);
      setValue("measurementId", "", {
        shouldDirty: true,
        shouldValidate: false,
      });
    }

    previousCategoryIdRef.current = categoryId ?? "";
  }, [categoryId, open, setValue]);

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      reset(defaultValues);
      setSelectedCustomer(null);
      setCustomerAssignments([]);
      setLookupResetKey((key) => key + 1);
    }
  };

  const getDraftAssignment = React.useCallback(
    (
      values: CreateBlockFormValues | CreateBlockFormInput,
    ): CustomerAssignment | null => {
      if (!values.customerId) return null;

      return {
        customerId: values.customerId,
        customerName:
          values.customerName?.trim() ||
          selectedCustomer?.fullName ||
          "Selected customer",
        phoneNumber:
          values.phoneNumber?.trim() ||
          selectedCustomer?.phoneNumber ||
          undefined,
        town:
          values.customerTown?.trim() || selectedCustomer?.town || undefined,
        hospitalName:
          values.hospitalName?.trim() ||
          selectedCustomer?.hospitalName ||
          undefined,
        measurementId: toOptionalString(values.measurementId),
        measurementNumber: latestMeasurement?.measurementNumber,
        isDefault: values.isDefault ?? true,
      };
    },
    [latestMeasurement?.measurementNumber, selectedCustomer],
  );

  const handleAddCustomerAssignment = () => {
    const values = form.getValues();
    const draftAssignment = getDraftAssignment(values);

    if (!draftAssignment) {
      form.setError("customerId", {
        message: "Select a customer before adding.",
      });
      return;
    }

    if (!categoryId) {
      form.setError("categoryId", {
        message: "Select a category before adding customers.",
      });
      return;
    }

    setCustomerAssignments((current) => {
      const withoutCurrentCustomer = current.filter(
        (assignment) => assignment.customerId !== draftAssignment.customerId,
      );

      return [...withoutCurrentCustomer, draftAssignment];
    });

    clearDraftCustomer();
  };

  const handleRemoveCustomerAssignment = (customerIdToRemove: string) => {
    setCustomerAssignments((current) =>
      current.filter(
        (assignment) => assignment.customerId !== customerIdToRemove,
      ),
    );
  };

  const handleToggleCustomerDefault = (
    customerIdToUpdate: string,
    isDefault: boolean,
  ) => {
    setCustomerAssignments((current) =>
      current.map((assignment) =>
        assignment.customerId === customerIdToUpdate
          ? { ...assignment, isDefault }
          : assignment,
      ),
    );
  };

  const handleSubmit: SubmitHandler<CreateBlockFormValues> = async (values) => {
    const draftAssignment = getDraftAssignment(values);
    const assignments = draftAssignment
      ? [
          ...customerAssignments.filter(
            (assignment) => assignment.customerId !== draftAssignment.customerId,
          ),
          draftAssignment,
        ]
      : customerAssignments;

    if (!assignments.length) {
      form.setError("customerId", {
        message: "Add at least one customer to this block.",
      });
      return;
    }

    const payload: CreateBlockPayload = {
      categoryId: values.categoryId,
      blockNumber: values.blockNumber.trim(),
      readyMadeSize: toOptionalString(values.readyMadeSize),
      sizeLabel: toOptionalString(values.sizeLabel),
      fitNotes: toOptionalString(values.fitNotes),
      versionNo: Number(values.versionNo || 1),
      previousBlockId: toOptionalString(values.previousBlockId),
      description: toOptionalString(values.description),
      status: values.status,
      remarks: toOptionalString(values.remarks),
      legacyId: toOptionalNumber(values.legacyId),
      customers: assignments.map((assignment) => ({
        customerId: assignment.customerId,
        measurementId: toOptionalString(assignment.measurementId),
        isDefault: assignment.isDefault,
      })),
    };

    try {
      await createBlockMutation.mutateAsync(payload);

      onCreated?.();
      handleClose(false);
    } catch {
      // Error toast is handled inside useCreateBlock.onError.
    }
  };

  const isSubmitting = createBlockMutation.isPending;
  const isMeasurementLoading =
    isLatestMeasurementLoading || isLatestMeasurementFetching;

  const canAddCustomer =
    Boolean(customerId) &&
    Boolean(categoryId) &&
    !isMeasurementLoading &&
    !isSubmitting;
  const canSubmit =
    Boolean(categoryId) &&
    Boolean(customerAssignments.length || customerId) &&
    !isMeasurementLoading &&
    !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden rounded-lg border-slate-200 bg-slate-50 p-0 sm:max-w-5xl">
        <DialogHeader className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                <PackagePlus className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <DialogTitle className="text-lg font-bold text-slate-900">
                  Create New Block
                </DialogTitle>

                <DialogDescription className="mt-1 text-sm text-slate-500">
                  Assign the reusable block to one or more customers. The
                  latest matching measurement is linked for each customer when
                  available.
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className={cn(
                "w-fit rounded-full px-3 py-1 text-xs font-semibold",
                customerAssignments.length || customerId
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700",
              )}
            >
              {customerAssignments.length
                ? `${customerAssignments.length} customer${
                    customerAssignments.length === 1 ? "" : "s"
                  } assigned`
                : customerId
                  ? "Customer selected"
                  : "Customer required"}
            </Badge>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="grid min-h-0 gap-4 overflow-y-auto p-4 lg:grid-cols-[minmax(280px,340px)_1fr]">
              <SectionCard
                title="Customer Assignments"
                description="Add every customer who can use this block. Helora will link the latest matching measurement when available."
                icon={Users}
                className="lg:sticky lg:top-0 lg:self-start"
              >
                <div className="space-y-4">
                  <CustomerPhoneLookupField
                    key={lookupResetKey}
                    control={form.control}
                    setValue={form.setValue}
                    names={{
                      customerId: "customerId",
                      customerName: "customerName",
                      phoneNumber: "phoneNumber",
                      town: "customerTown",
                      address: "customerAddress",
                      notes: "customerNotes",
                      hospitalName: "hospitalName",
                    }}
                    onCustomerSelect={(customer) => {
                      setSelectedCustomer(customer);

                      setValue("customerId", customer.id, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });

                      setValue("measurementId", "", {
                        shouldDirty: true,
                        shouldValidate: false,
                      });
                    }}
                    onClear={() => {
                      setSelectedCustomer(null);

                      setValue("customerId", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });

                      setValue("measurementId", "", {
                        shouldDirty: true,
                        shouldValidate: false,
                      });
                    }}
                  />

                  {selectedCustomer || customerId ? (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-emerald-950">
                            {form.getValues("customerName") ||
                              "Customer selected"}
                          </p>

                          <p className="mt-1 text-xs text-emerald-700">
                            {form.getValues("phoneNumber") || "-"}
                            {form.getValues("customerTown")
                              ? ` • ${form.getValues("customerTown")}`
                              : ""}
                            {form.getValues("hospitalName")
                              ? ` • ${form.getValues("hospitalName")}`
                              : ""}
                          </p>
                        </div>

                        <Badge className="shrink-0 rounded-full bg-emerald-600 text-white hover:bg-emerald-600">
                          Selected
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm font-medium text-amber-800">
                      Select a customer, then add them to the assignment list.
                    </div>
                  )}

                  <FormField
                    control={control}
                    name="customerId"
                    render={() => (
                      <FormItem>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-lg bg-white"
                    disabled={!canAddCustomer}
                    onClick={handleAddCustomerAssignment}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add customer to block
                  </Button>

                  <div className="rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Assigned customers
                      </p>
                      <Badge variant="outline" className="rounded-md">
                        {customerAssignments.length}
                      </Badge>
                    </div>

                    {customerAssignments.length ? (
                      <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
                        {customerAssignments.map((assignment) => (
                          <div
                            key={assignment.customerId}
                            className="space-y-3 px-3 py-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {assignment.customerName}
                                </p>
                                <p className="mt-1 truncate text-xs text-slate-500">
                                  {assignment.phoneNumber || "-"}
                                  {assignment.town
                                    ? ` - ${assignment.town}`
                                    : ""}
                                  {assignment.hospitalName
                                    ? ` - ${assignment.hospitalName}`
                                    : ""}
                                </p>
                                <p className="mt-1 truncate text-xs text-slate-500">
                                  {assignment.measurementNumber
                                    ? `Measurement ${assignment.measurementNumber}`
                                    : assignment.measurementId
                                      ? "Measurement linked"
                                      : "No measurement linked"}
                                </p>
                              </div>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-600"
                                onClick={() =>
                                  handleRemoveCustomerAssignment(
                                    assignment.customerId,
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                              <span className="text-xs text-slate-600">
                                Default block for this customer
                              </span>
                              <Switch
                                checked={assignment.isDefault}
                                onCheckedChange={(checked) =>
                                  handleToggleCustomerDefault(
                                    assignment.customerId,
                                    checked,
                                  )
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-3 py-5 text-center text-sm text-slate-500">
                        <UserRound className="mx-auto mb-2 h-5 w-5 text-slate-400" />
                        No customers added yet.
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Block Details"
                description="Create the reusable cutting block and assign it to the selected customers."
                icon={Ruler}
              >
                {isCategoriesError && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    Categories could not be loaded. Please refresh and try
                    again.
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-12">
                  <FormField
                    control={control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem className="md:col-span-6">
                        <FormLabel>Category</FormLabel>

                        <Select
                          value={field.value || undefined}
                          disabled={isCategoriesLoading}
                          onValueChange={(value) => {
                            field.onChange(value);

                            setValue("measurementId", "", {
                              shouldDirty: true,
                              shouldValidate: false,
                            });
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className={fieldClassName}>
                              <SelectValue
                                placeholder={
                                  isCategoriesLoading
                                    ? "Loading categories..."
                                    : "Select category"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent
                            position="popper"
                            sideOffset={6}
                            className="z-80 max-h-72 rounded-lg"
                          >
                            {activeCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
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
                    name="measurementId"
                    render={({ field }) => (
                      <FormItem className="md:col-span-6">
                        <FormLabel>Latest Measurement</FormLabel>

                        <FormControl>
                          <div className="relative">
                            <Input
                              className={readOnlyFieldClassName}
                              placeholder={
                                customerId && categoryId
                                  ? "Auto-filling latest measurement..."
                                  : "Select customer and category first"
                              }
                              readOnly
                              {...field}
                            />

                            {isMeasurementLoading && (
                              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
                            )}

                            {!isMeasurementLoading && measurementId && (
                              <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                            )}
                          </div>
                        </FormControl>

                        {customerId && categoryId && isMeasurementLoading && (
                          <p className="text-xs leading-5 text-slate-500">
                            Finding latest measurement for this customer and
                            category...
                          </p>
                        )}

                        {customerId &&
                          categoryId &&
                          !isMeasurementLoading &&
                          latestMeasurement && (
                            <p className="text-xs leading-5 text-emerald-700">
                              Latest measurement selected:{" "}
                              <span className="font-semibold">
                                {latestMeasurement.measurementNumber}
                              </span>
                            </p>
                          )}

                        {customerId &&
                          categoryId &&
                          !isMeasurementLoading &&
                          !latestMeasurement &&
                          !isLatestMeasurementError && (
                            <p className="text-xs leading-5 text-amber-700">
                              No latest measurement found for this customer and
                              category. You can still create the block without a
                              measurement link.
                            </p>
                          )}

                        {isLatestMeasurementError && (
                          <p className="text-xs leading-5 text-red-700">
                            Unable to load latest measurement. Please try again.
                          </p>
                        )}

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="blockNumber"
                    render={({ field }) => (
                      <FormItem className="md:col-span-4">
                        <FormLabel>Block Number</FormLabel>
                        <FormControl>
                          <Input
                            className={fieldClassName}
                            placeholder="UNI-1001"
                            {...field}
                            onChange={(event) =>
                              field.onChange(event.target.value.toUpperCase())
                            }
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
                      <FormItem className="md:col-span-4">
                        <FormLabel>Ready-made Size</FormLabel>
                        <FormControl>
                          <Input
                            className={fieldClassName}
                            placeholder="M"
                            {...field}
                            onChange={(event) =>
                              field.onChange(event.target.value.toUpperCase())
                            }
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
                      <FormItem className="md:col-span-4">
                        <FormLabel>Size Label</FormLabel>
                        <FormControl>
                          <Input
                            className={fieldClassName}
                            placeholder="Standard Medium"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="versionNo"
                    render={({ field }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel>Version No</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            className={fieldClassName}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="previousBlockId"
                    render={({ field }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel>Previous Block ID</FormLabel>
                        <FormControl>
                          <Input
                            className={fieldClassName}
                            placeholder="Optional previous block id"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel>Status</FormLabel>

                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className={fieldClassName}>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent
                            position="popper"
                            sideOffset={6}
                            className="z-80 rounded-lg"
                          >
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="legacyId"
                    render={({ field }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel>Legacy ID</FormLabel>

                        <FormControl>
                          <Input
                            type="number"
                            className={fieldClassName}
                            placeholder="52"
                            value={field.value ?? ""}
                            onChange={(event) => {
                              const value = event.target.value;
                              field.onChange(value ? Number(value) : undefined);
                            }}
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
                      <FormItem className="md:col-span-12">
                        <FormLabel>Fit Notes</FormLabel>

                        <FormControl>
                          <Input
                            className={fieldClassName}
                            placeholder="Uniform block for regular fit"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-6">
                        <FormLabel>Description</FormLabel>

                        <FormControl>
                          <Textarea
                            className={textAreaClassName}
                            placeholder="Sample uniform block"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="remarks"
                    render={({ field }) => (
                      <FormItem className="md:col-span-6">
                        <FormLabel>Remarks</FormLabel>

                        <FormControl>
                          <Textarea
                            className={textAreaClassName}
                            placeholder="Default uniform block"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="md:col-span-12">
                        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                          <div>
                            <FormLabel className="text-sm font-bold text-slate-900">
                              Make default block for this customer
                            </FormLabel>
                            <p className="mt-1 text-xs text-slate-500">
                              Recommended when this is the main block for future
                              orders.
                            </p>
                          </div>

                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </SectionCard>

              {measurementId && latestMeasurement && (
                <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 lg:col-start-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <BadgeCheck className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-blue-950">
                      Measurement will be linked
                    </p>

                    <p className="mt-1 text-xs text-blue-700">
                      {latestMeasurement.measurementNumber}
                    </p>

                    <p className="mt-1 break-all text-xs text-blue-700">
                      {measurementId}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="border-t border-slate-200 bg-white px-5 py-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-lg"
                disabled={isSubmitting}
                onClick={() => handleClose(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={!canSubmit}
                className="rounded-lg bg-slate-900 hover:bg-slate-800"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? "Saving..." : "Create Block"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
