"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Eye,
  Info,
  Loader2,
  LockKeyhole,
  PackagePlus,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useCreateCustomer } from "../api/useCreateCustomer";
import {
  useCustomerDuplicateCheck,
  type CustomerDuplicateMatch,
} from "../api/useGetCustomers";
import { getApiErrorMessage } from "@/errors/api-error-response";
import { cn } from "@/lib/utils";
import { useGetBlocks } from "@/modules/app/blocks/api/useGetBlocks";
import {
  usePackageTemplatesQuery,
  type PackageTemplate,
  type PackageTemplateItem,
} from "@/modules/app/package-templates/api/package-template-api";

const createCustomerSchema = z.object({
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
});

type CreateCustomerFormInput = z.input<typeof createCustomerSchema>;
type CreateCustomerFormValues = z.output<typeof createCustomerSchema>;

type CreateCustomerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (customerId: string) => void;
  onViewCustomer?: (customerId: string) => void;
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

type LegacyBlockAssignment = {
  key: string;
  existingBlockId?: string;
  isNewBlock?: boolean;
  categoryId: string;
  categoryName: string;
  blockNumber: string;
  readyMadeSize?: string;
  sizeLabel?: string;
  fitNotes?: string;
  description?: string;
  remarks?: string;
};

type ManualBlockDraft = {
  blockNumber: string;
  readyMadeSize?: string;
  sizeLabel?: string;
  fitNotes?: string;
  description?: string;
  remarks?: string;
};

export function CreateCustomerDialog({
  open,
  onOpenChange,
  onCreated,
  onViewCustomer,
}: CreateCustomerDialogProps) {
  const createCustomerMutation = useCreateCustomer();
  const [selectedExistingBlockId, setSelectedExistingBlockId] = useState<
    string | null
  >(null);
  const [blockLookupOpen, setBlockLookupOpen] = useState(false);
  const blockLookupTransitionRef = useRef(false);
  const blockLookupCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [blockLookupSearch, setBlockLookupSearch] = useState("");
  const [debouncedBlockSearch, setDebouncedBlockSearch] = useState("");
  const [legacyBlockAssignments, setLegacyBlockAssignments] = useState<
    LegacyBlockAssignment[]
  >([]);
  const [selectedPackageTemplateId, setSelectedPackageTemplateId] =
    useState("");
  const [legacySectionOpen, setLegacySectionOpen] = useState(false);
  const [activePackageCategory, setActivePackageCategory] =
    useState<PackageTemplateItem | null>(null);
  const [serverDuplicate, setServerDuplicate] = useState<{
    inputKey: string;
    match: CustomerDuplicateMatch;
  } | null>(null);
  const { data: packageTemplates = [], isLoading: isPackageTemplatesLoading } =
    usePackageTemplatesQuery({ isActive: true });

  const form = useForm<
    CreateCustomerFormInput,
    unknown,
    CreateCustomerFormValues
  >({
    resolver: zodResolver(createCustomerSchema),
    defaultValues,
  });

  const { clearErrors, control, handleSubmit, reset, setValue } = form;
  const hasLegacyBlock = useWatch({ control, name: "hasLegacyBlock" });
  const blockCategoryId = useWatch({ control, name: "blockCategoryId" });
  const customerName = useWatch({ control, name: "fullName" });
  const phoneNumber = useWatch({ control, name: "phoneNumber" });
  const alternatePhone = useWatch({ control, name: "alternatePhone" });
  const duplicateInputKey = `${customerName?.trim() ?? ""}|${phoneNumber?.trim() ?? ""}|${alternatePhone?.trim() ?? ""}`;
  const duplicateCheck = useCustomerDuplicateCheck({
    name: customerName,
    phone: phoneNumber,
    alternatePhone,
  });
  const activeServerDuplicate =
    serverDuplicate?.inputKey === duplicateInputKey
      ? serverDuplicate.match
      : null;
  const duplicateMatches = activeServerDuplicate
    ? [
        activeServerDuplicate,
        ...duplicateCheck.matches.filter(
          (match) => match.id !== activeServerDuplicate.id,
        ),
      ]
    : duplicateCheck.matches;
  const hasExactDuplicate =
    Boolean(activeServerDuplicate) || duplicateCheck.hasExactMatch;
  const exactDuplicateMatch = hasExactDuplicate
    ? (duplicateMatches.find(
        (match) => match.matchType === "Exact Phone Match",
      ) ?? duplicateMatches[0])
    : undefined;

  const selectedCategoryName =
    activePackageCategory?.category?.name ??
    activePackageCategory?.itemDescription ??
    "Selected category";
  const selectedPackageTemplate = useMemo(() => {
    return (
      packageTemplates.find(
        (template) => template.id === selectedPackageTemplateId,
      ) ?? null
    );
  }, [packageTemplates, selectedPackageTemplateId]);

  const selectedPackageCategories = useMemo(() => {
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBlockSearch(blockLookupSearch.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [blockLookupSearch]);

  const {
    data: blockSuggestionsResponse,
    isFetching: isBlockSuggestionsFetching,
  } = useGetBlocks({
    page: 1,
    pageSize: 8,
    search: debouncedBlockSearch || undefined,
    categoryId: blockCategoryId || undefined,
    status: "ACTIVE",
    includeCounts: true,
    includeTotal: false,
    enabled: Boolean(
      open && hasLegacyBlock && blockCategoryId && blockLookupOpen,
    ),
  });

  const blockSuggestions = useMemo(
    () => blockSuggestionsResponse?.data.items ?? [],
    [blockSuggestionsResponse?.data.items],
  );

  const setBlockLookupVisibility = (nextOpen: boolean) => {
    if (blockLookupCloseTimerRef.current) {
      clearTimeout(blockLookupCloseTimerRef.current);
      blockLookupCloseTimerRef.current = null;
    }

    if (nextOpen) {
      blockLookupTransitionRef.current = true;
      setBlockLookupOpen(true);
      return;
    }

    setBlockLookupOpen(false);
    blockLookupCloseTimerRef.current = setTimeout(() => {
      blockLookupTransitionRef.current = false;
      blockLookupCloseTimerRef.current = null;
    }, 500);
  };

  const handleClose = () => {
    reset(defaultValues);
    setSelectedExistingBlockId(null);
    setLegacyBlockAssignments([]);
    setSelectedPackageTemplateId("");
    setLegacySectionOpen(false);
    setActivePackageCategory(null);
    setBlockLookupOpen(false);
    setBlockLookupSearch("");
    setDebouncedBlockSearch("");
    setServerDuplicate(null);
    onOpenChange(false);
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      // The block lookup is rendered in its own portal. Without this guard,
      // interacting with or closing that sheet can be treated as an outside
      // interaction by the parent dialog and reset the entire customer form.
      if (blockLookupOpen || blockLookupTransitionRef.current) return;

      handleClose();
      return;
    }

    onOpenChange(true);
  };

  const clearBlockDraftFields = () => {
    setSelectedExistingBlockId(null);
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
  };

  const handleUsePackageCategory = (item: PackageTemplateItem) => {
    if (!item.categoryId) return;

    const existingAssignment = legacyBlockAssignments.find(
      (assignment) => assignment.categoryId === item.categoryId,
    );

    setActivePackageCategory(item);
    setValue("blockCategoryId", item.categoryId, {
      shouldDirty: true,
      shouldValidate: true,
    });
    clearBlockDraftFields();
    setSelectedExistingBlockId(existingAssignment?.existingBlockId ?? null);
    setValue("blockDescription", item.itemDescription, {
      shouldDirty: true,
      shouldValidate: false,
    });
    setBlockLookupSearch(existingAssignment?.blockNumber ?? "");
    setBlockLookupVisibility(true);
  };

  const applyExistingBlock = (block: BlockSuggestion) => {
    if (!activePackageCategory?.categoryId) return;

    const categoryId = activePackageCategory.categoryId;
    const assignment: LegacyBlockAssignment = {
      key: `${categoryId}:${block.blockNumber.toLowerCase()}`,
      existingBlockId: block.id,
      categoryId,
      categoryName:
        activePackageCategory.category?.name ??
        activePackageCategory.itemDescription,
      blockNumber: block.blockNumber,
      readyMadeSize: block.readyMadeSize ?? undefined,
      sizeLabel: block.sizeLabel ?? undefined,
      fitNotes: block.fitNotes ?? undefined,
      description: block.description ?? activePackageCategory.itemDescription,
      remarks: block.remarks ?? undefined,
    };

    setSelectedExistingBlockId(block.id);
    clearErrors("hasLegacyBlock");
    setLegacyBlockAssignments((current) => [
      ...current.filter((item) => item.categoryId !== categoryId),
      assignment,
    ]);
    clearBlockDraftFields();
    setBlockLookupVisibility(false);
    setActivePackageCategory(null);
  };

  const applyManualBlock = (draft: ManualBlockDraft) => {
    if (!activePackageCategory?.categoryId) return;

    const blockNumber = draft.blockNumber.trim().toUpperCase();
    if (!blockNumber) return;

    const categoryId = activePackageCategory.categoryId;
    const assignment: LegacyBlockAssignment = {
      key: `${categoryId}:${blockNumber.toLowerCase()}`,
      isNewBlock: true,
      categoryId,
      categoryName:
        activePackageCategory.category?.name ??
        activePackageCategory.itemDescription,
      blockNumber,
      readyMadeSize: draft.readyMadeSize?.trim() || undefined,
      sizeLabel: draft.sizeLabel?.trim() || undefined,
      fitNotes: draft.fitNotes?.trim() || undefined,
      description:
        draft.description?.trim() || activePackageCategory.itemDescription,
      remarks: draft.remarks?.trim() || undefined,
    };

    clearErrors("hasLegacyBlock");
    setSelectedExistingBlockId(null);
    setLegacyBlockAssignments((current) => [
      ...current.filter((item) => item.categoryId !== categoryId),
      assignment,
    ]);
    clearBlockDraftFields();
    setBlockLookupVisibility(false);
    setActivePackageCategory(null);
  };

  const onSubmit: SubmitHandler<CreateCustomerFormValues> = async (values) => {
    const legacyBlocks = values.hasLegacyBlock ? legacyBlockAssignments : [];

    if (hasExactDuplicate) {
      form.setError("phoneNumber", {
        message: "This phone number already belongs to another customer.",
      });
      return;
    }

    if (values.hasLegacyBlock && !legacyBlocks.length) {
      form.setError("hasLegacyBlock", {
        message: "Select a garment set and assign at least one block number.",
      });
      return;
    }

    try {
      const result = await createCustomerMutation.mutateAsync({
        fullName: values.fullName.trim(),
        phoneNumber: values.phoneNumber.trim(),
        alternatePhone: values.alternatePhone?.trim() || undefined,
        town: values.town?.trim() || undefined,
        address: values.address?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
        legacyBlocks: legacyBlocks.length
          ? legacyBlocks.map((assignment) => ({
              categoryId: assignment.categoryId,
              blockNumber: assignment.blockNumber,
              readyMadeSize: assignment.readyMadeSize,
              sizeLabel: assignment.sizeLabel,
              fitNotes: assignment.fitNotes,
              description: assignment.description,
              remarks: assignment.remarks,
            }))
          : undefined,
      });

      onCreated?.(result.data.id);
      handleClose();
    } catch (error) {
      const apiError = error as AxiosError<{
        message?: string;
        duplicateCustomer?: CustomerDuplicateMatch;
      }>;
      const duplicateCustomer = apiError.response?.data?.duplicateCustomer;

      if (apiError.response?.status === 409 && duplicateCustomer) {
        setServerDuplicate({
          inputKey: `${values.fullName.trim()}|${values.phoneNumber.trim()}|${values.alternatePhone?.trim() ?? ""}`,
          match: duplicateCustomer,
        });
        form.setError("phoneNumber", {
          message: "This phone number already belongs to another customer.",
        });
      }

      toast.error(getApiErrorMessage(error, "Unable to create customer."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className="flex max-h-[94vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl lg:max-w-5xl"
        onInteractOutside={(event) => {
          if (blockLookupOpen || blockLookupTransitionRef.current) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={(event) => {
          if (blockLookupOpen || blockLookupTransitionRef.current) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader className="shrink-0 border-b px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserPlus className="size-6" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-xl">Create Customer</DialogTitle>
              <DialogDescription className="mt-1">
                Add a new customer profile to use for orders and block
                assignments.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-muted/20 p-4 md:p-6">
              <Card className="gap-0 py-0">
                <SectionHeader
                  icon={UserPlus}
                  title="Customer Information"
                  description="Basic details used to identify and contact the customer."
                />

                <CardContent className="grid gap-4 p-4 md:grid-cols-2">
                  <FormField
                    control={control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>
                          Customer Name
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Dinesha Shamali" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2">
                    <CustomerDuplicateNotice
                      isChecking={duplicateCheck.isChecking}
                      hasExactMatch={hasExactDuplicate}
                      hasPossibleMatches={
                        Boolean(activeServerDuplicate) ||
                        duplicateCheck.hasPossibleMatches
                      }
                      matches={duplicateMatches}
                      error={duplicateCheck.error}
                      onViewCustomer={
                        onViewCustomer
                          ? (customerId) => {
                              handleClose();
                              onViewCustomer(customerId);
                            }
                          : undefined
                      }
                    />
                  </div>

                  <FormField
                    control={control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Phone Number
                          <span className="text-destructive">*</span>
                        </FormLabel>
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
                        <FormLabel>Hospital</FormLabel>
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

                  <FormField
                    control={control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Customer Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Optional internal note about this customer"
                            className="min-h-20 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Collapsible
                open={legacySectionOpen}
                onOpenChange={setLegacySectionOpen}
              >
                <Card className="gap-0 py-0">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 p-4 text-left"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <PackagePlus className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle>Legacy Blocks</CardTitle>
                          <Badge variant="outline">Optional</Badge>
                          {legacyBlockAssignments.length > 0 && (
                            <Badge variant="secondary">
                              {legacyBlockAssignments.length} assigned
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mt-1">
                          Add one block per uniform category from old records.
                        </CardDescription>
                      </div>
                      <ChevronDown
                        className={cn(
                          "size-4 shrink-0 transition-transform",
                          legacySectionOpen && "rotate-180",
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="space-y-4 border-t p-4">
                      <FormField
                        control={control}
                        name="hasLegacyBlock"
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  const enabled = checked === true;
                                  field.onChange(enabled);

                                  if (!enabled) {
                                    setBlockLookupOpen(false);
                                    setBlockLookupSearch("");
                                    setSelectedExistingBlockId(null);
                                    setActivePackageCategory(null);
                                    setLegacyBlockAssignments([]);
                                    setSelectedPackageTemplateId("");
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
                              <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                                <PackagePlus className="size-4 text-muted-foreground" />
                                Add block to customer
                              </FormLabel>
                              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                Use this for legacy entries where a customer
                                should be linked to one or more block numbers
                                across uniform categories.
                              </p>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      {hasLegacyBlock && (
                        <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                          <div>
                            <FormLabel>Garment Set</FormLabel>
                            <Select
                              value={selectedPackageTemplateId || undefined}
                              disabled={isPackageTemplatesLoading}
                              onValueChange={(value) => {
                                setSelectedPackageTemplateId(value);
                                setActivePackageCategory(null);
                                setBlockLookupOpen(false);
                                setBlockLookupSearch("");
                                setLegacyBlockAssignments([]);
                                setValue("blockCategoryId", "", {
                                  shouldDirty: true,
                                  shouldValidate: false,
                                });
                                clearBlockDraftFields();
                              }}
                            >
                              <SelectTrigger className="mt-2 w-full bg-background">
                                <SelectValue
                                  placeholder={
                                    isPackageTemplatesLoading
                                      ? "Loading garment sets..."
                                      : "Select garment set"
                                  }
                                />
                              </SelectTrigger>

                              <SelectContent>
                                {packageTemplates.map((template) => (
                                  <SelectItem
                                    key={template.id}
                                    value={template.id}
                                  >
                                    {template.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {selectedPackageTemplate ? (
                            <PackageTemplateCategoryList
                              template={selectedPackageTemplate}
                              items={selectedPackageCategories}
                              assignments={legacyBlockAssignments}
                              activeDraftCategoryId={blockCategoryId}
                              onUseCategory={handleUsePackageCategory}
                            />
                          ) : (
                            <div className="rounded-lg border border-dashed bg-background px-4 py-8 text-center">
                              <PackagePlus className="mx-auto size-6 text-muted-foreground" />
                              <p className="mt-2 text-sm font-semibold">
                                Select a garment set
                              </p>
                              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                Categories and their selected block numbers will
                                appear here after choosing a template set.
                              </p>
                            </div>
                          )}

                          <BlockAssignmentsList
                            assignments={legacyBlockAssignments}
                            onRemove={(key) =>
                              setLegacyBlockAssignments((current) =>
                                current.filter(
                                  (assignment) => assignment.key !== key,
                                ),
                              )
                            }
                          />
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>

            <DialogFooter className="shrink-0 items-center border-t px-6 py-4 sm:justify-between">
              <div className="flex min-w-0 items-center gap-2 text-sm">
                {hasExactDuplicate ? (
                  <>
                    <LockKeyhole className="size-4 shrink-0 text-destructive" />
                    <span className="truncate text-destructive">
                      Creation is blocked until the duplicate is resolved.
                    </span>
                  </>
                ) : duplicateCheck.isChecking ? (
                  <>
                    <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                    <span className="truncate text-muted-foreground">
                      Checking existing customers...
                    </span>
                  </>
                ) : (
                  <>
                    <Info className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-muted-foreground">
                      Customer details will be verified again before saving.
                    </span>
                  </>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>

                {hasExactDuplicate && exactDuplicateMatch && onViewCustomer ? (
                  <Button
                    type="button"
                    onClick={() => {
                      handleClose();
                      onViewCustomer(exactDuplicateMatch.id);
                    }}
                  >
                    <Eye className="size-4" />
                    Open Existing Customer
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={
                      createCustomerMutation.isPending ||
                      duplicateCheck.isChecking ||
                      hasExactDuplicate
                    }
                  >
                    {createCustomerMutation.isPending && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    {hasExactDuplicate
                      ? "Existing Customer Found"
                      : hasLegacyBlock && legacyBlockAssignments.length
                        ? `Create Customer & Link ${legacyBlockAssignments.length} Blocks`
                        : hasLegacyBlock
                          ? "Create Customer & Link Blocks"
                          : "Create Customer"}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <BlockLookupSheet
        open={blockLookupOpen}
        onOpenChange={(nextOpen) => {
          setBlockLookupVisibility(nextOpen);
          if (!nextOpen) {
            setActivePackageCategory(null);
          }
        }}
        categoryName={selectedCategoryName}
        search={blockLookupSearch}
        onSearchChange={setBlockLookupSearch}
        suggestions={blockSuggestions}
        selectedBlockId={selectedExistingBlockId}
        isFetching={isBlockSuggestionsFetching}
        onSelect={applyExistingBlock}
        onCreateNew={applyManualBlock}
      />
    </Dialog>
  );
}

function CustomerDuplicateNotice({
  isChecking,
  hasExactMatch,
  hasPossibleMatches,
  matches,
  error,
  onViewCustomer,
}: {
  isChecking: boolean;
  hasExactMatch: boolean;
  hasPossibleMatches: boolean;
  matches: CustomerDuplicateMatch[];
  error: unknown;
  onViewCustomer?: (customerId: string) => void;
}) {
  if (isChecking) {
    return (
      <Alert>
        <Loader2 className="size-4 animate-spin" />
        <AlertTitle>Checking existing customers...</AlertTitle>
        <AlertDescription>
          Comparing the customer name and phone numbers.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="size-4" />
        <AlertTitle>Duplicate check unavailable</AlertTitle>
        <AlertDescription>
          You can continue. The server will check again before saving.
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasPossibleMatches || !matches.length) return null;

  return (
    <DuplicateMatchesPanel
      hasExactMatch={hasExactMatch}
      matches={matches}
      onViewCustomer={onViewCustomer}
    />
  );
}

function DuplicateMatchesPanel({
  hasExactMatch,
  matches,
  onViewCustomer,
}: {
  hasExactMatch: boolean;
  matches: CustomerDuplicateMatch[];
  onViewCustomer?: (customerId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-amber-300 bg-amber-50/40",
          hasExactMatch && "border-amber-300 bg-amber-50/40",
        )}
      >
        <div className="flex items-start gap-3 p-4">
          <AlertTriangle
            className={cn(
              "mt-0.5 size-5 shrink-0 text-muted-foreground",
              hasExactMatch && "text-amber-600",
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {hasExactMatch
                ? "Existing customer found"
                : "Possible existing customer found"}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {hasExactMatch
                ? "The phone number entered matches an existing customer. Use the existing record to avoid duplicate data."
                : "Please review these similar customers before creating a new one."}
            </p>
          </div>

          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={expanded ? "Collapse matches" : "Expand matches"}
            >
              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  expanded && "rotate-180",
                )}
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="space-y-3 px-4 pb-4 pl-12">
            <div className="space-y-2">
              {matches.slice(0, 3).map((match) => (
                <div
                  key={match.id}
                  className="flex flex-col gap-3 rounded-lg border bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {match.customerName
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part.charAt(0).toUpperCase())
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold">
                          {match.customerName}
                        </p>
                        <Badge variant="secondary">{match.matchType}</Badge>
                        <Badge variant="outline">
                          {match.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {match.phone ||
                          match.alternatePhone ||
                          "No phone number"}
                        {match.town ? ` - ${match.town}` : ""}
                        {match.address ? ` - ${match.address}` : ""}
                      </p>
                    </div>
                  </div>

                  {onViewCustomer && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => onViewCustomer(match.id)}
                    >
                      <Eye className="size-4" />
                      View Customer
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="size-4 shrink-0" />
                {hasExactMatch
                  ? "Continuing would create a duplicate record."
                  : "You may continue after reviewing these possible matches."}
              </div>

              {hasExactMatch && (
                <Button type="button" variant="outline" size="sm" disabled>
                  <LockKeyhole className="size-4" />
                  Continue anyway
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

type BlockSuggestion = NonNullable<
  ReturnType<typeof useGetBlocks>["data"]
>["data"]["items"][number];

function BlockLookupSheet({
  open,
  onOpenChange,
  categoryName,
  suggestions,
  search,
  onSearchChange,
  selectedBlockId,
  isFetching,
  onSelect,
  onCreateNew,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  suggestions: BlockSuggestion[];
  search: string;
  onSearchChange: (value: string) => void;
  selectedBlockId: string | null;
  isFetching: boolean;
  onSelect: (block: BlockSuggestion) => void;
  onCreateNew: (draft: ManualBlockDraft) => void;
}) {
  const [readyMadeSize, setReadyMadeSize] = useState("");
  const [sizeLabel, setSizeLabel] = useState("");
  const [fitNotes, setFitNotes] = useState("");
  const [remarks, setRemarks] = useState("");
  const normalizedSearch = search.trim().toUpperCase();

  useEffect(() => {
    if (open) return;

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      setReadyMadeSize("");
      setSizeLabel("");
      setFitNotes("");
      setRemarks("");
    });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const exactMatchExists = suggestions.some(
    (block) => block.blockNumber.trim().toUpperCase() === normalizedSearch,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full gap-0 bg-white p-0 sm:max-w-lg"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <SheetHeader className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle className="text-lg font-semibold text-slate-900">
                Find Existing Block
              </SheetTitle>
              <SheetDescription className="mt-1 text-sm text-slate-500">
                Search active blocks in {categoryName} and link one to this
                customer.
              </SheetDescription>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="border-b border-slate-100 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) =>
                onSearchChange(event.target.value.toUpperCase())
              }
              placeholder="Search block no, size, notes..."
              className="h-10 bg-white pl-9"
              autoFocus
            />
            {isFetching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-4">
          <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Add as new block
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  If this block number is not in the database, Helora will
                  create it while creating the customer.
                </p>
              </div>
              <Badge variant="outline" className="rounded-md">
                Optional
              </Badge>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input
                value={readyMadeSize}
                onChange={(event) => setReadyMadeSize(event.target.value)}
                placeholder="Ready-made size"
                className="h-10 bg-slate-50"
              />
              <Input
                value={sizeLabel}
                onChange={(event) => setSizeLabel(event.target.value)}
                placeholder="Size label"
                className="h-10 bg-slate-50"
              />
              <Input
                value={fitNotes}
                onChange={(event) => setFitNotes(event.target.value)}
                placeholder="Fit notes"
                className="h-10 bg-slate-50 sm:col-span-2"
              />
              <Input
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder="Remarks"
                className="h-10 bg-slate-50 sm:col-span-2"
              />
            </div>

            <Button
              type="button"
              className="mt-3 w-full"
              disabled={!normalizedSearch || exactMatchExists}
              onClick={() =>
                onCreateNew({
                  blockNumber: normalizedSearch,
                  readyMadeSize,
                  sizeLabel,
                  fitNotes,
                  remarks,
                })
              }
            >
              <PackagePlus className="mr-2 h-4 w-4" />
              {exactMatchExists
                ? "Block already exists below"
                : normalizedSearch
                  ? `Create new block ${normalizedSearch}`
                  : "Enter block number to create"}
            </Button>
          </div>

          {suggestions.length ? (
            <div className="space-y-2">
              {suggestions.map((block) => (
                <button
                  key={block.id}
                  type="button"
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                  onClick={() => onSelect(block)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {block.blockNumber}
                        </p>
                        {selectedBlockId === block.id && (
                          <Badge
                            variant="outline"
                            className="rounded-md border-emerald-200 bg-emerald-50 text-emerald-700"
                          >
                            Selected
                          </Badge>
                        )}
                      </div>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {block.sizeLabel || block.readyMadeSize || "No size"}
                        {block.fitNotes ? ` - ${block.fitNotes}` : ""}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="outline" className="rounded-md">
                          {block._count?.customerBlocks ?? 0} customers
                        </Badge>
                        <Badge variant="outline" className="rounded-md">
                          {block._count?.measurements ?? 0} measurements
                        </Badge>
                        <Badge variant="outline" className="rounded-md">
                          {block._count?.orderItems ?? 0} orders
                        </Badge>
                      </div>
                    </div>

                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center">
              <Search className="mx-auto h-7 w-7 text-slate-400" />
              <p className="mt-3 text-sm font-semibold text-slate-900">
                {isFetching ? "Searching blocks..." : "No existing block found"}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Try another search term or add the block from the Blocks page by
                using the new block panel above.
              </p>
            </div>
          )}
        </div>

        <SheetFooter className="border-t border-slate-200 bg-white p-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function BlockAssignmentsList({
  assignments,
  onRemove,
}: {
  assignments: LegacyBlockAssignment[];
  onRemove: (key: string) => void;
}) {
  if (!assignments.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center">
        <PackagePlus className="mx-auto h-6 w-6 text-slate-400" />
        <p className="mt-2 text-sm font-semibold text-slate-900">
          No blocks added yet
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Add each uniform category block before creating the customer.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <p className="text-sm font-semibold text-slate-900">
          Block Assignments
        </p>
        <Badge variant="outline" className="rounded-md">
          {assignments.length}
        </Badge>
      </div>

      <div className="divide-y divide-slate-100">
        {assignments.map((assignment) => (
          <div
            key={assignment.key}
            className="flex items-start justify-between gap-3 px-3 py-3"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {assignment.blockNumber}
                </p>
                <Badge variant="outline" className="rounded-md">
                  {assignment.categoryName}
                </Badge>
                {assignment.existingBlockId && (
                  <Badge
                    variant="outline"
                    className="rounded-md border-emerald-200 bg-emerald-50 text-emerald-700"
                  >
                    Existing
                  </Badge>
                )}
                {assignment.isNewBlock && (
                  <Badge
                    variant="outline"
                    className="rounded-md border-blue-200 bg-blue-50 text-blue-700"
                  >
                    New block
                  </Badge>
                )}
              </div>

              <p className="mt-1 truncate text-xs text-slate-500">
                {assignment.sizeLabel ||
                  assignment.readyMadeSize ||
                  "No size label"}
                {assignment.fitNotes ? ` - ${assignment.fitNotes}` : ""}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-600"
              onClick={() => onRemove(assignment.key)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PackageTemplateCategoryList({
  template,
  items,
  assignments,
  activeDraftCategoryId,
  onUseCategory,
}: {
  template: PackageTemplate;
  items: PackageTemplateItem[];
  assignments: LegacyBlockAssignment[];
  activeDraftCategoryId?: string;
  onUseCategory: (item: PackageTemplateItem) => void;
}) {
  if (!items.length) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        This garment set does not have garment categories configured.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-col gap-1 border-b border-slate-100 px-3 py-2">
        <p className="text-sm font-semibold text-slate-900">{template.name}</p>
        <p className="text-xs text-slate-500">
          Select each category and assign the customer block number.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item) => {
          const categoryId = item.categoryId ?? "";
          const assignment = assignments.find(
            (block) => block.categoryId === categoryId,
          );
          const isActiveDraft = activeDraftCategoryId === categoryId;

          return (
            <div
              key={item.id}
              className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.category?.name ?? item.itemDescription}
                  </p>
                  {assignment && (
                    <Badge
                      variant="outline"
                      className="rounded-md border-emerald-200 bg-emerald-50 text-emerald-700"
                    >
                      {assignment.blockNumber}
                    </Badge>
                  )}
                  {isActiveDraft && !assignment && (
                    <Badge variant="outline" className="rounded-md">
                      Editing
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {item.itemDescription}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 bg-white"
                onClick={() => onUseCategory(item)}
              >
                <Search className="mr-2 h-4 w-4" />
                {assignment ? "Change Block" : "Find Block"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <CardHeader className="border-b p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}
