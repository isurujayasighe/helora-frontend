"use client";

import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  Loader2,
  Package2,
  Plus,
  Printer,
  Ruler,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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

import {
  useFindCustomerByPhoneMutation,
  type CustomerByPhone,
} from "@/api/useFindCustomerByPhone";
import { useGetCustomerById } from "../../modules/app/customers/api/useGetCustomerbyId";
import { useGetLatestMeasurement } from "@/api/useGetLatestMeasurement";

import {
  MeasurementFields,
  type MeasurementFieldConfig,
} from "./measurement-fields";

import { generateOrderPdf } from "@/utils/generate-order-pdf";

import {
  useCreateOrder,
  type CreateOrderPayload,
  type OrderItemStatus,
  type OrderPaymentMode,
  type OrderSource,
  type OrderStatus,
  type PaymentStatus,
} from "@/api/useCreateOrder";

const measurementValuesSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.undefined()]),
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

  blockMode: z.enum(["existing", "new"]).default("new"),
  measurements: measurementValuesSchema.default({}),
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

  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

type CreateOrderFormInput = z.input<typeof formSchema>;
type CreateOrderFormValues = z.output<typeof formSchema>;

type CategoryOption = {
  id: string;
  name: string;
};

type CreateOrderPrefill = {
  customerId?: string;
  measurementId?: string;
  blockId?: string;
  categoryId?: string;
};

type CreateOrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (payload: CreateOrderPayload) => Promise<void> | void;
  categories?: CategoryOption[];
  prefill?: CreateOrderPrefill;
};

const defaultCategories: CategoryOption[] = [
  { id: "cmo8n1mof000qdk64iu6f27nf", name: "Uniform" },
  { id: "cmo8n1mxw000sdk642l58ko48", name: "Blouse" },
  { id: "cat-saree", name: "Saree" },
  { id: "cat-shirt", name: "Shirt" },
];

const CATEGORY_MEASUREMENTS: Record<string, MeasurementFieldConfig[]> = {
  cmo8n1mof000qdk64iu6f27nf: [
    { key: "chest", label: "Chest", unit: "in" },
    { key: "waist", label: "Waist", unit: "in" },
    { key: "hip", label: "Hip", unit: "in" },
    { key: "shoulder", label: "Shoulder", unit: "in" },
    { key: "sleeve_length", label: "Sleeve Length", unit: "in" },
    { key: "top_length", label: "Top Length", unit: "in" },
  ],
  cmo8n1mxw000sdk642l58ko48: [
    { key: "bust", label: "Bust", unit: "in" },
    { key: "waist", label: "Waist", unit: "in" },
    { key: "blouse_length", label: "Blouse Length", unit: "in" },
    { key: "shoulder", label: "Shoulder", unit: "in" },
    { key: "armhole", label: "Armhole", unit: "in" },
    { key: "sleeve_length", label: "Sleeve Length", unit: "in" },
  ],
  "cat-saree": [
    { key: "waist", label: "Waist", unit: "in" },
    { key: "hip", label: "Hip", unit: "in" },
    { key: "height", label: "Height", unit: "in" },
    { key: "blouse_bust", label: "Blouse Bust", unit: "in" },
    { key: "blouse_length", label: "Blouse Length", unit: "in" },
  ],
  "cat-shirt": [
    { key: "chest", label: "Chest", unit: "in" },
    { key: "waist", label: "Waist", unit: "in" },
    { key: "shoulder", label: "Shoulder", unit: "in" },
    { key: "neck", label: "Neck", unit: "in" },
    { key: "sleeve_length", label: "Sleeve Length", unit: "in" },
    { key: "shirt_length", label: "Shirt Length", unit: "in" },
  ],
};

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysInputValue(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function toIsoDateString(dateValue: string) {
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
        field: {
          code: string;
        };
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
  blockMode: "new",
  measurements: {},
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

function SectionCard({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-slate-500" />}
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        </div>

        {action}
      </div>

      <div className="p-4">{children}</div>
    </section>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
}

function generateDraftOrderPdf(
  values: CreateOrderFormInput,
  foundCustomer?: CustomerByPhone | null,
  categories: CategoryOption[] = [],
) {
  const matchedCustomerName =
    foundCustomer?.fullName || values.customerName || "-";

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
    items: values.items.map((item, index) => {
      const matchedBlock =
        item.blockMode === "existing"
          ? foundCustomer?.blocks?.find((b) => b.id === item.blockId)
          : null;

      const matchedCategory = categories.find((c) => c.id === item.categoryId);

      return {
        id: `draft-item-${index + 1}`,
        orderId: "draft-order",
        categoryId: item.categoryId,
        blockId: item.blockId || null,
        measurementId: item.measurementId || null,
        itemDescription: item.itemDescription,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        notes: item.notes,
        tailorNote: item.tailorNote,
        status: item.status,
        measurements: item.measurements ?? {},
        category: matchedCategory
          ? {
              id: matchedCategory.id,
              name: matchedCategory.name,
            }
          : {
              id: item.categoryId,
              name: "-",
            },
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
      };
    }),
    _count: {
      items: values.items.length,
    },
  };

  generateOrderPdf(draftOrder as any);
}

export function CreateOrderDialog({
  open,
  onOpenChange,
  onSubmit,
  categories = defaultCategories,
  prefill,
}: CreateOrderDialogProps) {
  const [foundCustomer, setFoundCustomer] = useState<CustomerByPhone | null>(
    null,
  );
  const [customerSearched, setCustomerSearched] = useState(false);

  const isDashboardFlow = Boolean(prefill?.customerId);
  const hasMeasurementPrefill = Boolean(prefill?.measurementId);

  const findCustomerMutation = useFindCustomerByPhoneMutation();
  const createOrderMutation = useCreateOrder();

  const {
    data: prefillMeasurement,
    isLoading: isPrefillMeasurementLoading,
  } = useGetLatestMeasurement({
    customerId: prefill?.customerId,
    blockId: prefill?.blockId,
    categoryId: prefill?.categoryId,
    enabled: open && hasMeasurementPrefill,
  });

  const {
    data: prefilledCustomer,
    isLoading: isPrefilledCustomerLoading,
  } = useGetCustomerById(
    prefill?.customerId,
    open && isDashboardFlow && !hasMeasurementPrefill,
  );

  const categoriesForForm = useMemo(() => {
    if (!prefillMeasurement?.category) return categories;

    const exists = categories.some(
      (category) => category.id === prefillMeasurement.category?.id,
    );

    if (exists) return categories;

    return [
      {
        id: prefillMeasurement.category.id,
        name: prefillMeasurement.category.name,
      },
      ...categories,
    ];
  }, [categories, prefillMeasurement?.category]);

  const prefillMeasurementFields = useMemo(
    () => buildMeasurementFieldsFromApi(prefillMeasurement?.values),
    [prefillMeasurement?.values],
  );

  const form = useForm<CreateOrderFormInput, any, CreateOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: buildInitialValues(),
  });

  const { control, watch, setValue, getValues, reset, setError, clearErrors } =
    form;

  const { fields, append, remove } = useFieldArray<CreateOrderFormInput>({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const watchedAdvance = watch("advanceAmount");
  const watchedCourierCharges = watch("courierCharges");

  const calculatedTotal = useMemo(() => {
    return (watchedItems || []).reduce((sum, item) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.unitPrice || 0);
      return sum + qty * price;
    }, 0);
  }, [watchedItems]);

  const calculatedQty = useMemo(() => {
    return (watchedItems || []).reduce((sum, item) => {
      return sum + Number(item.quantity || 0);
    }, 0);
  }, [watchedItems]);

  const calculatedBalance = Math.max(
    0,
    calculatedTotal +
      Number(watchedCourierCharges || 0) -
      Number(watchedAdvance || 0),
  );

  useEffect(() => {
    setValue("totalQty", calculatedQty, { shouldValidate: false });
    setValue("totalAmount", calculatedTotal, { shouldValidate: false });
    setValue("balanceAmount", calculatedBalance, { shouldValidate: false });

    watchedItems?.forEach((item, index) => {
      const lineTotal =
        Number(item.quantity || 0) * Number(item.unitPrice || 0);

      if (Number(item.lineTotal || 0) !== lineTotal) {
        setValue(`items.${index}.lineTotal`, lineTotal, {
          shouldValidate: false,
          shouldDirty: true,
        });
      }
    });
  }, [
    calculatedQty,
    calculatedTotal,
    calculatedBalance,
    watchedItems,
    setValue,
  ]);

  useEffect(() => {
    if (!open) return;
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
          blockMode: prefillMeasurement.blockId ? "existing" : "new",
          blockId: prefillMeasurement.blockId ?? "",
          measurements: measurementMap,
          itemDescription: prefillMeasurement.category?.name
            ? `${prefillMeasurement.category.name} Order`
            : "",
        },
      ],
    });

    setFoundCustomer({
      ...(prefillMeasurement.customer as any),
      blocks: prefillMeasurement.block
        ? [
            {
              ...(prefillMeasurement.block as any),
              categoryId: prefillMeasurement.categoryId,
              category: prefillMeasurement.category,
              isDefault: true,
            },
          ]
        : [],
    } as CustomerByPhone);

    setCustomerSearched(true);
  }, [
    open,
    hasMeasurementPrefill,
    isPrefillMeasurementLoading,
    prefillMeasurement,
    reset,
  ]);

  useEffect(() => {
    if (!open) return;
    if (!isDashboardFlow) return;
    if (hasMeasurementPrefill) return;
    if (isPrefilledCustomerLoading) return;
    if (!prefilledCustomer) return;

    reset({
      ...buildInitialValues(),
      phoneNumber: prefilledCustomer.data.phoneNumber ?? "",
      customerMode: "existing",
      customerId: prefilledCustomer.data.id,
      customerName: prefilledCustomer.data.fullName ?? "",
      customerTown: prefilledCustomer.data.town ?? "",
      customerAddress: prefilledCustomer.data.address ?? "",
      customerNotes: prefilledCustomer.data.notes ?? "",
      hospitalName: prefilledCustomer.data.town ?? "",
      orderSource: "PHYSICAL_SHOP",
      paymentStatus: "UNPAID",
      paymentMode: "CASH",
      courierCharges: 0,
      specialNotes: "",
      items: [
        {
          ...buildInitialItem(),
          categoryId: "",
          measurementId: "",
          blockMode: "new",
          blockId: "",
          measurements: {},
          itemDescription: "",
        },
      ],
    });

    setFoundCustomer(prefilledCustomer);
    setCustomerSearched(true);
  }, [
    open,
    isDashboardFlow,
    hasMeasurementPrefill,
    isPrefilledCustomerLoading,
    prefilledCustomer,
    reset,
  ]);

  const resetDialog = () => {
    reset(buildInitialValues());
    setFoundCustomer(null);
    setCustomerSearched(false);
    findCustomerMutation.reset();
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetDialog();
    }

    onOpenChange(nextOpen);
  };

  const handleSearchCustomer = async () => {
    const phoneNumber = getValues("phoneNumber")?.trim();

    if (!phoneNumber) {
      setError("phoneNumber", { message: "Phone number is required" });
      return;
    }

    clearErrors("phoneNumber");
    setCustomerSearched(true);

    try {
      const customer = await findCustomerMutation.mutateAsync(phoneNumber);

      if (customer) {
        setFoundCustomer(customer.data);
        setValue("customerMode", "existing");
        setValue("customerId", customer.data?.id);
        setValue("customerName", customer.data?.fullName);
        setValue("customerTown", customer.data?.town || "");
        setValue("customerAddress", customer.data?.address || "");
        setValue("customerNotes", customer.data?.notes || "");
        setValue("hospitalName", customer.data?.town || "");
      } else {
        setFoundCustomer(null);
        setValue("customerMode", "new");
        setValue("customerId", "");
        setValue("customerName", "");
        setValue("customerTown", "");
        setValue("customerAddress", "");
        setValue("customerNotes", "");
        setValue("hospitalName", "");
      }
    } catch {
      setFoundCustomer(null);
      setValue("customerMode", "new");
      setValue("customerId", "");
    }
  };

  const getFilteredBlocks = (categoryId?: string) => {
    if (!foundCustomer?.blocks?.length) return [];
    if (!categoryId) return foundCustomer.blocks;

    return foundCustomer.blocks.filter(
      (block) => block.categoryId === categoryId,
    );
  };

  const getMeasurementFields = (categoryId?: string) => {
    if (!categoryId) return [];

    if (
      hasMeasurementPrefill &&
      prefillMeasurement?.categoryId === categoryId &&
      prefillMeasurementFields.length > 0
    ) {
      return prefillMeasurementFields;
    }

    return CATEGORY_MEASUREMENTS[categoryId] || [];
  };

  const handleMeasurementChange = (
    itemIndex: number,
    key: string,
    value: string,
  ) => {
    setValue(`items.${itemIndex}.measurements.${key}`, value, {
      shouldDirty: true,
      shouldValidate: false,
    });
  };

  const submitOrder: SubmitHandler<CreateOrderFormValues> = async (values) => {
    if (values.customerMode !== "existing" || !values.customerId) {
      form.setError("customerName", {
        message: "Existing customer is required before creating an order.",
      });
      return;
    }

    const payload: CreateOrderPayload = {
      customerId: values.customerId,
      groupOrderId: values.groupOrderId || undefined,

      orderNumber: values.orderNumber || undefined,
      orderDate: toIsoDateString(values.orderDate),
      promisedDate: toIsoDateString(values.promisedDate),

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

      items: values.items.map((item) => {
        const shouldSendMeasurements =
          !item.measurementId && Object.keys(item.measurements || {}).length > 0;

        return {
          categoryId: item.categoryId,
          blockId:
            item.blockMode === "existing" ? item.blockId || undefined : undefined,
          measurementId: item.measurementId || undefined,

          itemDescription: item.itemDescription,
          quantity: Number(item.quantity || 0),
          unitPrice: Number(item.unitPrice || 0),
          lineTotal: Number(item.lineTotal || 0),

          notes: item.notes || undefined,
          tailorNote: item.tailorNote || undefined,
          status: item.status as OrderItemStatus,

          measurements: shouldSendMeasurements
            ? item.measurements
            : undefined,
        };
      }),
    };

    await createOrderMutation.mutateAsync(payload);

    if (onSubmit) {
      await onSubmit(payload);
    }

    handleDialogOpenChange(false);
  };

  const isSearchingCustomer = findCustomerMutation.isPending;
  const isSubmitting = createOrderMutation.isPending;

  const isDashboardLoading = hasMeasurementPrefill
    ? isPrefillMeasurementLoading
    : isDashboardFlow
      ? isPrefilledCustomerLoading
      : false;

  const isDashboardReady =
    !isDashboardFlow ||
    (hasMeasurementPrefill
      ? Boolean(prefillMeasurement)
      : Boolean(prefilledCustomer));

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden rounded-2xl border-slate-200 p-0 sm:max-w-5xl">
        <DialogHeader className="shrink-0 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-base font-black text-slate-900">
                Create Order
              </DialogTitle>
              <p className="mt-1 text-xs text-slate-500">
                {hasMeasurementPrefill
                  ? "Customer, block and measurements are selected from dashboard."
                  : isDashboardFlow
                    ? "Customer is selected. Add category, block and measurements."
                    : "Find customer, add item details, then create the order."}
              </p>
            </div>

            {isDashboardFlow && (
              <Badge className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 hover:bg-emerald-50">
                {hasMeasurementPrefill
                  ? "Measurement Selected"
                  : "Customer Selected"}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submitOrder)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 p-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                  <SectionCard title="Customer" icon={UserRound}>
                    {isDashboardFlow ? (
                      <div>
                        {isDashboardLoading ? (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading selected customer...
                          </div>
                        ) : hasMeasurementPrefill && prefillMeasurement ? (
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-base font-black text-slate-900">
                                  {prefillMeasurement.customer?.fullName ?? "-"}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {prefillMeasurement.customer?.phoneNumber ??
                                    "-"}
                                  {prefillMeasurement.customer?.town
                                    ? ` • ${prefillMeasurement.customer.town}`
                                    : ""}
                                </p>
                              </div>

                              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                            </div>

                            <div className="grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-3">
                              <SummaryItem
                                label="Category"
                                value={prefillMeasurement.category?.name}
                              />
                              <SummaryItem
                                label="Block"
                                value={
                                  prefillMeasurement.block?.blockNumber ?? "-"
                                }
                              />
                              <SummaryItem
                                label="Measurement"
                                value={prefillMeasurement.measurementNumber}
                              />
                            </div>
                          </div>
                        ) : !hasMeasurementPrefill && prefilledCustomer ? (
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-base font-black text-slate-900">
                                  {prefilledCustomer.data.fullName ?? "-"}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {prefilledCustomer.data.phoneNumber ?? "-"}
                                  {prefilledCustomer.data.town
                                    ? ` • ${prefilledCustomer.data.town}`
                                    : ""}
                                </p>
                              </div>

                              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                            </div>

                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                              No previous measurements found. Select category
                              and enter measurements for this order.
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                            Unable to load selected customer. Close and try
                            again.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                          <FormField
                            control={control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Search by phone number"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleSearchCustomer}
                              disabled={isSearchingCustomer}
                              className="w-full sm:w-auto"
                            >
                              {isSearchingCustomer ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Search className="mr-2 h-4 w-4" />
                              )}
                              Find
                            </Button>
                          </div>
                        </div>

                        {findCustomerMutation.isError && (
                          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                            Unable to fetch customer details. Please try again.
                          </div>
                        )}

                        {customerSearched && foundCustomer && (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-bold text-emerald-900">
                                  {foundCustomer.fullName}
                                </p>
                                <p className="mt-0.5 text-xs text-emerald-700">
                                  {foundCustomer.phoneNumber}
                                  {foundCustomer.town
                                    ? ` • ${foundCustomer.town}`
                                    : ""}
                                </p>
                              </div>
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                Existing
                              </Badge>
                            </div>
                          </div>
                        )}

                        {customerSearched && !foundCustomer && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                            Customer not found. Create customer first before
                            placing order.
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <FormField
                        control={control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input disabled={isDashboardFlow} {...field} />
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
                                disabled={isDashboardFlow}
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
                              <Input disabled={isDashboardFlow} {...field} />
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
                              <Input disabled={isDashboardFlow} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </SectionCard>

                  <SectionCard title="Order Details" icon={Package2}>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <FormField
                        control={control}
                        name="orderNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order No</FormLabel>
                            <FormControl>
                              <Input
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
                              <Input type="date" {...field} />
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
                              <Input type="date" {...field} />
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
                              <select
                                {...field}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                <option value="PHYSICAL_SHOP">
                                  Physical Shop
                                </option>
                                <option value="PHONE_CALL">Phone Call</option>
                                <option value="WHATSAPP">WhatsApp</option>
                                <option value="DREZAURA">Drezaura</option>
                                <option value="ONLINE">Online</option>
                              </select>
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
                              <select
                                {...field}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="CUTTING">Cutting</option>
                                <option value="SEWING">Sewing</option>
                                <option value="READY">Ready</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
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
                              <select
                                {...field}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                <option value="UNPAID">Unpaid</option>
                                <option value="ADVANCE_PAID">
                                  Advance Paid
                                </option>
                                <option value="PARTIALLY_PAID">
                                  Partially Paid
                                </option>
                                <option value="PAID">Paid</option>
                                <option value="REFUNDED">Refunded</option>
                              </select>
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
                              <select
                                {...field}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                <option value="CASH">Cash</option>
                                <option value="ONLINE_TRANSFER">
                                  Online Transfer
                                </option>
                                <option value="BANK_DEPOSIT">
                                  Bank Deposit
                                </option>
                                <option value="CARD">Card</option>
                                <option value="MIXED">Mixed</option>
                              </select>
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
                              <Input placeholder="Order note" {...field} />
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

                  <SectionCard
                    title="Order Items"
                    icon={Package2}
                    action={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={hasMeasurementPrefill}
                        onClick={() => append(buildInitialItem())}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add
                      </Button>
                    }
                  >
                    <div className="space-y-3">
                      {fields.map((field, index) => {
                        const watchedItem = watchedItems?.[index];
                        const categoryId = watchedItem?.categoryId;
                        const blocks = getFilteredBlocks(categoryId);
                        const measurementFields =
                          getMeasurementFields(categoryId);
                        const isPrefilledItem =
                          hasMeasurementPrefill &&
                          Boolean(watchedItem?.measurementId);

                        return (
                          <div
                            key={field.id}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                          >
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-bold text-slate-900">
                                  Item {index + 1}
                                </p>
                                {isPrefilledItem && (
                                  <p className="mt-0.5 text-xs text-emerald-700">
                                    Uses selected customer measurement.
                                  </p>
                                )}
                              </div>

                              {fields.length > 1 && !hasMeasurementPrefill && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => remove(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                              <FormField
                                control={control}
                                name={`items.${index}.categoryId`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <FormControl>
                                      <select
                                        {...field}
                                        disabled={isPrefilledItem}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-100"
                                      >
                                        <option value="">Select</option>
                                        {categoriesForForm.map((category) => (
                                          <option
                                            key={category.id}
                                            value={category.id}
                                          >
                                            {category.name}
                                          </option>
                                        ))}
                                      </select>
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
                                      <Input
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
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Qty</FormLabel>
                                    <FormControl>
                                      <Input type="number" min={1} {...field} />
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
                                      <Input type="number" min={0} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={control}
                                name={`items.${index}.blockMode`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Block</FormLabel>
                                    <FormControl>
                                      <select
                                        {...field}
                                        disabled={isPrefilledItem}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-100"
                                      >
                                        <option value="existing">
                                          Existing Block
                                        </option>
                                        <option value="new">New Block</option>
                                      </select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {watchedItem?.blockMode === "existing" && (
                                <FormField
                                  control={control}
                                  name={`items.${index}.blockId`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Block No</FormLabel>
                                      <FormControl>
                                        <select
                                          {...field}
                                          disabled={isPrefilledItem}
                                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-100"
                                        >
                                          <option value="">Select block</option>
                                          {blocks.map((block) => (
                                            <option
                                              key={block.id}
                                              value={block.id}
                                            >
                                              {block.blockNumber}
                                              {block.sizeLabel
                                                ? ` • ${block.sizeLabel}`
                                                : ""}
                                            </option>
                                          ))}
                                        </select>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}

                              <FormField
                                control={control}
                                name={`items.${index}.status`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Item Status</FormLabel>
                                    <FormControl>
                                      <select
                                        {...field}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                      >
                                        <option value="PENDING">Pending</option>
                                        <option value="CUTTING">Cutting</option>
                                        <option value="SEWING">Sewing</option>
                                        <option value="READY">Ready</option>
                                        <option value="DELIVERED">
                                          Delivered
                                        </option>
                                        <option value="CANCELLED">
                                          Cancelled
                                        </option>
                                      </select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={control}
                                name={`items.${index}.lineTotal`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Line Total</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        readOnly
                                        className="bg-slate-100"
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
                                  <FormItem className="sm:col-span-2">
                                    <FormLabel>Item Note</FormLabel>
                                    <FormControl>
                                      <Input
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
                                name={`items.${index}.tailorNote`}
                                render={({ field }) => (
                                  <FormItem className="sm:col-span-2">
                                    <FormLabel>Tailor Note</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Use previous cutting style"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <Ruler className="h-4 w-4 text-slate-500" />
                                  <p className="text-sm font-bold text-slate-800">
                                    Measurements
                                  </p>
                                </div>

                                {isPrefilledItem && (
                                  <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                                    Attached
                                  </Badge>
                                )}
                              </div>

                              {isPrefilledItem && (
                                <p className="mb-3 rounded-lg bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-700">
                                  Measurements are attached from customer
                                  confirmation. Edit them from customer details
                                  before placing the order.
                                </p>
                              )}

                              <MeasurementFields
                                fields={measurementFields}
                                values={watchedItem?.measurements ?? {}}
                                disabled={isPrefilledItem}
                                onChange={(key, value) =>
                                  handleMeasurementChange(index, key, value)
                                }
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </SectionCard>
                </div>

                <aside className="space-y-4">
                  <SectionCard title="Payment Summary">
                    <div className="space-y-3">
                      <FormField
                        control={control}
                        name="totalQty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Qty</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                readOnly
                                className="bg-slate-100"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="totalAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                readOnly
                                className="bg-slate-100"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="courierCharges"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Courier Charges</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} {...field} />
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
                              <Input type="number" min={0} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="balanceAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Balance Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                readOnly
                                className="bg-slate-100"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Items</span>
                        <span className="font-bold text-slate-900">
                          {watchedItems?.length ?? 0}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-slate-500">Balance</span>
                        <span className="font-black text-slate-900">
                          {calculatedBalance.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </SectionCard>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-bold text-slate-900">
                      Before creating
                    </p>
                    <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
                      <li>Confirm promised date.</li>
                      <li>Confirm category and block.</li>
                      <li>Confirm measurement values.</li>
                      <li>Enter advance payment if collected.</li>
                    </ul>
                  </div>
                </aside>
              </div>
            </div>

            <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-3">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
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
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogOpenChange(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    (hasMeasurementPrefill && isPrefillMeasurementLoading) ||
                    (hasMeasurementPrefill && !prefillMeasurement) ||
                    (!hasMeasurementPrefill &&
                      isDashboardFlow &&
                      isPrefilledCustomerLoading) ||
                    (!hasMeasurementPrefill &&
                      isDashboardFlow &&
                      !prefilledCustomer) ||
                    (isDashboardFlow && !isDashboardReady)
                  }
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting ? "Creating..." : "Create Order"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}