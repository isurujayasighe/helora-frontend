"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Plus,
  Search,
  Trash2,
  UserRound,
  Package2,
  Ruler,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useFindCustomerByPhoneMutation,
  type CustomerByPhone,
} from "@/api/useFindCustomerByPhone";
import {
  MeasurementFields,
  type MeasurementFieldConfig,
} from "./measurement-fields";
import { generateOrderPdf } from "@/utils/generate-order-pdf";

const measurementValuesSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.undefined()]),
);

function generateDraftOrderPdf(
  values: CreateOrderFormInput,
  foundCustomer?: CustomerByPhone | null,
  categories: CategoryOption[] = [],
) {
  const customerMode = values.customerMode ?? "existing";
  const draftOrder = {
    id: "draft-order",
    tenantId: "",
    customerId: values.customerId || "",
    orderNumber: values.orderNumber || "DRAFT",
    orderDate: values.orderDate,
    promisedDate: values.promisedDate,
    status: values.status,
    notes: values.notes,
    totalAmount: values.totalAmount,
    advanceAmount: values.advanceAmount,
    balanceAmount: values.balanceAmount,
    customer: {
      id: values.customerId || "draft-customer",
      tenantId: "",
      fullName:
        customerMode === "existing"
          ? foundCustomer?.fullName || values.customerName || "-"
          : values.customerName || "-",

      alternatePhone:
        customerMode === "existing"
          ? foundCustomer?.alternatePhone || null
          : null,

      town:
        customerMode === "existing"
          ? foundCustomer?.town || values.customerTown || "-"
          : values.customerTown || "-",

      address:
        customerMode === "existing"
          ? foundCustomer?.address || values.customerAddress || "-"
          : values.customerAddress || "-",

      notes:
        customerMode === "existing"
          ? foundCustomer?.notes || values.customerNotes || "-"
          : values.customerNotes || "-",
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
        itemDescription: item.itemDescription,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        notes: item.notes,
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
const orderItemSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  itemDescription: z.string().min(1, "Item description is required"),
  quantity: z.coerce.number().min(1, "Qty must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price must be 0 or more"),
  lineTotal: z.coerce.number().min(0),
  notes: z.string().optional(),
  blockMode: z.enum(["existing", "new"]).default("new"),
  blockId: z.string().optional(),
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

  orderNumber: z.string().min(1, "Order number is required"),
  orderDate: z.string().min(1, "Order date is required"),
  promisedDate: z.string().min(1, "Promised date is required"),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  notes: z.string().optional(),
  orderSource: z.enum(["DREZAURA", "PHYSICAL_SHOP"]).default("PHYSICAL_SHOP"),
  totalAmount: z.coerce.number().min(0),
  advanceAmount: z.coerce.number().min(0),
  balanceAmount: z.coerce.number().min(0),

  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

type CreateOrderFormInput = z.input<typeof formSchema>;
type CreateOrderFormValues = z.output<typeof formSchema>;

type OrderSource = "DREZAURA" | "PHYSICAL_SHOP";

type CategoryOption = {
  id: string;
  name: string;
};

type CreateOrderPayload = {
  customerId?: string;
  customer?: {
    fullName?: string;
    phoneNumber: string;
    town?: string;
    address?: string;
    notes?: string;
  };
  orderNumber: string;
  orderDate: string;
  promisedDate: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes?: string;
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  orderSource: OrderSource;
  items: Array<{
    categoryId: string;
    blockId?: string | null;
    requiresNewBlock: boolean;
    itemDescription: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    notes?: string;
    measurements?: Record<string, string | number | undefined>;
  }>;
};

type CreateOrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (payload: CreateOrderPayload) => Promise<void> | void;
  categories?: CategoryOption[];
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
    { key: "sleeveLength", label: "Sleeve Length", unit: "in" },
    { key: "shirtLength", label: "Shirt Length", unit: "in" },
  ],
  cmo8n1mxw000sdk642l58ko48: [
    { key: "bust", label: "Bust", unit: "in" },
    { key: "waist", label: "Waist", unit: "in" },
    { key: "blouseLength", label: "Blouse Length", unit: "in" },
    { key: "shoulder", label: "Shoulder", unit: "in" },
    { key: "armhole", label: "Armhole", unit: "in" },
    { key: "sleeveLength", label: "Sleeve Length", unit: "in" },
  ],
  "cat-saree": [
    { key: "waist", label: "Waist", unit: "in" },
    { key: "hip", label: "Hip", unit: "in" },
    { key: "height", label: "Height", unit: "in" },
    { key: "blouseBust", label: "Blouse Bust", unit: "in" },
    { key: "blouseLength", label: "Blouse Length", unit: "in" },
  ],
  "cat-shirt": [
    { key: "chest", label: "Chest", unit: "in" },
    { key: "waist", label: "Waist", unit: "in" },
    { key: "shoulder", label: "Shoulder", unit: "in" },
    { key: "neck", label: "Neck", unit: "in" },
    { key: "sleeveLength", label: "Sleeve Length", unit: "in" },
    { key: "shirtLength", label: "Shirt Length", unit: "in" },
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

const buildInitialItem = (): CreateOrderFormInput["items"][number] => ({
  categoryId: "",
  itemDescription: "",
  quantity: 1,
  unitPrice: 0,
  lineTotal: 0,
  notes: "",
  blockMode: "new",
  blockId: "",
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
  orderNumber: "",
  orderDate: todayInputValue(),
  promisedDate: addDaysInputValue(7),
  status: "PENDING",
  notes: "",
  totalAmount: 0,
  advanceAmount: 0,
  balanceAmount: 0,
  items: [buildInitialItem()],
});

export function CreateOrderDialog({
  open,
  onOpenChange,
  onSubmit,
  categories = defaultCategories,
}: CreateOrderDialogProps) {
  const [foundCustomer, setFoundCustomer] = useState<CustomerByPhone | null>(
    null,
  );
  const [customerSearched, setCustomerSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const findCustomerMutation = useFindCustomerByPhoneMutation();

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

  const calculatedTotal = useMemo(() => {
    return (watchedItems || []).reduce((sum, item) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.unitPrice || 0);
      return sum + qty * price;
    }, 0);
  }, [watchedItems]);

  const calculatedBalance = Math.max(
    0,
    calculatedTotal - Number(watchedAdvance || 0),
  );

  useEffect(() => {
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
  }, [calculatedTotal, calculatedBalance, watchedItems, setValue]);

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
        setValue("customerId", customer?.data?.id);
        setValue("customerName", customer?.data?.fullName);
        setValue("customerTown", customer?.data?.town || "");
        setValue("customerAddress", customer?.data?.address || "");
        setValue("customerNotes", customer?.data?.notes || "");
      } else {
        setFoundCustomer(null);
        setValue("customerMode", "new");
        setValue("customerId", "");
        setValue("customerName", "");
        setValue("customerTown", "");
        setValue("customerAddress", "");
        setValue("customerNotes", "");
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
    setIsSubmitting(true);

    try {
      const payload: CreateOrderPayload = {
        customerId:
          values.customerMode === "existing" ? values.customerId : undefined,
        customer:
          values.customerMode === "new"
            ? {
                fullName: values.customerName,
                phoneNumber: values.phoneNumber,
                town: values.customerTown,
                address: values.customerAddress,
                notes: values.customerNotes,
              }
            : undefined,
        orderNumber: values.orderNumber,
        orderDate: toIsoDateString(values.orderDate),
        promisedDate: toIsoDateString(values.promisedDate),
        status: values.status,
        orderSource: values.orderSource,
        notes: values.notes,
        totalAmount: Number(values.totalAmount),
        advanceAmount: Number(values.advanceAmount),
        balanceAmount: Number(values.balanceAmount),
        items: values.items.map((item) => ({
          categoryId: item.categoryId,
          blockId: item.blockMode === "existing" ? item.blockId || null : null,
          requiresNewBlock: item.blockMode === "new",
          itemDescription: item.itemDescription,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          lineTotal: Number(item.lineTotal),
          notes: item.notes,
          measurements: item.measurements,
        })),
      };

      if (onSubmit) {
        await onSubmit(payload);
      }

      handleDialogOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSearchingCustomer = findCustomerMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Search customer by phone number, review existing blocks, add
            measurements by category, and decide whether to reuse a block or
            create a new block later for each item.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(submitOrder)} className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="mb-4 flex items-center gap-2">
                <UserRound className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-800">
                  Customer Identification
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
                <FormField
                  control={control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter customer phone number"
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
                    onClick={handleSearchCustomer}
                    disabled={isSearchingCustomer}
                    className="w-full md:w-auto"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {isSearchingCustomer ? "Searching..." : "Find Customer"}
                  </Button>
                </div>
              </div>

              {findCustomerMutation.isError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  Unable to fetch customer details. Please try again.
                </div>
              )}

              {customerSearched && foundCustomer && (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold text-emerald-800">
                      Existing customer found
                    </p>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      Existing
                    </Badge>
                  </div>

                  <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {foundCustomer.fullName}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {foundCustomer.phoneNumber}
                    </p>
                    <p>
                      <span className="font-medium">Town:</span>{" "}
                      {foundCustomer.town || "-"}
                    </p>
                    <p>
                      <span className="font-medium">Address:</span>{" "}
                      {foundCustomer.address || "-"}
                    </p>
                  </div>

                  {foundCustomer.blocks && foundCustomer.blocks.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-medium text-slate-700">
                        Existing Blocks
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {foundCustomer.blocks.map((block) => (
                          <Badge
                            key={block.id}
                            variant="secondary"
                            className="border border-slate-200 bg-white text-slate-700"
                          >
                            {block.blockNumber}
                            {block.category?.name
                              ? ` • ${block.category.name}`
                              : ""}
                            {block.isDefault ? " • Default" : ""}
                          </Badge>
                        ))}
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        After checking the physical block and measurements, you
                        can reuse an existing block or mark a new block to be
                        created later for each item.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {customerSearched &&
                !foundCustomer &&
                !isSearchingCustomer &&
                !findCustomerMutation.isError && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-semibold text-amber-800">
                        Customer not found. Add new customer details
                      </p>
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                        New Customer
                      </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter customer name"
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
                              <Input placeholder="Enter town" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="customerAddress"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="customerNotes"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Customer Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any customer-related notes"
                                className="min-h-22.5"
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
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="mb-4 text-sm font-semibold text-slate-800">
                Order Details
              </h3>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FormField
                  control={control}
                  name="orderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Number</FormLabel>
                      <FormControl>
                        <Input placeholder="ORD-1001" {...field} />
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
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
                      <FormLabel>Order Source</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="PHYSICAL_SHOP">Physical Shop</option>
                          <option value="DREZAURA">Drezaura</option>
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
                    <FormItem className="md:col-span-2 xl:col-span-4">
                      <FormLabel>Order Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add order notes"
                          className="min-h-22.5"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Package2 className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-800">
                    Order Items
                  </h3>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append(buildInitialItem())}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((itemField, index) => {
                  const selectedCategoryId = watchedItems?.[index]?.categoryId;
                  const selectedBlockMode = watchedItems?.[index]?.blockMode;
                  const selectedMeasurements =
                    watchedItems?.[index]?.measurements || {};
                  const availableBlocks = getFilteredBlocks(selectedCategoryId);
                  const measurementFields =
                    getMeasurementFields(selectedCategoryId);

                  return (
                    <div
                      key={itemField.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/40 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-700">
                          Item {index + 1}
                        </p>

                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <FormField
                          control={control}
                          name={`items.${index}.categoryId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <select
                                  {...field}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    setValue(`items.${index}.blockId`, "");
                                    setValue(`items.${index}.measurements`, {});
                                  }}
                                >
                                  <option value="">Select category</option>
                                  {categories.map((category) => (
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
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
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
                                <Input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  {...field}
                                />
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
                                  value={
                                    Number(
                                      watchedItems?.[index]?.quantity || 0,
                                    ) *
                                    Number(
                                      watchedItems?.[index]?.unitPrice || 0,
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="xl:col-span-4">
                          <FormField
                            control={control}
                            name={`items.${index}.itemDescription`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Item Description</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Eg: 2 school uniforms"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {measurementFields.length > 0 && (
                          <div className="xl:col-span-4">
                            <div className="mb-2 flex items-center gap-2">
                              <Ruler className="h-4 w-4 text-slate-500" />
                              <span className="text-sm font-medium text-slate-700">
                                Measurements for selected category
                              </span>
                            </div>

                            <MeasurementFields
                              fields={measurementFields}
                              value={selectedMeasurements}
                              onChange={(key, value) =>
                                handleMeasurementChange(index, key, value)
                              }
                            />
                          </div>
                        )}

                        <div className="xl:col-span-4 rounded-lg border border-slate-200 bg-white p-4">
                          <FormField
                            control={control}
                            name={`items.${index}.blockMode`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Block Handling</FormLabel>
                                <FormControl>
                                  <div className="flex flex-col gap-3 sm:flex-row">
                                    <label className="flex items-center gap-2 text-sm text-slate-700">
                                      <input
                                        type="radio"
                                        value="existing"
                                        checked={field.value === "existing"}
                                        onChange={() =>
                                          field.onChange("existing")
                                        }
                                        disabled={
                                          !foundCustomer ||
                                          availableBlocks.length === 0
                                        }
                                      />
                                      Use Existing Block
                                    </label>

                                    <label className="flex items-center gap-2 text-sm text-slate-700">
                                      <input
                                        type="radio"
                                        value="new"
                                        checked={field.value === "new"}
                                        onChange={() => {
                                          field.onChange("new");
                                          setValue(
                                            `items.${index}.blockId`,
                                            "",
                                          );
                                        }}
                                      />
                                      Create New Block Later
                                    </label>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {selectedBlockMode === "existing" && (
                            <div className="mt-4">
                              <FormField
                                control={control}
                                name={`items.${index}.blockId`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Select Existing Block</FormLabel>
                                    <FormControl>
                                      <select
                                        {...field}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        disabled={
                                          !foundCustomer ||
                                          availableBlocks.length === 0
                                        }
                                      >
                                        <option value="">
                                          {availableBlocks.length === 0
                                            ? "No matching blocks for selected category"
                                            : "Select block"}
                                        </option>
                                        {availableBlocks.map((block) => (
                                          <option
                                            key={block.id}
                                            value={block.id}
                                          >
                                            {block.blockNumber}
                                            {block.sizeLabel
                                              ? ` • ${block.sizeLabel}`
                                              : ""}
                                            {block.versionNo
                                              ? ` • V${block.versionNo}`
                                              : ""}
                                          </option>
                                        ))}
                                      </select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {availableBlocks.length === 0 && (
                                <p className="mt-2 text-xs text-amber-600">
                                  No existing block matches this category.
                                  Choose “Create New Block Later”.
                                </p>
                              )}
                            </div>
                          )}

                          {selectedBlockMode === "new" && (
                            <p className="mt-4 text-xs text-slate-500">
                              A new block will be prepared after order
                              placement.
                            </p>
                          )}
                        </div>

                        <div className="xl:col-span-4">
                          <FormField
                            control={control}
                            name={`items.${index}.notes`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Item Notes</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Eg: urgent item, special stitching, etc."
                                    className="min-h-20"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="mb-4 text-sm font-semibold text-slate-800">
                Payment Summary
              </h3>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-slate-100" />
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
                        <Input type="number" min={0} step="0.01" {...field} />
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
                        <Input {...field} readOnly className="bg-slate-100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogOpenChange(false)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() =>
                  generateDraftOrderPdf(
                    form.getValues(),
                    foundCustomer,
                    categories,
                  )
                }
              >
                <Printer className="h-4 w-4" />
                Print Order
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn("min-w-35")}
              >
                {isSubmitting ? "Creating..." : "Create Order"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
