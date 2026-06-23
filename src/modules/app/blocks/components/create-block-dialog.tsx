// src/modules/app/blocks/components/create-block-dialog.tsx

"use client";

import * as React from "react";
import { z } from "zod";
import {
  Box,
  Info,
  Loader2,
  PackagePlus,
  Plus,
  Ruler,
  Save,
  Star,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { useQueries } from "@tanstack/react-query";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";
import { getLatestMeasurement } from "@/api/useGetLatestMeasurement";
import {
  useCreateBlock,
  type CreateBlockPayload,
} from "@/modules/app/blocks/api/useCreateBlock";
import {
  blocksQueryKeys,
  getBlocks,
} from "@/modules/app/blocks/api/useGetBlocks";
import {
  usePackageTemplatesQuery,
  type PackageTemplate,
  type PackageTemplateItem,
} from "@/modules/app/package-templates/api/package-template-api";
import { CustomerPhoneLookupField } from "@/components/layout/components/customer-phone-lookup-field";
import type { CustomerLookupItem } from "@/api/useGetCustomerLookup";
import type { Block } from "@/types/blocks";

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

  categoryId: z.string().optional(),
  measurementId: z.string().optional(),

  blockNumber: z.string().optional(),
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
  initialCustomer?: CustomerLookupItem | null;
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
  contentClassName,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("gap-0 py-0", className)}>
      <CardHeader className="shrink-0 border-b p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>

          <div className="min-w-0">
            <CardTitle>{title}</CardTitle>

            {description && (
              <CardDescription className="mt-1 leading-5">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("min-h-0 p-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

const fieldClassName = "h-10";

const textAreaClassName = "min-h-24 resize-none";

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

function normalizeBlockNumber(value: string) {
  return value.trim().toUpperCase();
}

function mapCustomerToAssignment(
  customer: CustomerLookupItem,
): CustomerAssignment {
  return {
    customerId: customer.id,
    customerName: customer.fullName,
    phoneNumber: customer.phoneNumber ?? undefined,
    town: customer.town ?? undefined,
    hospitalName: customer.hospitalName ?? undefined,
    measurementId: undefined,
    measurementNumber: undefined,
    isDefault: true,
  };
}

function PackageTemplateCategoryPicker({
  template,
  items,
  blockNumbers,
  duplicateBlocks,
  isCheckingDuplicates,
  onBlockNumberChange,
}: {
  template: PackageTemplate | null;
  items: PackageTemplateItem[];
  blockNumbers: Record<string, string>;
  duplicateBlocks: Record<string, Block>;
  isCheckingDuplicates: boolean;
  onBlockNumberChange: (categoryId: string, blockNumber: string) => void;
}) {
  if (!template) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Box className="size-6" />
        </div>
        <p className="mt-3 text-sm font-semibold text-foreground">
          Select a garment set first
        </p>
        <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
          The categories from that set will appear here for block creation.
        </p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        This garment set does not have garment categories configured.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex flex-col gap-1 border-b bg-muted/30 px-3 py-2">
        <p className="text-sm font-semibold">{template.name}</p>
        <p className="text-xs">
          Enter block numbers only for the categories you want to create now.
        </p>
      </div>

      <div className="grid gap-3 p-3 sm:grid-cols-2">
        {items.map((item) => {
          const categoryId = item.categoryId ?? "";
          const blockNumber = blockNumbers[categoryId] ?? "";
          const hasBlockNumber = Boolean(blockNumber.trim());
          const duplicateBlock = duplicateBlocks[categoryId];
          const hasDuplicate = Boolean(duplicateBlock);

          if (!categoryId) return null;

          return (
            <div
              key={item.id}
              className={cn(
                "rounded-lg border p-3 transition",
                hasDuplicate
                  ? "border-destructive/40 bg-destructive/5"
                  : hasBlockNumber
                    ? "border-primary/40 bg-primary/5"
                    : "bg-background",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {item.category?.name ?? item.itemDescription}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5">
                    {item.itemDescription}
                  </p>
                </div>

                {hasBlockNumber && (
                  <Badge variant={hasDuplicate ? "destructive" : "default"}>
                    {hasDuplicate ? "Exists" : "Ready"}
                  </Badge>
                )}
              </div>

              <Input
                value={blockNumber}
                onChange={(event) =>
                  onBlockNumberChange(
                    categoryId,
                    normalizeBlockNumber(event.target.value),
                  )
                }
                placeholder="Block no optional"
                className={cn(
                  fieldClassName,
                  "mt-3",
                  hasDuplicate && "text-destructive",
                )}
              />

              {hasDuplicate ? (
                <p className="mt-2 text-xs leading-5 text-destructive">
                  Block {duplicateBlock.blockNumber} already exists for this
                  category. Choose another number or use the existing block.
                </p>
              ) : hasBlockNumber && isCheckingDuplicates ? (
                <p className="mt-2 text-xs leading-5">
                  Checking existing block numbers...
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function CreateBlockDialog({
  open,
  onOpenChange,
  onCreated,
  initialCustomer,
}: CreateBlockDialogProps) {
  const [selectedCustomer, setSelectedCustomer] =
    React.useState<CustomerLookupItem | null>(null);
  const [customerAssignments, setCustomerAssignments] = React.useState<
    CustomerAssignment[]
  >([]);
  const [lookupResetKey, setLookupResetKey] = React.useState(0);
  const [selectedPackageTemplateId, setSelectedPackageTemplateId] =
    React.useState("");
  const [categoryBlockNumbers, setCategoryBlockNumbers] = React.useState<
    Record<string, string>
  >({});

  const createBlockMutation = useCreateBlock();
  const {
    data: packageTemplates = [],
    isLoading: isPackageTemplatesLoading,
    isError: isPackageTemplatesError,
  } = usePackageTemplatesQuery({ isActive: true });

  const form = useForm<CreateBlockFormInput, unknown, CreateBlockFormValues>({
    resolver: zodResolver(createBlockSchema),
    defaultValues,
  });

  const { control, setValue, reset } = form;

  const customerId = useWatch({
    control,
    name: "customerId",
  });

  React.useEffect(() => {
    if (!open || !initialCustomer) return;

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      setSelectedCustomer(initialCustomer);
      setCustomerAssignments((current) => {
        if (
          current.some(
            (assignment) => assignment.customerId === initialCustomer.id,
          )
        ) {
          return current;
        }

        return [mapCustomerToAssignment(initialCustomer), ...current];
      });

      setValue("customerId", initialCustomer.id, {
        shouldDirty: false,
        shouldValidate: false,
      });
      setValue("customerName", initialCustomer.fullName, {
        shouldDirty: false,
        shouldValidate: false,
      });
      setValue("phoneNumber", initialCustomer.phoneNumber ?? "", {
        shouldDirty: false,
        shouldValidate: false,
      });
      setValue("customerTown", initialCustomer.town ?? "", {
        shouldDirty: false,
        shouldValidate: false,
      });
      setValue("customerAddress", initialCustomer.address ?? "", {
        shouldDirty: false,
        shouldValidate: false,
      });
      setValue("hospitalName", initialCustomer.hospitalName ?? "", {
        shouldDirty: false,
        shouldValidate: false,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [initialCustomer, open, setValue]);

  const selectedPackageTemplate = React.useMemo(() => {
    return (
      packageTemplates.find(
        (template) => template.id === selectedPackageTemplateId,
      ) ?? null
    );
  }, [packageTemplates, selectedPackageTemplateId]);

  const packageTemplateCategories = React.useMemo(() => {
    if (!selectedPackageTemplate) return [];

    const seenCategoryIds = new Set<string>();

    return selectedPackageTemplate.items.filter((item) => {
      if (item.itemType !== "GARMENT") return false;
      if (!item.categoryId || !item.category) return false;
      if (seenCategoryIds.has(item.categoryId)) return false;

      seenCategoryIds.add(item.categoryId);
      return true;
    });
  }, [selectedPackageTemplate]);

  const blockEntries = React.useMemo(() => {
    return packageTemplateCategories
      .map((item) => ({
        item,
        categoryId: item.categoryId ?? "",
        blockNumber: categoryBlockNumbers[item.categoryId ?? ""]?.trim() ?? "",
      }))
      .filter((entry) => entry.categoryId && entry.blockNumber);
  }, [categoryBlockNumbers, packageTemplateCategories]);

  const duplicateBlockQueries = useQueries({
    queries: blockEntries.map((entry) => {
      const params = {
        page: 1,
        pageSize: 10,
        search: entry.blockNumber,
        categoryId: entry.categoryId,
        includeCounts: false,
        includeTotal: false,
      };

      return {
        queryKey: blocksQueryKeys.list(params),
        queryFn: () => getBlocks(params),
        enabled:
          open &&
          Boolean(entry.categoryId) &&
          Boolean(entry.blockNumber.trim()),
        staleTime: 30_000,
      };
    }),
  });

  const duplicateBlocksByCategory = React.useMemo(() => {
    const duplicates: Record<string, Block> = {};

    duplicateBlockQueries.forEach((query, index) => {
      const entry = blockEntries[index];

      if (!entry || !query.data?.data?.items?.length) return;

      const normalizedBlockNumber = normalizeBlockNumber(entry.blockNumber);
      const matchingBlock = query.data.data.items.find((block) => {
        return (
          block.categoryId === entry.categoryId &&
          normalizeBlockNumber(block.blockNumber) === normalizedBlockNumber
        );
      });

      if (matchingBlock) {
        duplicates[entry.categoryId] = matchingBlock;
      }
    });

    return duplicates;
  }, [blockEntries, duplicateBlockQueries]);

  const duplicateBlockCount = Object.keys(duplicateBlocksByCategory).length;
  const hasDuplicateBlockNumbers = duplicateBlockCount > 0;
  const isCheckingDuplicateBlocks = duplicateBlockQueries.some(
    (query) => query.isFetching,
  );

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

  const handlePackageTemplateChange = (templateId: string) => {
    setSelectedPackageTemplateId(templateId);
    setCustomerAssignments([]);
    setCategoryBlockNumbers({});
    setValue("categoryId", "", {
      shouldDirty: true,
      shouldValidate: false,
    });
    setValue("blockNumber", "", {
      shouldDirty: true,
      shouldValidate: false,
    });
    setValue("measurementId", "", {
      shouldDirty: true,
      shouldValidate: false,
    });
  };

  const handleCategoryBlockNumberChange = (
    categoryId: string,
    blockNumber: string,
  ) => {
    setCategoryBlockNumbers((current) => ({
      ...current,
      [categoryId]: blockNumber,
    }));

    const firstBlockEntry =
      blockEntries[0] ??
      packageTemplateCategories.find((item) => item.categoryId === categoryId);

    setValue("categoryId", firstBlockEntry?.categoryId ?? categoryId, {
      shouldDirty: true,
      shouldValidate: false,
    });
    setValue("blockNumber", blockNumber, {
      shouldDirty: true,
      shouldValidate: false,
    });
  };

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      reset(defaultValues);
      setSelectedCustomer(null);
      setCustomerAssignments([]);
      setSelectedPackageTemplateId("");
      setCategoryBlockNumbers({});
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
        measurementId: undefined,
        measurementNumber: undefined,
        isDefault: values.isDefault ?? true,
      };
    },
    [selectedCustomer],
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
            (assignment) =>
              assignment.customerId !== draftAssignment.customerId,
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

    if (!blockEntries.length) {
      form.setError("categoryId", {
        message: "Enter a block number for at least one category.",
      });
      return;
    }

    if (isCheckingDuplicateBlocks) {
      form.setError("categoryId", {
        message: "Please wait until block number validation is complete.",
      });
      return;
    }

    if (hasDuplicateBlockNumbers) {
      form.setError("categoryId", {
        message:
          "One or more block numbers already exist. Change them before creating new blocks.",
      });
      return;
    }

    try {
      for (const entry of blockEntries) {
        const customers = await Promise.all(
          assignments.map(async (assignment) => {
            const measurement = await getLatestMeasurement({
              customerId: assignment.customerId,
              categoryId: entry.categoryId,
            }).catch(() => null);

            return {
              customerId: assignment.customerId,
              measurementId: measurement?.id,
              isDefault: assignment.isDefault,
            };
          }),
        );

        const payload: CreateBlockPayload = {
          categoryId: entry.categoryId,
          blockNumber: entry.blockNumber,
          readyMadeSize: toOptionalString(values.readyMadeSize),
          sizeLabel: toOptionalString(values.sizeLabel),
          fitNotes: toOptionalString(values.fitNotes),
          versionNo: Number(values.versionNo || 1),
          previousBlockId: toOptionalString(values.previousBlockId),
          description:
            toOptionalString(values.description) ||
            toOptionalString(entry.item.itemDescription),
          status: values.status,
          remarks: toOptionalString(values.remarks),
          legacyId: toOptionalNumber(values.legacyId),
          customers: customers.map((customer) => ({
            customerId: customer.customerId,
            measurementId: customer.measurementId,
            isDefault: customer.isDefault,
          })),
        };

        await createBlockMutation.mutateAsync(payload);
      }

      onCreated?.();
      handleClose(false);
    } catch {
      // Error toast is handled inside useCreateBlock.onError.
    }
  };

  const isSubmitting = createBlockMutation.isPending;

  const canAddCustomer =
    Boolean(customerId) && Boolean(selectedPackageTemplateId) && !isSubmitting;
  const canSubmit =
    Boolean(selectedPackageTemplateId) &&
    Boolean(blockEntries.length) &&
    Boolean(customerAssignments.length) &&
    !isCheckingDuplicateBlocks &&
    !hasDuplicateBlockNumbers &&
    !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex h-[94vh] max-h-[94vh] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl">
        <DialogHeader className="shrink-0 border-b px-5 py-4 pr-14">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PackagePlus className="size-5" />
              </div>

              <div className="min-w-0">
                <DialogTitle className="text-xl">Create New Block</DialogTitle>

                <DialogDescription className="mt-1 text-sm">
                  Assign the reusable block to one or more customers. The latest
                  matching measurement is linked for each customer when
                  available.
                </DialogDescription>
              </div>
            </div>

            <Badge variant="secondary" className="w-fit shrink-0">
              <UserRound className="size-3.5" />
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
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto bg-muted/20 p-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)] lg:overflow-hidden">
              <SectionCard
                title="Customer Assignments"
                description="Add every customer who can use this block. Helora will link the latest matching measurement when available."
                icon={Users}
                className="order-2 lg:col-start-2 lg:row-start-1 lg:min-h-0"
                contentClassName="flex-1 lg:overflow-y-auto"
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
                    <div className="rounded-lg border bg-muted/30 px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {form.getValues("customerName") ||
                              "Customer selected"}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {form.getValues("phoneNumber") || "-"}
                            {form.getValues("customerTown")
                              ? ` • ${form.getValues("customerTown")}`
                              : ""}
                            {form.getValues("hospitalName")
                              ? ` • ${form.getValues("hospitalName")}`
                              : ""}
                          </p>
                        </div>

                        <Badge className="shrink-0">Selected</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 rounded-lg border bg-muted/30 px-3 py-3 text-sm">
                      <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>
                        Select a customer, then add them to the assignment list.
                      </span>
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
                    className="w-full"
                    disabled={!canAddCustomer}
                    onClick={handleAddCustomerAssignment}
                  >
                    <Plus className="size-4" />
                    Add customer to block
                  </Button>

                  <div className="overflow-hidden rounded-lg border">
                    <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2.5">
                      <p className="text-sm font-semibold">
                        Assigned customers
                      </p>
                      <Badge variant="outline">
                        {customerAssignments.length}
                      </Badge>
                    </div>

                    {customerAssignments.length ? (
                      <div className="max-h-80 divide-y overflow-y-auto">
                        {customerAssignments.map((assignment) => (
                          <div
                            key={assignment.customerId}
                            className="space-y-3 px-3 py-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-start gap-2.5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                                  {assignment.customerName
                                    .charAt(0)
                                    .toUpperCase() || "C"}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-foreground">
                                    {assignment.customerName}
                                  </p>
                                  <p className="mt-1 truncate text-xs text-muted-foreground">
                                    {assignment.phoneNumber || "-"}
                                    {assignment.town
                                      ? ` - ${assignment.town}`
                                      : ""}
                                  </p>
                                  <p className="mt-1 truncate text-xs text-muted-foreground">
                                    Measurement linked automatically when
                                    available.
                                  </p>
                                </div>
                              </div>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 shrink-0"
                                onClick={() =>
                                  handleRemoveCustomerAssignment(
                                    assignment.customerId,
                                  )
                                }
                              >
                                <Trash2 className="size-4" />
                                <span className="sr-only">Remove customer</span>
                              </Button>
                            </div>

                            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                              <span className="text-xs text-muted-foreground">
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
                      <div className="flex min-h-44 flex-col items-center justify-center px-3 py-6 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <Users className="size-5" />
                        </div>
                        <p className="mt-3 text-sm font-medium text-foreground">
                          No customers added yet
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Search and add a customer to get started.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Block Details"
                description="Select the garment set first, choose the category, then assign the block number."
                icon={Ruler}
                className="order-1 lg:col-start-1 lg:row-start-1 lg:min-h-0"
                contentClassName="flex-1 lg:overflow-y-auto"
              >
                {isPackageTemplatesError && (
                  <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    Garment sets could not be loaded. Please refresh and try
                    again.
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-12">
                  <div className="md:col-span-12">
                    <FormLabel>Garment Set</FormLabel>
                    <Select
                      value={selectedPackageTemplateId || undefined}
                      disabled={isPackageTemplatesLoading}
                      onValueChange={handlePackageTemplateChange}
                    >
                      <SelectTrigger className={cn(fieldClassName, "mt-2")}>
                        <SelectValue
                          placeholder={
                            isPackageTemplatesLoading
                              ? "Loading garment sets..."
                              : "Select garment set"
                          }
                        />
                      </SelectTrigger>

                      <SelectContent
                        position="popper"
                        sideOffset={6}
                        className="z-80 max-h-72"
                      >
                        {packageTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-12">
                    <PackageTemplateCategoryPicker
                      template={selectedPackageTemplate}
                      items={packageTemplateCategories}
                      blockNumbers={categoryBlockNumbers}
                      duplicateBlocks={duplicateBlocksByCategory}
                      isCheckingDuplicates={isCheckingDuplicateBlocks}
                      onBlockNumberChange={handleCategoryBlockNumberChange}
                    />
                  </div>

                  <FormField
                    control={control}
                    name="categoryId"
                    render={() => (
                      <FormItem className="md:col-span-12">
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div
                    className={cn(
                      "flex items-start gap-2 rounded-lg border px-3 py-3 text-xs leading-5 md:col-span-12",
                      hasDuplicateBlockNumbers
                        ? "border-destructive/30 bg-destructive/5 text-destructive"
                        : "bg-muted/30 text-muted-foreground",
                    )}
                  >
                    <Info className="mt-0.5 size-4 shrink-0" />
                    <span>
                      {hasDuplicateBlockNumbers
                        ? `${duplicateBlockCount} block ${
                            duplicateBlockCount === 1 ? "number" : "numbers"
                          } already exist. Choose different numbers before saving.`
                        : isCheckingDuplicateBlocks
                          ? "Checking whether these block numbers already exist..."
                          : blockEntries.length
                            ? `${blockEntries.length} block ${
                                blockEntries.length === 1 ? "number" : "numbers"
                              } ready to create. Latest matching measurements will be linked per customer and category during save.`
                            : "Add a block number to any category above. Categories without a number will be skipped."}
                    </span>
                  </div>

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
                      <FormItem className="md:col-span-4">
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
                      <FormItem className="md:col-span-4">
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
                      <FormItem className="md:col-span-4">
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
                            className="z-80"
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
                      <FormItem className="md:col-span-4">
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
                        <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-3">
                          <div className="flex items-start gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                              <Star className="size-4" />
                            </div>
                            <div>
                              <FormLabel className="text-sm">
                                Make default block for this customer
                              </FormLabel>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Recommended when this is the main block for
                                future orders.
                              </p>
                            </div>
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
            </div>

            <DialogFooter className="shrink-0 border-t bg-background px-5 py-4">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => handleClose(false)}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={!canSubmit}>
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
