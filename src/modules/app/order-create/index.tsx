"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Package2,
  Plus,
  Ruler,
  Save,
  Shirt,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import { useGetCategories } from "@/api/useGetCategories";
import {
  useCreateOrder,
  useOrderPricePreview,
  type CreateOrderPayload,
  type OrderItemStatus,
  type OrderItemType,
  type OrderPaymentMode,
  type OrderSource,
  type OrderStatus,
  type PaymentStatus,
  type PriceSource,
  type PricePreviewItem,
} from "@/api/useCreateOrder";
import { useGetCustomerById } from "@/modules/app/customers/api/useGetCustomerbyId";
import {
  usePackageTemplatesQuery,
  type PackageTemplate,
} from "@/modules/app/package-templates/api/package-template-api";

type CreateOrderPrefill = {
  customerId?: string;
};

type CreateOrderPageProps = {
  prefill?: CreateOrderPrefill;
  onSubmit?: (payload: CreateOrderPayload) => Promise<void> | void;
};

const orderItemSchema = z
  .object({
    itemType: z
      .enum(["GARMENT", "ACCESSORY", "PACKAGE", "SERVICE"])
      .default("GARMENT"),
    categoryId: z.string().optional(),
    packageTemplateId: z.string().optional(),
    packageTemplateItemId: z.string().optional(),
    blockId: z.string().optional(),
    measurementId: z.string().optional(),
    itemDescription: z.string().min(1, "Item description is required"),
    quantity: z.coerce.number().min(1, "Qty must be at least 1"),
    calculatedUnitPrice: z.coerce.number().min(0).default(0),
    unitPrice: z.coerce.number().min(0).default(0),
    lineTotal: z.coerce.number().min(0).default(0),
    priceSource: z
      .enum([
        "PACKAGE_PRICE",
        "PACKAGE_INCLUDED_ITEM",
        "ADDITIONAL_ITEM_PRICE",
        "MEASUREMENT_CHART_PRICE",
        "FIXED_ITEM_PRICE",
        "MANUAL_OVERRIDE",
        "FREE_OF_CHARGE",
      ])
      .default("FIXED_ITEM_PRICE"),
    isPriceOverridden: z.boolean().default(false),
    overrideReason: z.string().optional(),
    notes: z.string().optional(),
    tailorNote: z.string().optional(),
    status: z
      .enum(["PENDING", "CUTTING", "SEWING", "READY", "DELIVERED", "CANCELLED"])
      .default("PENDING"),
  })
  .superRefine((item, ctx) => {
    if (item.itemType === "GARMENT" && !item.categoryId) {
      ctx.addIssue({
        code: "custom",
        path: ["categoryId"],
        message: "Category is required for garment items",
      });
    }

    if (
      (item.isPriceOverridden || item.priceSource === "MANUAL_OVERRIDE") &&
      !item.overrideReason?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["overrideReason"],
        message: "Override reason is required",
      });
    }
  });

const formSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  packageTemplateId: z.string().optional(),
  orderMode: z
    .enum(["UNIFORM_SET", "CUSTOM_ITEMS", "REPEAT_PREVIOUS"])
    .default("UNIFORM_SET"),
  groupOrderId: z.string().optional(),
  orderNumber: z.string().optional(),
  orderDate: z.string().min(1, "Order date is required"),
  promisedDate: z.string().min(1, "Promised date is required"),
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "CUTTING",
      "SEWING",
      "READY",
      "DELIVERED",
      "CANCELLED",
    ])
    .default("PENDING"),
  orderSource: z
    .enum(["DREZAURA", "PHYSICAL_SHOP", "PHONE_CALL", "WHATSAPP", "ONLINE"])
    .default("PHYSICAL_SHOP"),
  paymentStatus: z
    .enum(["UNPAID", "ADVANCE_PAID", "PARTIALLY_PAID", "PAID", "REFUNDED"])
    .default("UNPAID"),
  paymentMode: z
    .enum(["CASH", "ONLINE_TRANSFER", "BANK_DEPOSIT", "CARD", "MIXED"])
    .default("CASH"),
  courierCharges: z.coerce.number().min(0).default(0),
  advanceAmount: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
  specialNotes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Add at least one item"),
});

type OrderBuilderForm = z.input<typeof formSchema>;
type OrderBuilderValues = z.output<typeof formSchema>;

const ORDER_MODES = [
  {
    value: "UNIFORM_SET",
    label: "Uniform Set",
    description: "Build a nurse or school kit with included and extra items.",
  },
  {
    value: "CUSTOM_ITEMS",
    label: "Custom Items",
    description: "Add garment parts and accessories one by one.",
  },
  {
    value: "REPEAT_PREVIOUS",
    label: "Repeat Previous",
    description: "Use previous orders as a guide, then adjust items.",
  },
] as const;

const ORDER_SOURCE_OPTIONS = [
  ["PHYSICAL_SHOP", "Physical Shop"],
  ["PHONE_CALL", "Phone Call"],
  ["WHATSAPP", "WhatsApp"],
  ["DREZAURA", "Drezaura"],
  ["ONLINE", "Online"],
] as const;

const PAYMENT_MODE_OPTIONS = [
  ["CASH", "Cash"],
  ["ONLINE_TRANSFER", "Online Transfer"],
  ["BANK_DEPOSIT", "Bank Deposit"],
  ["CARD", "Card"],
  ["MIXED", "Mixed"],
] as const;

const PRICE_SOURCE_LABELS: Record<PriceSource, string> = {
  PACKAGE_PRICE: "Package price",
  PACKAGE_INCLUDED_ITEM: "Included in package",
  ADDITIONAL_ITEM_PRICE: "Additional item",
  MEASUREMENT_CHART_PRICE: "Measurement chart",
  FIXED_ITEM_PRICE: "Fixed item price",
  MANUAL_OVERRIDE: "Manual override",
  FREE_OF_CHARGE: "Free of charge",
};

const BUILDER_STEPS = [
  {
    id: 1,
    label: "Customer",
    description: "Dates and order basics",
  },
  {
    id: 2,
    label: "Type",
    description: "Set or custom order",
  },
  {
    id: 3,
    label: "Set Items",
    description: "Choose package items",
  },
  {
    id: 4,
    label: "Measurements",
    description: "Block per item",
  },
  {
    id: 5,
    label: "Price",
    description: "Preview and override",
  },
  {
    id: 6,
    label: "Confirm",
    description: "Final notes",
  },
] as const;

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysInputValue(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function toIsoDateString(dateValue?: string) {
  if (!dateValue) return undefined;
  return new Date(`${dateValue}T00:00:00`).toISOString();
}

function formatMoney(value?: number | string | null) {
  return Number(value ?? 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function buildInitialItem(
  overrides: Partial<OrderBuilderForm["items"][number]> = {},
): OrderBuilderForm["items"][number] {
  return {
    itemType: "GARMENT",
    categoryId: "",
    packageTemplateId: "",
    packageTemplateItemId: "",
    blockId: "",
    measurementId: "",
    itemDescription: "",
    quantity: 1,
    calculatedUnitPrice: 0,
    unitPrice: 0,
    lineTotal: 0,
    priceSource: "FIXED_ITEM_PRICE",
    isPriceOverridden: false,
    overrideReason: "",
    notes: "",
    tailorNote: "",
    status: "PENDING",
    ...overrides,
  };
}

function buildInitialValues(customerId?: string): OrderBuilderForm {
  return {
    customerId: customerId ?? "",
    packageTemplateId: "",
    orderMode: "UNIFORM_SET",
    groupOrderId: "",
    orderNumber: "",
    orderDate: todayInputValue(),
    promisedDate: addDaysInputValue(7),
    status: "PENDING",
    orderSource: "PHYSICAL_SHOP",
    paymentStatus: "UNPAID",
    paymentMode: "CASH",
    courierCharges: 0,
    advanceAmount: 0,
    notes: "",
    specialNotes: "",
    items: [buildInitialItem()],
  };
}

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  description?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Icon className="h-4 w-4" />
            </div>
          )}
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
        {action}
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100",
        props.className,
      )}
    />
  );
}

function BuilderStepNav({
  activeStep,
  onStepChange,
}: {
  activeStep: number;
  onStepChange: (step: number) => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-4 lg:px-6">
      <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 sm:grid-cols-2 lg:grid-cols-6">
        {BUILDER_STEPS.map((step) => {
          const isActive = activeStep === step.id;
          const isDone = activeStep > step.id;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(step.id)}
              className={cn(
                "flex min-h-16 items-center gap-3 rounded-lg border px-3 py-2 text-left transition",
                isActive
                  ? "border-slate-900 bg-white shadow-sm"
                  : "border-transparent hover:bg-white",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black",
                  isActive
                    ? "bg-slate-900 text-white"
                    : isDone
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-200 text-slate-600",
                )}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : step.id}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block truncate text-sm font-black",
                    isActive ? "text-slate-950" : "text-slate-700",
                  )}
                >
                  {step.label}
                </span>
                <span className="block truncate text-xs font-semibold text-slate-500">
                  {step.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepFooter({
  activeStep,
  onPrevious,
  onNext,
  onPreview,
  onSave,
  isPreviewing,
  isSubmitting,
}: {
  activeStep: number;
  onPrevious: () => void;
  onNext: () => void;
  onPreview: () => void;
  onSave: () => void;
  isPreviewing: boolean;
  isSubmitting: boolean;
}) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-500">
          Step {activeStep} of {BUILDER_STEPS.length}:{" "}
          <span className="font-black text-slate-900">
            {BUILDER_STEPS[activeStep - 1]?.label}
          </span>
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg font-bold"
            disabled={activeStep === 1}
            onClick={onPrevious}
          >
            Previous
          </Button>

          {activeStep === 5 && (
            <Button
              type="button"
              variant="outline"
              className="rounded-lg font-bold"
              disabled={isPreviewing}
              onClick={onPreview}
            >
              {isPreviewing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Banknote className="mr-2 h-4 w-4" />
              )}
              Price Preview
            </Button>
          )}

          {activeStep < BUILDER_STEPS.length ? (
            <Button
              type="button"
              className="rounded-lg bg-slate-900 font-bold hover:bg-slate-800"
              onClick={onNext}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isSubmitting}
              className="rounded-lg bg-slate-900 font-bold hover:bg-slate-800"
              onClick={onSave}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Order
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function CreateOrderPage({ prefill, onSubmit }: CreateOrderPageProps) {
  const navigate = useNavigate();
  const createOrderMutation = useCreateOrder();
  const pricePreviewMutation = useOrderPricePreview();
  const [activeStep, setActiveStep] = useState(1);
  const [pricePreview, setPricePreview] = useState<{
    items: PricePreviewItem[];
    warnings: string[];
    totalAmount: number;
    payableAmount: number;
    packagePrice: number;
  } | null>(null);

  const { data: categories = [], isLoading: isCategoriesLoading } =
    useGetCategories();

  const {
    data: customer,
    isLoading: isCustomerLoading,
    isError: isCustomerError,
  } = useGetCustomerById(prefill?.customerId, Boolean(prefill?.customerId));
  const {
    data: packageTemplates = [],
    isLoading: isPackageTemplatesLoading,
  } = usePackageTemplatesQuery({ isActive: true });

  const form = useForm<OrderBuilderForm, any, OrderBuilderValues>({
    resolver: zodResolver(formSchema),
    defaultValues: buildInitialValues(prefill?.customerId),
  });

  const { control, setValue } = form;
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({ control, name: "items" }) ?? [];
  const watchedPackageTemplateId =
    useWatch({ control, name: "packageTemplateId" }) ?? "";
  const watchedCourier = Number(useWatch({ control, name: "courierCharges" }) || 0);
  const watchedAdvance = Number(useWatch({ control, name: "advanceAmount" }) || 0);

  const itemTotals = useMemo(() => {
    const totalQty = watchedItems.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    );
    const totalAmount = watchedItems.reduce((sum, item) => {
      return sum + Number(item.quantity || 0) * Number(item.unitPrice || 0);
    }, 0);

    return {
      totalQty,
      totalAmount,
      balanceAmount: Math.max(totalAmount + watchedCourier - watchedAdvance, 0),
    };
  }, [watchedAdvance, watchedCourier, watchedItems]);

  React.useEffect(() => {
    watchedItems.forEach((item, index) => {
      const nextLineTotal =
        Number(item.quantity || 0) * Number(item.unitPrice || 0);

      if (Number(item.lineTotal || 0) !== nextLineTotal) {
        setValue(`items.${index}.lineTotal`, nextLineTotal, {
          shouldDirty: true,
          shouldValidate: false,
        });
      }
    });
  }, [setValue, watchedItems]);

  const blocksByCategory = useMemo(() => {
    const map = new Map<string, NonNullable<typeof customer>["customerBlocks"]>();

    customer?.customerBlocks?.forEach((assignment) => {
      const categoryId = assignment.block.category?.id;
      if (!categoryId) return;
      map.set(categoryId, [...(map.get(categoryId) ?? []), assignment]);
    });

    return map;
  }, [customer]);

  const measurementsByCategory = useMemo(() => {
    const map = new Map<string, NonNullable<typeof customer>["measurements"]>();

    customer?.measurements?.forEach((measurement) => {
      const categoryId = measurement.categoryId ?? measurement.category?.id;
      if (!categoryId) return;
      map.set(categoryId, [...(map.get(categoryId) ?? []), measurement]);
    });

    return map;
  }, [customer]);

  const coverageRows = useMemo(() => {
    return categories
      .filter((category) => category.isActive)
      .map((category) => ({
        category,
        blocks: blocksByCategory.get(category.id) ?? [],
        measurements: measurementsByCategory.get(category.id) ?? [],
      }));
  }, [blocksByCategory, categories, measurementsByCategory]);

  const selectedPackageTemplate = useMemo(() => {
    return (
      packageTemplates.find(
        (template) => template.id === watchedPackageTemplateId,
      ) ?? null
    );
  }, [packageTemplates, watchedPackageTemplateId]);

  const selectedTemplateItemIds = useMemo(() => {
    return new Set(
      watchedItems
        .map((item) => item.packageTemplateItemId)
        .filter((id): id is string => Boolean(id)),
    );
  }, [watchedItems]);

  const handleApplyPackage = (templateId: string) => {
    const template = packageTemplates.find((item) => item.id === templateId);
    if (!template) return;

    replace(
      template.items
        .filter((item) => !item.isOptional)
        .map((item) => {
          const defaultUnitPrice = Number(item.defaultUnitPrice ?? 0);
          const unitPrice =
            item.priceSource === "PACKAGE_INCLUDED_ITEM" ? 0 : defaultUnitPrice;

          return buildInitialItem({
            itemType: item.itemType,
            categoryId: item.categoryId ?? "",
            packageTemplateId: template.id,
            packageTemplateItemId: item.id,
            itemDescription: item.itemDescription,
            quantity: item.defaultQuantity,
            priceSource: item.priceSource,
            unitPrice,
            calculatedUnitPrice: defaultUnitPrice,
            notes: item.notes ?? "",
          });
        }),
    );
    setValue("packageTemplateId", template.id, {
      shouldDirty: true,
      shouldValidate: false,
    });
    setPricePreview(null);
  };

  const handleAddPackageTemplateItem = (
    template: PackageTemplate,
    itemId: string,
  ) => {
    const item = template.items.find((entry) => entry.id === itemId);
    if (!item) return;
    const defaultUnitPrice = Number(item.defaultUnitPrice ?? 0);
    const unitPrice =
      item.priceSource === "PACKAGE_INCLUDED_ITEM" ? 0 : defaultUnitPrice;

    append(
      buildInitialItem({
        itemType: item.itemType,
        categoryId: item.categoryId ?? "",
        packageTemplateId: template.id,
        packageTemplateItemId: item.id,
        itemDescription: item.itemDescription,
        quantity: item.defaultQuantity,
        priceSource: item.priceSource,
        unitPrice,
        calculatedUnitPrice: defaultUnitPrice,
        notes: item.notes ?? "",
      }),
    );
    setPricePreview(null);
  };

  const buildPayload = (values: OrderBuilderValues): CreateOrderPayload => ({
    customerId: values.customerId,
    groupOrderId: values.groupOrderId || undefined,
    packageTemplateId: values.packageTemplateId || undefined,
    orderNumber: values.orderNumber || undefined,
    orderDate: toIsoDateString(values.orderDate),
    promisedDate: toIsoDateString(values.promisedDate),
    status: values.status as OrderStatus,
    orderSource: values.orderSource as OrderSource,
    paymentStatus: values.paymentStatus as PaymentStatus,
    paymentMode: values.paymentMode as OrderPaymentMode,
    hospitalName: customer?.hospitalName ?? undefined,
    town: customer?.town ?? undefined,
    customerAddress: customer?.address ?? undefined,
    advanceAmount: Number(values.advanceAmount || 0),
    courierCharges: Number(values.courierCharges || 0),
    notes: values.notes || undefined,
    specialNotes: values.specialNotes || undefined,
    items: values.items.map((item) => ({
      itemType: item.itemType as OrderItemType,
      categoryId: item.categoryId || undefined,
      packageTemplateId: item.packageTemplateId || values.packageTemplateId || undefined,
      packageTemplateItemId: item.packageTemplateItemId || undefined,
      blockId: item.blockId || undefined,
      measurementId: item.measurementId || undefined,
      itemDescription: item.itemDescription,
      quantity: Number(item.quantity || 1),
      calculatedUnitPrice: Number(item.calculatedUnitPrice || item.unitPrice || 0),
      unitPrice: Number(item.unitPrice || 0),
      priceSource: item.priceSource as PriceSource,
      isPriceOverridden:
        Boolean(item.isPriceOverridden) ||
        item.priceSource === "MANUAL_OVERRIDE",
      overrideReason: item.overrideReason || undefined,
      notes: item.notes || undefined,
      tailorNote: item.tailorNote || undefined,
      status: item.status as OrderItemStatus,
    })),
  });

  const handlePricePreview = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const payload = buildPayload(form.getValues() as OrderBuilderValues);

    try {
      const preview = await pricePreviewMutation.mutateAsync({
        customerId: payload.customerId,
        packageTemplateId: payload.packageTemplateId,
        courierCharges: payload.courierCharges,
        items: payload.items,
      });
      setPricePreview(preview);
      toast.success("Price preview updated.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not preview price.";
      toast.error(message);
    }
  };

  const handleNextStep = async () => {
    const fieldsByStep: Record<number, Array<keyof OrderBuilderValues>> = {
      1: ["customerId", "orderDate", "promisedDate", "orderSource", "paymentMode"],
      2: ["orderMode"],
      3: ["items"],
      4: ["items"],
      5: ["items", "courierCharges", "advanceAmount"],
      6: [],
    };
    const fieldsToValidate = fieldsByStep[activeStep] ?? [];
    const isValid = fieldsToValidate.length
      ? await form.trigger(fieldsToValidate as any)
      : true;

    if (!isValid) return;
    setActiveStep((step) => Math.min(step + 1, BUILDER_STEPS.length));
  };

  const handlePreviousStep = () => {
    setActiveStep((step) => Math.max(step - 1, 1));
  };

  const submitOrder = async (values: OrderBuilderValues) => {
    const payload = buildPayload(values);

    try {
      await createOrderMutation.mutateAsync(payload);
      await onSubmit?.(payload);
      toast.success("Order saved successfully.");
      navigate({ to: "/app/orders" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Order could not be saved.";
      toast.error(message);
    }
  };

  const isSubmitting = createOrderMutation.isPending;

  if (!prefill?.customerId) {
    return (
      <div className="min-h-screen bg-slate-50/60 p-6">
        <Card className="mx-auto max-w-xl rounded-lg border-slate-200 bg-white">
          <CardContent className="p-6 text-center">
            <UserRound className="mx-auto h-8 w-8 text-slate-400" />
            <h1 className="mt-3 text-lg font-bold text-slate-900">
              Select a customer first
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Start orders from the dashboard customer workspace so block and
              measurement coverage can be checked first.
            </p>
            <Button asChild className="mt-4 rounded-lg bg-slate-900">
              <Link to="/app/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitOrder)}>
          <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
              <div className="flex min-w-0 items-start gap-3">
                <Button asChild variant="outline" size="icon" className="mt-1 rounded-lg">
                  <Link to="/app/orders">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      Order Builder
                    </h1>
                    <Badge className="rounded-full bg-slate-900 text-white hover:bg-slate-900">
                      Multi item
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Build uniform sets, extra garments, and accessories with
                    block and measurement assigned per item.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg"
                  disabled={pricePreviewMutation.isPending || isCustomerLoading}
                  onClick={handlePricePreview}
                >
                  {pricePreviewMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Banknote className="mr-2 h-4 w-4" />
                  )}
                  Price Preview
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isCustomerLoading}
                  className="rounded-lg bg-slate-900 hover:bg-slate-800"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Order
                </Button>
              </div>
            </div>
            <BuilderStepNav
              activeStep={activeStep}
              onStepChange={setActiveStep}
            />
          </div>

          <main className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[1fr_360px] lg:px-6">
            <div className="space-y-5">
              {activeStep === 1 && (
              <SectionCard
                title="Step 1: Customer & Order Details"
                description="The customer comes from dashboard search. Order totals are recalculated on the backend."
                icon={UserRound}
              >
                {isCustomerLoading ? (
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading customer...
                  </div>
                ) : isCustomerError || !customer ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                    Customer could not be loaded.
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 md:col-span-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Customer
                      </p>
                      <p className="mt-1 text-base font-black text-slate-900">
                        {customer.fullName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {customer.phoneNumber ?? "-"} · {customer.town ?? "-"}
                      </p>
                    </div>

                    <FormField
                      control={control}
                      name="orderDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Date</FormLabel>
                          <FormControl>
                            <Input className="rounded-lg" type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="promisedDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Promise Date</FormLabel>
                          <FormControl>
                            <Input className="rounded-lg" type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="orderNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order No</FormLabel>
                          <FormControl>
                            <Input className="rounded-lg" placeholder="Auto" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="orderSource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source</FormLabel>
                          <FormControl>
                            <SelectInput {...field}>
                              {ORDER_SOURCE_OPTIONS.map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </SelectInput>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="paymentMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment</FormLabel>
                          <FormControl>
                            <SelectInput {...field}>
                              {PAYMENT_MODE_OPTIONS.map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </SelectInput>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="groupOrderId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Order ID</FormLabel>
                          <FormControl>
                            <Input className="rounded-lg" placeholder="Optional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </SectionCard>
              )}

              {activeStep === 2 && (
              <SectionCard
                title="Step 2: Choose Order Type"
                description="Pick the working mode for this customer job."
                icon={ClipboardList}
              >
                <FormField
                  control={control}
                  name="orderMode"
                  render={({ field }) => (
                    <div className="grid gap-3 md:grid-cols-3">
                      {ORDER_MODES.map((mode) => (
                        <button
                          key={mode.value}
                          type="button"
                          className={cn(
                            "rounded-lg border p-4 text-left transition",
                            field.value === mode.value
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white hover:bg-slate-50",
                          )}
                          onClick={() => field.onChange(mode.value)}
                        >
                          <p className="text-sm font-black">{mode.label}</p>
                          <p
                            className={cn(
                              "mt-1 text-xs leading-5",
                              field.value === mode.value
                                ? "text-slate-200"
                                : "text-slate-500",
                            )}
                          >
                            {mode.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                />
              </SectionCard>
              )}

              {activeStep === 3 && (
              <SectionCard
                title="Step 3: Select Uniform Set / Package Items"
                description="Use owner-defined garment sets, then add optional or extra items."
                icon={Package2}
              >
                {isPackageTemplatesLoading ? (
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading garment sets...
                  </div>
                ) : !packageTemplates.length ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                    <p className="text-sm font-bold text-slate-900">
                      No garment sets created yet
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Create sets like Nurse Full Kit from the Garment Sets page.
                    </p>
                    <Button asChild variant="outline" className="mt-3 rounded-lg">
                      <Link to="/app/package-templates">Manage Garment Sets</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      {packageTemplates.map((template) => (
                        <div
                          key={template.id}
                          className={cn(
                            "rounded-lg border p-4",
                            watchedPackageTemplateId === template.id
                              ? "border-slate-900 bg-slate-50"
                              : "border-slate-200 bg-white",
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-slate-900">
                                {template.name}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {template.description ?? "No description"}
                              </p>
                          <p className="mt-2 text-xs font-bold text-slate-700">
                            Package price Rs. {formatMoney(template.packagePrice)}
                          </p>
                          {watchedPackageTemplateId === template.id && (
                            <p className="mt-1 text-xs font-semibold text-emerald-700">
                              This set price is added in backend price preview.
                            </p>
                          )}
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant={
                                watchedPackageTemplateId === template.id
                                  ? "default"
                                  : "outline"
                              }
                              className="rounded-lg"
                              onClick={() => handleApplyPackage(template.id)}
                            >
                              Use Set
                            </Button>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {template.items.map((item) => (
                              <Badge
                                key={item.id}
                                className={cn(
                                  "rounded-full",
                                  item.isOptional
                                    ? "bg-amber-50 text-amber-700 hover:bg-amber-50"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-100",
                                )}
                              >
                                {item.itemDescription}
                                {item.isOptional ? " · Optional" : ""}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedPackageTemplate && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-sm font-black text-slate-900">
                          Optional / extra items
                        </p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {selectedPackageTemplate.items
                            .filter((item) => item.isOptional)
                            .map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
                              >
                                <div>
                                  <p className="text-sm font-bold text-slate-900">
                                    {item.itemDescription}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {PRICE_SOURCE_LABELS[item.priceSource]} · Qty{" "}
                                    {item.defaultQuantity}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="rounded-lg"
                                  disabled={selectedTemplateItemIds.has(item.id)}
                                  onClick={() =>
                                    handleAddPackageTemplateItem(
                                      selectedPackageTemplate,
                                      item.id,
                                    )
                                  }
                                >
                                  Add
                                </Button>
                              </div>
                            ))}
                          {selectedPackageTemplate.items.every(
                            (item) => !item.isOptional,
                          ) && (
                            <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                              This set has no optional items.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </SectionCard>
              )}

              {activeStep === 4 && (
              <SectionCard
                title="Step 4: Assign Block & Measurement Per Item"
                description="Garments can use different block numbers. Accessories do not need measurements."
                icon={Ruler}
                action={
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={() =>
                        append(
                          buildInitialItem({
                            itemType: "GARMENT",
                            priceSource: "ADDITIONAL_ITEM_PRICE",
                          }),
                        )
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Garment
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={() =>
                        append(
                          buildInitialItem({
                            itemType: "ACCESSORY",
                            itemDescription: "Accessory",
                            priceSource: "ADDITIONAL_ITEM_PRICE",
                          }),
                        )
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Accessory
                    </Button>
                  </div>
                }
              >
                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const item = watchedItems[index];
                    const itemType = (item?.itemType ?? "GARMENT") as OrderItemType;
                    const categoryId = item?.categoryId ?? "";
                    const blockOptions = categoryId
                      ? blocksByCategory.get(categoryId) ?? []
                      : [];
                    const measurementOptions = categoryId
                      ? measurementsByCategory.get(categoryId) ?? []
                      : [];
                    const noMeasurementRequired =
                      itemType === "ACCESSORY" ||
                      itemType === "PACKAGE" ||
                      itemType === "SERVICE";

                    return (
                      <div
                        key={field.id}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700">
                              {itemType === "ACCESSORY" ? (
                                <Package2 className="h-4 w-4" />
                              ) : (
                                <Shirt className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">
                                Item {index + 1}
                              </p>
                              <p className="text-xs text-slate-500">
                                {noMeasurementRequired
                                  ? "No measurement required"
                                  : "Assign category, block and measurement"}
                              </p>
                            </div>
                          </div>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="rounded-lg text-red-500"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-3 md:grid-cols-4">
                          <FormField
                            control={control}
                            name={`items.${index}.itemType`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type</FormLabel>
                                <FormControl>
                                  <SelectInput
                                    {...field}
                                    onChange={(event) => {
                                      field.onChange(event);
                                      if (
                                        event.target.value === "ACCESSORY" ||
                                        event.target.value === "PACKAGE" ||
                                        event.target.value === "SERVICE"
                                      ) {
                                        setValue(`items.${index}.categoryId`, "");
                                        setValue(`items.${index}.blockId`, "");
                                        setValue(`items.${index}.measurementId`, "");
                                      }
                                    }}
                                  >
                                    <option value="GARMENT">Garment</option>
                                    <option value="ACCESSORY">Accessory</option>
                                    <option value="PACKAGE">Package</option>
                                    <option value="SERVICE">Service</option>
                                  </SelectInput>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name={`items.${index}.categoryId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Garment Part</FormLabel>
                                <FormControl>
                                  <SelectInput
                                    {...field}
                                    disabled={noMeasurementRequired || isCategoriesLoading}
                                    onChange={(event) => {
                                      field.onChange(event);
                                      const nextCategoryId = event.target.value;
                                      const nextBlock =
                                        blocksByCategory.get(nextCategoryId)?.[0]
                                          ?.block.id ?? "";
                                      const nextMeasurement =
                                        measurementsByCategory.get(
                                          nextCategoryId,
                                        )?.[0]?.id ?? "";

                                      setValue(
                                        `items.${index}.blockId`,
                                        nextBlock,
                                        { shouldDirty: true },
                                      );
                                      setValue(
                                        `items.${index}.measurementId`,
                                        nextMeasurement,
                                        { shouldDirty: true },
                                      );
                                    }}
                                  >
                                    <option value="">
                                      {noMeasurementRequired
                                        ? "Not required"
                                        : "Select part"}
                                    </option>
                                    {categories
                                      .filter((category) => category.isActive)
                                      .map((category) => (
                                        <option key={category.id} value={category.id}>
                                          {category.name}
                                        </option>
                                      ))}
                                  </SelectInput>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name={`items.${index}.itemDescription`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Input className="rounded-lg" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Qty</FormLabel>
                                <FormControl>
                                  <Input className="rounded-lg" type="number" min={1} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name={`items.${index}.blockId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Block No</FormLabel>
                                <FormControl>
                                  <SelectInput disabled={noMeasurementRequired || !categoryId} {...field}>
                                    <option value="">
                                      {noMeasurementRequired
                                        ? "No block required"
                                        : blockOptions.length
                                          ? "Select block"
                                          : "No block"}
                                    </option>
                                    {blockOptions.map((assignment) => (
                                      <option
                                        key={assignment.block.id}
                                        value={assignment.block.id}
                                      >
                                        {assignment.block.blockNumber}
                                        {assignment.isDefault ? " · Default" : ""}
                                      </option>
                                    ))}
                                  </SelectInput>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name={`items.${index}.measurementId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Measurement</FormLabel>
                                <FormControl>
                                  <SelectInput disabled={noMeasurementRequired || !categoryId} {...field}>
                                    <option value="">
                                      {noMeasurementRequired
                                        ? "No measurement required"
                                        : measurementOptions.length
                                          ? "Select measurement"
                                          : "Create if missing"}
                                    </option>
                                    {measurementOptions.map((measurement) => (
                                      <option key={measurement.id} value={measurement.id}>
                                        {measurement.measurementNumber}
                                        {measurement.block?.blockNumber
                                          ? ` · ${measurement.block.blockNumber}`
                                          : ""}
                                      </option>
                                    ))}
                                  </SelectInput>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name={`items.${index}.unitPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit Price</FormLabel>
                                <FormControl>
                                  <Input className="rounded-lg" type="number" min={0} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name={`items.${index}.priceSource`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price Source</FormLabel>
                                <FormControl>
                                  <SelectInput {...field}>
                                    {Object.entries(PRICE_SOURCE_LABELS).map(
                                      ([value, label]) => (
                                        <option key={value} value={value}>
                                          {label}
                                        </option>
                                      ),
                                    )}
                                  </SelectInput>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {(item?.priceSource === "MANUAL_OVERRIDE" ||
                            item?.isPriceOverridden) && (
                            <FormField
                              control={control}
                              name={`items.${index}.overrideReason`}
                              render={({ field }) => (
                                <FormItem className="md:col-span-4">
                                  <FormLabel>Override Reason</FormLabel>
                                  <FormControl>
                                    <Input
                                      className="rounded-lg"
                                      placeholder="Reason is required for manual price"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          <FormField
                            control={control}
                            name={`items.${index}.tailorNote`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Tailor Note</FormLabel>
                                <FormControl>
                                  <Input
                                    className="rounded-lg"
                                    placeholder="Cutting or stitch note"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name={`items.${index}.notes`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Item Note</FormLabel>
                                <FormControl>
                                  <Input
                                    className="rounded-lg"
                                    placeholder="Customer request"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
              )}

              {activeStep === 5 && (
              <SectionCard
                title="Step 5: Price Preview"
                description="Preview uses the backend calculation endpoint and shows warnings before confirmation."
                icon={Banknote}
              >
                {!pricePreview ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-semibold text-slate-500">
                    Click Price Preview after selecting items.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pricePreview.warnings.length > 0 && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        {pricePreview.warnings.map((warning) => (
                          <p key={warning}>{warning}</p>
                        ))}
                      </div>
                    )}
                    {pricePreview.items.map((item) => (
                      <div
                        key={`${item.index}-${item.itemDescription}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
                      >
                        <div>
                          <p className="text-sm font-black text-slate-900">
                            {item.itemDescription}
                          </p>
                          <p className="text-xs text-slate-500">
                            {PRICE_SOURCE_LABELS[item.priceSource]} · Qty{" "}
                            {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-black text-slate-900">
                          Rs. {formatMoney(item.lineTotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
              )}

              {activeStep === 6 && (
              <SectionCard
                title="Step 6: Confirm Order"
                description="Review the selected parts and final notes before saving."
                icon={CheckCircle2}
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField
                    control={control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Note</FormLabel>
                        <FormControl>
                          <Textarea className="min-h-24 rounded-lg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="specialNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Notes</FormLabel>
                        <FormControl>
                          <Textarea className="min-h-24 rounded-lg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </SectionCard>
              )}

              <StepFooter
                activeStep={activeStep}
                onPrevious={handlePreviousStep}
                onNext={handleNextStep}
                onPreview={handlePricePreview}
                onSave={() => form.handleSubmit(submitOrder)()}
                isPreviewing={pricePreviewMutation.isPending}
                isSubmitting={isSubmitting}
              />
            </div>

            <aside className="space-y-5 lg:sticky lg:top-36 lg:self-start">
              <SectionCard title="Coverage" icon={Ruler}>
                <div className="space-y-2">
                  {coverageRows.slice(0, 8).map((row) => (
                    <div
                      key={row.category.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {row.category.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {row.blocks[0]?.block.blockNumber ?? "No block"}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          "rounded-full",
                          row.measurements.length
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-50",
                        )}
                      >
                        {row.measurements.length ? "Measured" : "Missing"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Payment Summary" icon={Banknote}>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-bold uppercase text-slate-400">
                        Items
                      </p>
                      <p className="mt-1 text-lg font-black text-slate-900">
                        {watchedItems.length}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-bold uppercase text-slate-400">
                        Qty
                      </p>
                      <p className="mt-1 text-lg font-black text-slate-900">
                        {itemTotals.totalQty}
                      </p>
                    </div>
                  </div>

                  <FormField
                    control={control}
                    name="courierCharges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Courier Charges</FormLabel>
                        <FormControl>
                          <Input className="rounded-lg" type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="advanceAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Advance Amount</FormLabel>
                        <FormControl>
                          <Input className="rounded-lg" type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-lg border border-slate-200 bg-slate-900 p-4 text-white">
                    <p className="text-xs font-bold uppercase text-slate-300">
                      Final Total
                    </p>
                    <p className="mt-1 text-2xl font-black">
                      Rs.{" "}
                      {formatMoney(
                        pricePreview?.payableAmount ??
                          itemTotals.totalAmount + watchedCourier,
                      )}
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      Balance Rs.{" "}
                      {formatMoney(
                        Math.max(
                          (pricePreview?.payableAmount ??
                            itemTotals.totalAmount + watchedCourier) -
                            watchedAdvance,
                          0,
                        ),
                      )}
                    </p>
                  </div>
                </div>
              </SectionCard>
            </aside>
          </main>
        </form>
      </Form>
    </div>
  );
}

export default CreateOrderPage;
