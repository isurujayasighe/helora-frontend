"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  useForm,
  useWatch,
  type FieldErrors,
  type SubmitHandler,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  ClipboardList,
  Loader2,
  Printer,
  Ruler,
  Save,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";

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

import { type CustomerByPhone } from "@/api/useFindCustomerByPhone";
import { useGetCustomerById } from "@/modules/app/customers/api/useGetCustomerbyId";
import { useGetMeasurementById } from "@/api/useGetLatestMeasurement";
import {
  useGetBlockLinkCandidates,
  type BlockLinkCandidate,
} from "@/api/useGetBlockLinkCandidates";
import {
  useCreateOrder,
  type CreateOrderPayload,
  type OrderItemStatus,
  type OrderPaymentMode,
  type OrderSource,
  type OrderStatus,
  type PaymentStatus,
} from "@/api/useCreateOrder";

import {
  MeasurementFields,
  type MeasurementFieldConfig,
} from "@/components/layout/components/measurements-fields";
import { generateOrderPdf } from "@/utils/generate-order-pdf";

import { useGetCategories } from "@/api/useGetCategories";
import {
  useMeasurementFieldsQuery,
  type MeasurementField,
  type MeasurementFieldsResponse,
} from "@/modules/app/measurements/api/useGetMeasurementsFieldsByCID";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerPhoneLookupField } from "@/components/layout/components/customer-phone-lookup-field";

/* ------------------------------------------------------------------ */
/* Validation                                                         */
/* ------------------------------------------------------------------ */

const measurementValuesSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.undefined(), z.null()]),
);

const orderItemSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  blockId: z.string().optional(),
  measurementId: z.string().optional(),
  itemDescription: z.string().min(1, "Item description is required"),
  quantity: z.coerce.number().min(1, "Qty must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price must be 0 or more"),
  lineTotal: z.coerce.number().min(0),
  notes: z.string().optional(),
  tailorNote: z.string().optional(),
  status: z
    .enum(["PENDING", "CUTTING", "SEWING", "READY", "DELIVERED", "CANCELLED"])
    .default("PENDING"),
  blockMode: z
    .enum(["existing", "measurement-only"])
    .default("measurement-only"),
  measurements: measurementValuesSchema.default({}),
  measurementNote: z.string().optional(),
});

const formSchema = z.object({
  phoneNumber: z.string().min(7, "Phone number is required"),
  customerMode: z.enum(["existing", "new"]).default("existing"),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerTown: z.string().optional(),
  customerAddress: z.string().optional(),
  customerNotes: z.string().optional(),
  hospitalName: z.string().optional(),
  groupOrderId: z.string().optional(),

  orderNumber: z.string().optional(),
  orderDate: z.string().min(1, "Order date is required"),
  promisedDate: z.string().min(1, "Promised date is required"),
  completedAt: z.string().optional(),
  deliveredAt: z.string().optional(),

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

  totalQty: z.coerce.number().min(0).default(0),
  totalAmount: z.coerce.number().min(0).default(0),
  advanceAmount: z.coerce.number().min(0).default(0),
  balanceAmount: z.coerce.number().min(0).default(0),
  courierCharges: z.coerce.number().min(0).default(0),

  notes: z.string().optional(),
  specialNotes: z.string().optional(),

  items: z.array(orderItemSchema).length(1, "Only one order item is supported"),
});

type CreateOrderFormInput = z.input<typeof formSchema>;
type CreateOrderFormValues = z.output<typeof formSchema>;

type CategoryOption = {
  id: string;
  name: string;
  isActive?: boolean;
};

type CreateOrderPrefill = {
  customerId?: string;
  measurementId?: string;
  blockId?: string;
  categoryId?: string;
};

type CreateOrderPageProps = {
  prefill?: CreateOrderPrefill;
  onSubmit?: (payload: CreateOrderPayload) => Promise<void> | void;
};

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const ORDER_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CUTTING", label: "Cutting" },
  { value: "SEWING", label: "Sewing" },
  { value: "READY", label: "Ready" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

const ORDER_ITEM_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "CUTTING", label: "Cutting" },
  { value: "SEWING", label: "Sewing" },
  { value: "READY", label: "Ready" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

const ORDER_SOURCE_OPTIONS = [
  { value: "PHYSICAL_SHOP", label: "Physical Shop" },
  { value: "PHONE_CALL", label: "Phone Call" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "DREZAURA", label: "Drezaura" },
  { value: "ONLINE", label: "Online" },
] as const;

const PAYMENT_STATUS_OPTIONS = [
  { value: "UNPAID", label: "Unpaid" },
  { value: "ADVANCE_PAID", label: "Advance Paid" },
  { value: "PARTIALLY_PAID", label: "Partially Paid" },
  { value: "PAID", label: "Paid" },
  { value: "REFUNDED", label: "Refunded" },
] as const;

const PAYMENT_MODE_OPTIONS = [
  { value: "CASH", label: "Cash" },
  { value: "ONLINE_TRANSFER", label: "Online Transfer" },
  { value: "BANK_DEPOSIT", label: "Bank Deposit" },
  { value: "CARD", label: "Card" },
  { value: "MIXED", label: "Mixed" },
] as const;

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

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

function toMeasurementStringValue(
  value: string | null | undefined,
  numericValue: string | number | null | undefined,
) {
  return value ?? (numericValue != null ? String(numericValue) : "");
}

function buildMeasurementMap(
  values:
    | Array<{
        value: string | null;
        numericValue: string | number | null;
        field: { code: string };
      }>
    | undefined,
) {
  if (!values?.length) return {};

  return values.reduce<Record<string, string>>((result, item) => {
    result[item.field.code] = toMeasurementStringValue(
      item.value,
      item.numericValue,
    );

    return result;
  }, {});
}

function buildMeasurementFieldsFromApi(
  values:
    | Array<{
        field: {
          code: string;
          label: string;
          unit: string | null;
          sortOrder: number;
        };
      }>
    | undefined,
): MeasurementFieldConfig[] {
  if (!values?.length) return [];

  return [...values]
    .sort((a, b) => a.field.sortOrder - b.field.sortOrder)
    .map((item) => ({
      key: item.field.code,
      label: item.field.label,
      unit: item.field.unit ?? undefined,
    }));
}

function hasMeasurementValues(values?: Record<string, unknown>) {
  if (!values) return false;

  return Object.values(values).some(
    (value) => value !== undefined && value !== null && value !== "",
  );
}

function getFirstFieldErrorMessage(errors: unknown): string | undefined {
  if (!errors || typeof errors !== "object") return undefined;

  const message = (errors as { message?: unknown }).message;
  if (typeof message === "string" && message.trim()) return message;

  for (const [key, value] of Object.entries(
    errors as Record<string, unknown>,
  )) {
    if (key === "ref") continue;

    const nestedMessage = getFirstFieldErrorMessage(value);
    if (nestedMessage) return nestedMessage;
  }

  return undefined;
}

function getSubmitErrorMessage(error: unknown) {
  const responseData = (
    error as {
      response?: {
        data?: {
          message?: unknown;
          error?: unknown;
          errors?: unknown;
        };
      };
    }
  )?.response?.data;

  if (Array.isArray(responseData?.errors)) {
    const messages = responseData.errors.filter(
      (item): item is string => typeof item === "string" && Boolean(item),
    );

    if (messages.length) return messages.join(", ");
  }

  if (typeof responseData?.message === "string" && responseData.message) {
    return responseData.message;
  }

  if (typeof responseData?.error === "string" && responseData.error) {
    return responseData.error;
  }

  if (error instanceof Error && error.message) return error.message;

  return "Order could not be saved. Please check the order details and try again.";
}

function normalizeMeasurementValues(
  values?: Record<string, string | number | null | undefined>,
): Record<string, string | number | undefined> {
  if (!values) return {};

  return Object.entries(values).reduce<
    Record<string, string | number | undefined>
  >((result, [key, value]) => {
    result[key] = value === null ? undefined : value;
    return result;
  }, {});
}

function getMeasurementFieldRows(
  response?: MeasurementFieldsResponse | MeasurementField[],
): MeasurementField[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

function mapMeasurementFieldsToConfig(
  fields: MeasurementField[],
): MeasurementFieldConfig[] {
  return [...fields]
    .filter((field) => field.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((field) => ({
      key: field.code,
      label: field.label,
      unit: field.unit ?? undefined,
    }));
}

function mapCustomerDetailsToCustomerByPhone(customer: any): CustomerByPhone {
  const blocks =
    customer.blocks ??
    customer.customerBlocks?.map((assignment: any) => ({
      ...assignment.block,
      isDefault: assignment.isDefault,
      assignedAt: assignment.assignedAt,
      measurement: assignment.measurement ?? null,
    })) ??
    [];

  return {
    id: customer.id,
    fullName: customer.fullName ?? "",
    phoneNumber: customer.phoneNumber ?? "",
    alternatePhone: customer.alternatePhone ?? null,
    town: customer.town ?? null,
    address: customer.address ?? null,
    notes: customer.notes ?? null,
    hospitalName: customer.hospitalName ?? null,
    blocks:
      blocks.map((block: any) => ({
        ...block,
        tenantId: block.tenantId ?? "",
        customerId: block.customerId ?? customer.id,
        categoryId: block.categoryId ?? block.category?.id ?? "",
        category: block.category ?? null,
        sizeLabel: block.sizeLabel ?? null,
        readyMadeSize: block.readyMadeSize ?? null,
        fitNotes: block.fitNotes ?? null,
        description: block.description ?? null,
        remarks: block.remarks ?? null,
      })) ?? [],
  } as CustomerByPhone;
}

function mapPrefillMeasurementToCustomerByPhone(
  measurement: any,
): CustomerByPhone {
  const customer = measurement.customer;

  return {
    id: customer?.id ?? measurement.customerId,
    fullName: customer?.fullName ?? "",
    phoneNumber: customer?.phoneNumber ?? "",
    alternatePhone: customer?.alternatePhone ?? null,
    town: customer?.town ?? null,
    address: customer?.address ?? null,
    notes: customer?.notes ?? null,
    hospitalName: customer?.hospitalName ?? null,
    blocks: measurement.block
      ? [
          {
            ...measurement.block,
            tenantId: measurement.block.tenantId ?? "",
            customerId: measurement.block.customerId ?? measurement.customerId,
            categoryId: measurement.categoryId,
            category:
              measurement.category ?? measurement.block.category ?? null,
            isDefault: true,
            sizeLabel: measurement.block.sizeLabel ?? null,
            readyMadeSize: measurement.block.readyMadeSize ?? null,
            fitNotes: measurement.block.fitNotes ?? null,
            description: measurement.block.description ?? null,
            remarks: measurement.block.remarks ?? null,
          },
        ]
      : [],
  } as CustomerByPhone;
}

function mapBlockLinkCandidatesToCustomerBlocks(
  blocks: BlockLinkCandidate[],
): CustomerByPhone["blocks"] {
  return blocks.map((block) => {
    const defaultLink =
      block.customerLinks.find((link) => link.isDefault) ??
      block.customerLinks[0];

    return {
      id: block.id,
      tenantId: "",
      customerId: defaultLink?.customerId ?? "",
      categoryId: block.categoryId,
      blockNumber: block.blockNumber,
      readyMadeSize: block.readyMadeSize,
      sizeLabel: block.sizeLabel,
      fitNotes: block.fitNotes,
      versionNo: block.versionNo,
      description: block.description,
      status: block.status,
      isDefault: defaultLink?.isDefault ?? false,
      lastUsedAt: block.lastUsedAt,
      remarks: block.remarks,
      category: {
        id: block.categoryId,
        tenantId: "",
        name: block.categoryName,
      },
    };
  });
}

const buildInitialItem = (): CreateOrderFormInput["items"][number] => ({
  categoryId: "",
  blockId: "",
  measurementId: "",
  itemDescription: "",
  quantity: 1,
  unitPrice: 0,
  lineTotal: 0,
  notes: "",
  tailorNote: "",
  status: "PENDING",
  blockMode: "measurement-only",
  measurements: {},
  measurementNote: "Measurements taken while placing order.",
});

const buildInitialValues = (): CreateOrderFormInput => ({
  phoneNumber: "",
  customerMode: "existing",
  customerId: "",
  customerName: "",
  customerTown: "",
  customerAddress: "",
  customerNotes: "",
  hospitalName: "",
  groupOrderId: "",
  orderNumber: "",
  orderDate: todayInputValue(),
  promisedDate: addDaysInputValue(7),
  completedAt: "",
  deliveredAt: "",
  status: "PENDING",
  orderSource: "PHYSICAL_SHOP",
  paymentStatus: "UNPAID",
  paymentMode: "CASH",
  totalQty: 1,
  totalAmount: 0,
  advanceAmount: 0,
  balanceAmount: 0,
  courierCharges: 0,
  notes: "",
  specialNotes: "",
  items: [buildInitialItem()],
});

/* ------------------------------------------------------------------ */
/* Shared UI                                                          */
/* ------------------------------------------------------------------ */

function PageHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <Button
          asChild
          variant="outline"
          size="icon"
          className="mt-1 rounded-lg"
        >
          <Link to="/app/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create Order
            </h1>

            <Badge className="rounded-full bg-slate-900 text-white hover:bg-slate-900">
              Single item order
            </Badge>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Create one order item with quantity, price, and category-based
            measurements.
          </p>
        </div>
      </div>
    </div>
  );
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
              <p className="mt-1 text-xs text-slate-500">{description}</p>
            )}
          </div>
        </div>

        {action}
      </CardHeader>

      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

function SummaryMetric({
  label,
  value,
  strong,
}: {
  label: string;
  value: string | number;
  strong?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p
        className={cn(
          "mt-1 text-sm font-bold",
          strong ? "text-slate-950" : "text-slate-700",
        )}
      >
        {value}
      </p>
    </div>
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

/* ------------------------------------------------------------------ */
/* PDF                                                                */
/* ------------------------------------------------------------------ */

function generateDraftOrderPdf(
  values: CreateOrderFormInput,
  foundCustomer?: CustomerByPhone | null,
  categories: CategoryOption[] = [],
) {
  const item = values.items[0];

  const matchedCustomerName =
    foundCustomer?.fullName || values.customerName || "-";

  const matchedBlock =
    item.blockMode === "existing"
      ? foundCustomer?.blocks?.find((block) => block.id === item.blockId)
      : null;

  const matchedCategory = categories.find(
    (category) => category.id === item.categoryId,
  );

  const draftOrder = {
    id: "draft-order",
    tenantId: "",
    customerId: values.customerId || "",
    groupOrderId: values.groupOrderId || null,
    orderNumber: values.orderNumber || "DRAFT",
    orderDate: values.orderDate,
    promisedDate: values.promisedDate,
    status: values.status,
    orderSource: values.orderSource,
    paymentStatus: values.paymentStatus,
    paymentMode: values.paymentMode,
    hospitalName: values.hospitalName,
    town: values.customerTown,
    customerAddress: values.customerAddress,
    notes: values.notes,
    specialNotes: values.specialNotes,
    totalQty: values.totalQty,
    totalAmount: values.totalAmount,
    advanceAmount: values.advanceAmount,
    balanceAmount: values.balanceAmount,
    courierCharges: values.courierCharges,
    customer: {
      id: values.customerId || "draft-customer",
      tenantId: "",
      fullName: matchedCustomerName,
      alternatePhone: foundCustomer?.alternatePhone || null,
      town: foundCustomer?.town || values.customerTown || "-",
      address: foundCustomer?.address || values.customerAddress || "-",
      notes: foundCustomer?.notes || values.customerNotes || "-",
      hospitalName: values.hospitalName || null,
    },
    items: [
      {
        id: "draft-item-1",
        orderId: "draft-order",
        categoryId: item.categoryId,
        blockId: item.blockMode === "existing" ? item.blockId || null : null,
        measurementId: item.measurementId || null,
        itemDescription: item.itemDescription,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        notes: item.notes,
        tailorNote: item.tailorNote,
        status: item.status,
        measurements: item.measurements ?? {},
        measurementNote: item.measurementNote,
        category: matchedCategory
          ? { id: matchedCategory.id, name: matchedCategory.name }
          : { id: item.categoryId, name: "-" },
        block: matchedBlock
          ? {
              id: matchedBlock.id,
              blockNumber: matchedBlock.blockNumber,
              versionNo: matchedBlock.versionNo,
              sizeLabel: matchedBlock.sizeLabel,
              readyMadeSize: matchedBlock.readyMadeSize,
              fitNotes: matchedBlock.fitNotes,
              status: matchedBlock.status,
              isDefault: matchedBlock.isDefault,
              description: matchedBlock.description,
              remarks: matchedBlock.remarks,
            }
          : null,
      },
    ],
    _count: {
      items: 1,
    },
  };

  generateOrderPdf(draftOrder as any);
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export function CreateOrderPage({ prefill, onSubmit }: CreateOrderPageProps) {
  const navigate = useNavigate();

  const [foundCustomer, setFoundCustomer] = useState<CustomerByPhone | null>(
    null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isPrefillFlow = Boolean(prefill?.customerId);
  const hasMeasurementPrefill = Boolean(prefill?.measurementId);

  const createOrderMutation = useCreateOrder();

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useGetCategories();

  const { data: prefillMeasurement, isLoading: isPrefillMeasurementLoading } =
    useGetMeasurementById({
      measurementId: prefill?.measurementId,
      enabled: hasMeasurementPrefill,
    });

  const { data: prefilledCustomer, isLoading: isPrefilledCustomerLoading } =
    useGetCustomerById(
      prefill?.customerId,
      isPrefillFlow && !hasMeasurementPrefill,
    );

  const activeCategories = useMemo<CategoryOption[]>(() => {
    return categories
      .filter((category) => category.isActive)
      .map((category) => ({
        id: category.id,
        name: category.name,
        isActive: category.isActive,
      }));
  }, [categories]);

  const prefillCategory = prefillMeasurement?.category;

  const categoriesForForm = useMemo<CategoryOption[]>(() => {
    if (!prefillCategory) return activeCategories;

    const exists = activeCategories.some(
      (category) => category.id === prefillCategory.id,
    );

    if (exists) return activeCategories;

    return [
      {
        id: prefillCategory.id,
        name: prefillCategory.name,
        isActive: true,
      },
      ...activeCategories,
    ];
  }, [activeCategories, prefillCategory]);

  const prefillMeasurementFields = useMemo(
    () => buildMeasurementFieldsFromApi(prefillMeasurement?.values),
    [prefillMeasurement?.values],
  );

  const form = useForm<CreateOrderFormInput, any, CreateOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: buildInitialValues(),
  });

  const { control, setValue, getValues, reset } = form;

  const item = useWatch({
    control,
    name: "items.0",
  });

  const categoryId = useWatch({
    control,
    name: "items.0.categoryId",
  });

  const customerId = useWatch({
    control,
    name: "customerId",
  });

  const isExistingMeasurement = Boolean(item?.measurementId);

  const {
    data: linkedBlockCandidates = [],
    isFetching: isLinkedBlocksFetching,
  } = useGetBlockLinkCandidates({
    customerId,
    categoryId,
    onlyUnlinked: true,
    enabled: !isExistingMeasurement,
  });

  const linkedBlocks = useMemo(
    () => mapBlockLinkCandidatesToCustomerBlocks(linkedBlockCandidates),
    [linkedBlockCandidates],
  );

  const quantity = Number(item?.quantity || 0);
  const unitPrice = Number(item?.unitPrice || 0);
  const courierCharges = Number(
    useWatch({ control, name: "courierCharges" }) || 0,
  );
  const advanceAmount = Number(
    useWatch({ control, name: "advanceAmount" }) || 0,
  );

  const calculatedTotal = quantity * unitPrice;
  const calculatedQty = quantity;
  const calculatedBalance = Math.max(
    0,
    calculatedTotal + courierCharges - advanceAmount,
  );

  useEffect(() => {
    const lineTotal = quantity * unitPrice;

    setValue("items.0.lineTotal", lineTotal, {
      shouldValidate: false,
      shouldDirty: true,
    });

    setValue("totalQty", calculatedQty, { shouldValidate: false });
    setValue("totalAmount", calculatedTotal, { shouldValidate: false });
    setValue("balanceAmount", calculatedBalance, { shouldValidate: false });
  }, [
    quantity,
    unitPrice,
    calculatedQty,
    calculatedTotal,
    calculatedBalance,
    setValue,
  ]);

  useEffect(() => {
    if (!hasMeasurementPrefill) return;
    if (isPrefillMeasurementLoading) return;
    if (!prefillMeasurement) return;

    const measurementMap = buildMeasurementMap(prefillMeasurement.values);

    reset({
      ...buildInitialValues(),
      phoneNumber: prefillMeasurement.customer?.phoneNumber ?? "",
      customerMode: "existing",
      customerId: prefillMeasurement.customerId,
      customerName: prefillMeasurement.customer?.fullName ?? "",
      customerTown: prefillMeasurement.customer?.town ?? "",
      customerAddress: prefillMeasurement.customer?.address ?? "",
      customerNotes: prefillMeasurement.customer?.notes ?? "",
      hospitalName: prefillMeasurement.customer?.hospitalName ?? "",
      orderSource: "PHYSICAL_SHOP",
      paymentStatus: "UNPAID",
      paymentMode: "CASH",
      courierCharges: 0,
      specialNotes: "",
      items: [
        {
          ...buildInitialItem(),
          categoryId: prefillMeasurement.categoryId,
          measurementId: prefillMeasurement.id,
          blockMode: prefillMeasurement.blockId
            ? "existing"
            : "measurement-only",
          blockId: prefillMeasurement.blockId ?? "",
          measurements: measurementMap,
          measurementNote:
            prefillMeasurement.notes ??
            "Measurements taken while placing order.",
          itemDescription: prefillMeasurement.category?.name
            ? `${prefillMeasurement.category.name} Order`
            : "",
        },
      ],
    });

    setFoundCustomer(
      mapPrefillMeasurementToCustomerByPhone(prefillMeasurement),
    );
  }, [
    hasMeasurementPrefill,
    isPrefillMeasurementLoading,
    prefillMeasurement,
    reset,
  ]);

  useEffect(() => {
    if (!isPrefillFlow) return;
    if (hasMeasurementPrefill) return;
    if (isPrefilledCustomerLoading) return;
    if (!prefilledCustomer) return;

    const itemCategoryId = prefill?.categoryId ?? "";
    const matchedCategory = prefilledCustomer.customerBlocks.find(
      (assignment) => assignment.block.category?.id === itemCategoryId,
    )?.block.category;

    reset({
      ...buildInitialValues(),
      phoneNumber: prefilledCustomer.phoneNumber ?? "",
      customerMode: "existing",
      customerId: prefilledCustomer.id,
      customerName: prefilledCustomer.fullName ?? "",
      customerTown: prefilledCustomer.town ?? "",
      customerAddress: prefilledCustomer.address ?? "",
      customerNotes: prefilledCustomer.notes ?? "",
      hospitalName: prefilledCustomer.hospitalName ?? "",
      orderSource: "PHYSICAL_SHOP",
      paymentStatus: "UNPAID",
      paymentMode: "CASH",
      items: [
        {
          ...buildInitialItem(),
          categoryId: itemCategoryId,
          blockId: prefill?.blockId ?? "",
          blockMode: prefill?.blockId ? "existing" : "measurement-only",
          itemDescription: matchedCategory?.name
            ? `${matchedCategory.name} Order`
            : "",
        },
      ],
    });

    setFoundCustomer(mapCustomerDetailsToCustomerByPhone(prefilledCustomer));
  }, [
    isPrefillFlow,
    hasMeasurementPrefill,
    isPrefilledCustomerLoading,
    prefilledCustomer,
    prefill?.blockId,
    prefill?.categoryId,
    reset,
  ]);

  // const handleSearchCustomer = async () => {
  //   const phoneNumber = getValues("phoneNumber")?.trim();

  //   if (!phoneNumber) {
  //     setError("phoneNumber", { message: "Phone number is required" });
  //     return;
  //   }

  //   clearErrors("phoneNumber");
  //   setCustomerSearched(true);

  //   try {
  //     const customer = await findCustomerMutation.mutateAsync(phoneNumber);

  //     if (customer?.data) {
  //       setFoundCustomer(customer.data);
  //       setValue("customerMode", "existing");
  //       setValue("customerId", customer.data.id);
  //       setValue("customerName", customer.data.fullName);
  //       setValue("customerTown", customer.data.town || "");
  //       setValue("customerAddress", customer.data.address || "");
  //       setValue("customerNotes", customer.data.notes || "");
  //       setValue("hospitalName", customer.data.hospitalName || "");
  //     } else {
  //       setFoundCustomer(null);
  //       setValue("customerMode", "new");
  //       setValue("customerId", "");
  //     }
  //   } catch {
  //     setFoundCustomer(null);
  //     setValue("customerMode", "new");
  //     setValue("customerId", "");
  //   }
  // };

  const getFilteredBlocks = (selectedCategoryId?: string) => {
    const sourceBlocks = [
      ...(foundCustomer?.blocks ?? []),
      ...linkedBlocks,
    ].filter(
      (block, index, list) =>
        block.id && list.findIndex((item) => item.id === block.id) === index,
    );

    if (!sourceBlocks.length) return [];
    if (!selectedCategoryId) return sourceBlocks;

    return sourceBlocks.filter(
      (block) => block.categoryId === selectedCategoryId,
    );
  };

  const handleMeasurementChange = (key: string, value: string) => {
    setValue(`items.0.measurements.${key}`, value, {
      shouldDirty: true,
      shouldValidate: false,
    });
  };

  const submitOrder: SubmitHandler<CreateOrderFormValues> = async (values) => {
    setSubmitError(null);

    if (values.customerMode !== "existing" || !values.customerId) {
      const message = "Existing customer is required before creating an order.";

      form.setError("customerName", {
        message,
      });
      setSubmitError(message);
      toast.error(message);
      return;
    }

    const orderItem = values.items[0];
    const shouldUseExistingBlock = orderItem.blockMode === "existing";
    const shouldSendMeasurements =
      !orderItem.measurementId && hasMeasurementValues(orderItem.measurements);

    const payload: CreateOrderPayload = {
      customerId: values.customerId,
      groupOrderId: values.groupOrderId || undefined,
      orderNumber: values.orderNumber || undefined,
      orderDate: toIsoDateString(values.orderDate),
      promisedDate: toIsoDateString(values.promisedDate),
      completedAt: toIsoDateString(values.completedAt),
      deliveredAt: toIsoDateString(values.deliveredAt),
      status: values.status as OrderStatus,
      orderSource: values.orderSource as OrderSource,
      paymentStatus: values.paymentStatus as PaymentStatus,
      paymentMode: values.paymentMode as OrderPaymentMode,
      hospitalName: values.hospitalName || undefined,
      town: values.customerTown || undefined,
      customerAddress: values.customerAddress || undefined,
      totalQty: Number(values.totalQty || 0),
      totalAmount: Number(values.totalAmount || 0),
      advanceAmount: Number(values.advanceAmount || 0),
      balanceAmount: Number(values.balanceAmount || 0),
      courierCharges: Number(values.courierCharges || 0),
      notes: values.notes || undefined,
      specialNotes: values.specialNotes || undefined,
      items: [
        {
          categoryId: orderItem.categoryId,
          blockId: shouldUseExistingBlock
            ? orderItem.blockId || undefined
            : undefined,
          measurementId: orderItem.measurementId || undefined,
          itemDescription: orderItem.itemDescription,
          quantity: Number(orderItem.quantity || 0),
          unitPrice: Number(orderItem.unitPrice || 0),
          lineTotal: Number(orderItem.lineTotal || 0),
          notes: orderItem.notes || undefined,
          tailorNote: orderItem.tailorNote || undefined,
          status: orderItem.status as OrderItemStatus,
          measurements: shouldSendMeasurements
            ? orderItem.measurements
            : undefined,
          measurementNote: shouldSendMeasurements
            ? orderItem.measurementNote || undefined
            : undefined,
        },
      ],
    };

    try {
      await createOrderMutation.mutateAsync(payload);

      if (onSubmit) {
        await onSubmit(payload);
      }

      toast.success("Order saved successfully.");
      navigate({ to: "/app/orders" });
    } catch (error) {
      const message = getSubmitErrorMessage(error);
      setSubmitError(message);
      toast.error(message);
    }
  };

  const handleInvalidSubmit = (
    errors: FieldErrors<CreateOrderFormInput>,
  ) => {
    const message =
      getFirstFieldErrorMessage(errors) ??
      "Please complete the required fields before saving the order.";

    setSubmitError(message);
    toast.error(message);
  };

  const isSubmitting = createOrderMutation.isPending;

  const isPrefillLoading = hasMeasurementPrefill
    ? isPrefillMeasurementLoading
    : isPrefillFlow
      ? isPrefilledCustomerLoading
      : false;

  const isSaveDisabled =
    isSubmitting || isPrefillLoading || isCategoriesLoading;

  const blocks = getFilteredBlocks(categoryId);
  const isExistingBlock = item?.blockMode === "existing";

  useEffect(() => {
    if (!item?.blockId) return;
    if (isLinkedBlocksFetching) return;
    if (blocks.some((block) => block.id === item.blockId)) return;

    setValue("items.0.blockId", "", {
      shouldDirty: true,
      shouldValidate: false,
    });
  }, [blocks, isLinkedBlocksFetching, item?.blockId, setValue]);

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(submitOrder, handleInvalidSubmit)}
        >
          <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl gap-4 px-4 py-4 lg:px-6 justify-between">
              <PageHeader />

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() =>
                    generateDraftOrderPdf(
                      getValues(),
                      foundCustomer,
                      categoriesForForm,
                    )
                  }
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Draft
                </Button>

                <Button
                  asChild
                  type="button"
                  variant="outline"
                  className="rounded-lg"
                >
                  <Link to="/app/orders">Cancel</Link>
                </Button>

                <Button
                  type="submit"
                  disabled={isSaveDisabled}
                  className="rounded-lg bg-slate-900 hover:bg-slate-800"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isSubmitting ? "Saving..." : "Save Order"}
                </Button>
              </div>
            </div>
          </div>

          <main className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[1fr_340px] lg:px-6">
            <div className="space-y-5">
              {submitError && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
                >
                  {submitError}
                </div>
              )}

              {hasMeasurementPrefill &&
                !isPrefillMeasurementLoading &&
                !prefillMeasurement && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">
                    Selected measurement could not be loaded. Please select the
                    customer and category again before saving.
                  </div>
                )}

              {isCategoriesError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                  Categories could not be loaded. Please refresh the page.
                </div>
              )}

              <SectionCard
                title="Customer"
                description="Type the customer phone number and select the correct customer from suggestions."
                icon={UserRound}
              >
                {isPrefillLoading ? (
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading selected customer...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!isPrefillFlow && (
                      <CustomerPhoneLookupField
                        control={form.control}
                        setValue={form.setValue}
                        names={{
                          customerId: "customerId",
                          customerName: "customerName",
                          phoneNumber: "phoneNumber",
                          hospitalName: "hospitalName",
                          town: "customerTown",
                          address: "customerAddress",
                        }}
                        onCustomerSelect={(customer) => {
                          setFoundCustomer({
                            id: customer.id,
                            tenantId: "",
                            fullName: customer.fullName,
                            phoneNumber: customer.phoneNumber ?? "",
                            alternatePhone: customer.alternatePhone,
                            town: customer.town,
                            address: customer.address,
                            hospitalName: customer.hospitalName ?? null,
                            blocks: [],
                          });
                        }}
                        onClear={() => {
                          setFoundCustomer(null);
                          setValue("items.0.blockId", "", {
                            shouldDirty: true,
                            shouldValidate: false,
                          });
                          setValue("items.0.blockMode", "measurement-only", {
                            shouldDirty: true,
                            shouldValidate: false,
                          });
                        }}
                      />
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <FormField
                        control={control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input
                                className="rounded-lg bg-slate-50"
                                readOnly
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="hospitalName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hospital</FormLabel>
                            <FormControl>
                              <Input
                                className="rounded-lg"
                                placeholder="Hospital name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="customerTown"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Town</FormLabel>
                            <FormControl>
                              <Input
                                className="rounded-lg bg-slate-50"
                                readOnly
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="customerAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input
                                className="rounded-lg bg-slate-50"
                                readOnly
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </SectionCard>

              <SectionCard
                title="Order Item & Measurements"
                description="One order supports one garment item. Use quantity for multiple pieces."
                icon={ClipboardList}
              >
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-3">
                    <p className="text-sm font-bold text-slate-900">
                      Garment item
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Select category first. Measurements will load from that
                      category.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <FormField
                      control={control}
                      name="items.0.categoryId"
                      render={({}) => (
                        <FormItem>
                          <FormField
                            control={control}
                            name="items.0.categoryId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>

                                <Select
                                  value={field.value ?? ""}
                                  disabled={
                                    isExistingMeasurement || isCategoriesLoading
                                  }
                                  onValueChange={(selectedCategoryId) => {
                                    field.onChange(selectedCategoryId);

                                    setValue(
                                      "items.0.categoryId",
                                      selectedCategoryId,
                                      {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                        shouldTouch: true,
                                      },
                                    );

                                    setValue(
                                      "items.0.measurements",
                                      {},
                                      {
                                        shouldDirty: true,
                                        shouldValidate: false,
                                      },
                                    );

                                    setValue("items.0.measurementId", "", {
                                      shouldDirty: true,
                                      shouldValidate: false,
                                    });

                                    setValue("items.0.blockId", "", {
                                      shouldDirty: true,
                                      shouldValidate: false,
                                    });
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger className="rounded-lg">
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
                                    {categoriesForForm.map((category) => (
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="items.0.itemDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-lg"
                              placeholder="Nurse uniform"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="items.0.quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qty</FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-lg"
                              type="number"
                              min={1}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="items.0.unitPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Price</FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-lg"
                              type="number"
                              min={0}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="items.0.blockMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Block Flow</FormLabel>
                          <FormControl>
                            <SelectInput
                              {...field}
                              disabled={isExistingMeasurement}
                            >
                              <option value="measurement-only">
                                Measurement only
                              </option>
                              <option value="existing">
                                {isLinkedBlocksFetching
                                  ? "Existing block - loading"
                                  : blocks.length
                                    ? `Existing block (${blocks.length})`
                                    : "Existing block"}
                              </option>
                            </SelectInput>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isExistingBlock && (
                      <FormField
                        control={control}
                        name="items.0.blockId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Block No</FormLabel>
                            <FormControl>
                              <SelectInput
                                {...field}
                                disabled={
                                  isExistingMeasurement ||
                                  isLinkedBlocksFetching ||
                                  !categoryId
                                }
                              >
                                <option value="">
                                  {isLinkedBlocksFetching
                                    ? "Loading blocks..."
                                    : !categoryId
                                      ? "Select category first"
                                      : blocks.length
                                        ? "Select block"
                                        : "No linked blocks"}
                                </option>

                                {blocks.map((block) => (
                                  <option key={block.id} value={block.id}>
                                    {block.blockNumber}
                                    {block.sizeLabel
                                      ? ` • ${block.sizeLabel}`
                                      : ""}
                                  </option>
                                ))}
                              </SelectInput>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={control}
                      name="items.0.status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Status</FormLabel>
                          <FormControl>
                            <SelectInput {...field}>
                              {ORDER_ITEM_STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
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
                      name="items.0.lineTotal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Line Total</FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-lg bg-slate-100"
                              type="number"
                              readOnly
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="items.0.notes"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Item Note</FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-lg"
                              placeholder="Customer requested loose fit"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="items.0.tailorNote"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Tailor Note</FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-lg"
                              placeholder="Use previous cutting style"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <OrderItemMeasurementsSection
                    categoryId={categoryId}
                    values={normalizeMeasurementValues(item?.measurements)}
                    isExistingMeasurement={isExistingMeasurement}
                    hasMeasurementPrefill={hasMeasurementPrefill}
                    prefillCategoryId={prefillMeasurement?.categoryId}
                    prefillMeasurementFields={prefillMeasurementFields}
                    onMeasurementChange={handleMeasurementChange}
                    control={control}
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="Order Details"
                description="Keep the status as pending until cutting starts."
                icon={CalendarDays}
              >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <FormField
                    control={control}
                    name="orderNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order No</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-lg"
                            placeholder="Auto or ORD-00001"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="orderDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Date</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-lg"
                            type="date"
                            {...field}
                          />
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
                        <FormLabel>Promised Date</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-lg"
                            type="date"
                            {...field}
                          />
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
                            {ORDER_SOURCE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Status</FormLabel>
                        <FormControl>
                          <SelectInput {...field}>
                            {ORDER_STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
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
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Status</FormLabel>
                        <FormControl>
                          <SelectInput {...field}>
                            {PAYMENT_STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
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
                        <FormLabel>Payment Mode</FormLabel>
                        <FormControl>
                          <SelectInput {...field}>
                            {PAYMENT_MODE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
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
                          <Input
                            className="rounded-lg"
                            placeholder="Optional"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Order Note</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-lg"
                            placeholder="Order note"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="specialNotes"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Special Notes</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-lg"
                            placeholder="Special delivery note"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </SectionCard>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-36 lg:self-start">
              <SectionCard title="Payment Summary" icon={Banknote}>
                <div className="grid gap-3">
                  <SummaryMetric label="Items" value={1} />
                  <SummaryMetric label="Total Qty" value={calculatedQty} />
                  <SummaryMetric
                    label="Total Amount"
                    value={calculatedTotal.toFixed(2)}
                  />

                  <FormField
                    control={control}
                    name="courierCharges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Courier Charges</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-lg"
                            type="number"
                            min={0}
                            {...field}
                          />
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
                          <Input
                            className="rounded-lg"
                            type="number"
                            min={0}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <SummaryMetric
                    label="Balance"
                    value={calculatedBalance.toFixed(2)}
                    strong
                  />
                </div>
              </SectionCard>

              <Card className="rounded-lg border-amber-200 bg-amber-50 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm font-bold text-amber-950">
                    One order item only
                  </p>
                  <p className="mt-2 text-xs leading-5 text-amber-800">
                    Use quantity when the customer orders multiple pieces of the
                    same garment. Measurements are attached to this one order
                    item.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm font-bold text-slate-900">
                    Before saving
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
                    <li>Confirm customer phone number.</li>
                    <li>Confirm promised date.</li>
                    <li>Confirm category and price.</li>
                    <li>Enter measurements when no block exists.</li>
                    <li>Enter advance payment if collected.</li>
                  </ul>
                </CardContent>
              </Card>
            </aside>
          </main>
        </form>
      </Form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Measurement Section                                                */
/* ------------------------------------------------------------------ */

type OrderItemMeasurementsSectionProps = {
  categoryId?: string;
  values: Record<string, string | number | undefined>;
  isExistingMeasurement: boolean;
  hasMeasurementPrefill: boolean;
  prefillCategoryId?: string;
  prefillMeasurementFields: MeasurementFieldConfig[];
  onMeasurementChange: (key: string, value: string) => void;
  control: any;
};

function OrderItemMeasurementsSection({
  categoryId,
  values,
  isExistingMeasurement,
  hasMeasurementPrefill,
  prefillCategoryId,
  prefillMeasurementFields,
  onMeasurementChange,
  control,
}: OrderItemMeasurementsSectionProps) {
  const safeCategoryId = categoryId?.trim() || "";

  const shouldUsePrefillFields =
    hasMeasurementPrefill &&
    prefillCategoryId === safeCategoryId &&
    prefillMeasurementFields.length > 0;

  const {
    data: measurementFieldsResponse,
    isLoading: isMeasurementFieldsLoading,
    isFetching: isMeasurementFieldsFetching,
    isError: isMeasurementFieldsError,
  } = useMeasurementFieldsQuery(
    {
      pageIndex: 0,
      pageSize: 100,
      categoryId: safeCategoryId,
      isActive: true,
    },
    {
      enabled: Boolean(safeCategoryId) && !shouldUsePrefillFields,
    },
  );

  const measurementFields = useMemo(() => {
    if (shouldUsePrefillFields) {
      return prefillMeasurementFields;
    }

    return mapMeasurementFieldsToConfig(
      getMeasurementFieldRows(measurementFieldsResponse),
    );
  }, [
    measurementFieldsResponse,
    prefillMeasurementFields,
    shouldUsePrefillFields,
  ]);

  const isLoadingFields =
    Boolean(safeCategoryId) &&
    !shouldUsePrefillFields &&
    (isMeasurementFieldsLoading || isMeasurementFieldsFetching);

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-slate-500" />

          <div>
            <p className="text-sm font-bold text-slate-800">Measurements</p>

            <p className="text-xs text-slate-500">
              {isExistingMeasurement
                ? "Existing measurement is attached."
                : "Measurements are loaded from the selected category."}
            </p>
          </div>
        </div>

        {isExistingMeasurement ? (
          <Badge className="rounded-full bg-blue-50 text-blue-700 hover:bg-blue-50">
            Attached
          </Badge>
        ) : (
          <Badge className="rounded-full bg-amber-50 text-amber-700 hover:bg-amber-50">
            No block yet
          </Badge>
        )}
      </div>

      {!safeCategoryId && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
          Select a category to load measurement fields.
        </div>
      )}

      {isLoadingFields && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading measurement fields...
        </div>
      )}

      {safeCategoryId && isMeasurementFieldsError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          Measurement fields could not be loaded. Please try again.
        </div>
      )}

      {safeCategoryId &&
        !isLoadingFields &&
        !isMeasurementFieldsError &&
        measurementFields.length === 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            No active measurement fields found for this category.
          </div>
        )}

      {measurementFields.length > 0 && (
        <MeasurementFields
          fields={measurementFields}
          values={values}
          disabled={isExistingMeasurement}
          onChange={onMeasurementChange}
        />
      )}

      <FormField
        control={control}
        name="items.0.measurementNote"
        render={({ field }) => (
          <FormItem className="mt-3">
            <FormLabel>Measurement Note</FormLabel>
            <FormControl>
              <Textarea
                className="min-h-20 rounded-lg"
                placeholder="Measurements taken while placing order."
                disabled={isExistingMeasurement}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default CreateOrderPage;
