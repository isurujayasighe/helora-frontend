"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, type SubmitHandler } from "react-hook-form";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Plus,
  Ruler,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  useFindCustomerByPhoneMutation,
  type CustomerByPhone,
} from "@/api/useFindCustomerByPhone";
import { useGetCustomerById } from "@/modules/app/customers/api/useGetCustomerbyId";
import { useGetLatestMeasurement } from "@/api/useGetLatestMeasurement";
import { useGetCategories } from "@/api/useGetCategories";
import {
  useCreateOrder,
  type CreateOrderPayload,
  type OrderItemStatus,
  type OrderPaymentMode,
  type OrderSource,
  type OrderStatus,
  type PaymentStatus,
} from "@/api/useCreateOrder";

import { MeasurementFields } from "@/components/layout/components/measurements-fields";

import { formSchema } from "./schema/create-order.schema";
import {
  CATEGORY_MEASUREMENTS,
  ORDER_ITEM_STATUS_OPTIONS,
  ORDER_SOURCE_OPTIONS,
  ORDER_STATUS_OPTIONS,
  PAYMENT_MODE_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "./constants/create-order.constants";
import {
  buildInitialItem,
  buildInitialValues,
  buildMeasurementFieldsFromApi,
  buildMeasurementMap,
  hasMeasurementValues,
  toIsoDateString,
} from "./helpers/create-order.helpers";
import {
  mapCustomerDetailsToCustomerByPhone,
  mapPrefillMeasurementToCustomerByPhone,
} from "./helpers/create-order-customer-mapper";
import type {
  CategoryOption,
  CreateOrderFormInput,
  CreateOrderFormValues,
  CreateOrderPageProps,
} from "./types/create-order.types";
import {
  PageHeader,
  SectionCard,
  SelectInput,
  SummaryMetric,
} from "./components/create-order-shared";

export function CreateOrderPage({ prefill, onSubmit }: CreateOrderPageProps) {
  const navigate = useNavigate();

  const [foundCustomer, setFoundCustomer] = useState<CustomerByPhone | null>(
    null,
  );
  const [customerSearched, setCustomerSearched] = useState(false);

  const isPrefillFlow = Boolean(prefill?.customerId);
  const hasMeasurementPrefill = Boolean(prefill?.measurementId);

  const findCustomerMutation = useFindCustomerByPhoneMutation();
  const createOrderMutation = useCreateOrder();

  const {
    data: apiCategories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useGetCategories();

  const { data: prefillMeasurement, isLoading: isPrefillMeasurementLoading } =
    useGetLatestMeasurement({
      customerId: prefill?.customerId,
      blockId: prefill?.blockId,
      categoryId: prefill?.categoryId,
      enabled: hasMeasurementPrefill,
    });

  const { data: prefilledCustomer, isLoading: isPrefilledCustomerLoading } =
    useGetCustomerById(
      prefill?.customerId,
      isPrefillFlow && !hasMeasurementPrefill,
    );

  const activeCategories = useMemo<CategoryOption[]>(() => {
    return apiCategories
      .filter((category) => category.isActive)
      .map((category) => ({
        id: category.id,
        name: category.name,
        isActive: category.isActive,
      }));
  }, [apiCategories]);

  const categoriesForForm = useMemo<CategoryOption[]>(() => {
    if (!prefillMeasurement?.category) return activeCategories;

    const exists = activeCategories.some(
      (category) => category.id === prefillMeasurement.category?.id,
    );

    if (exists) return activeCategories;

    return [
      {
        id: prefillMeasurement.category.id,
        name: prefillMeasurement.category.name,
        isActive: true,
      },
      ...activeCategories,
    ];
  }, [activeCategories, prefillMeasurement?.category]);

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
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);

      return sum + quantity * unitPrice;
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
      const lineTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);

      if (Number(item.lineTotal || 0) !== lineTotal) {
        setValue(`items.${index}.lineTotal`, lineTotal, {
          shouldValidate: false,
          shouldDirty: true,
        });
      }
    });
  }, [calculatedQty, calculatedTotal, calculatedBalance, watchedItems, setValue]);

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

    setFoundCustomer(mapPrefillMeasurementToCustomerByPhone(prefillMeasurement));
    setCustomerSearched(true);
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

    reset({
      ...buildInitialValues(),
      phoneNumber: prefilledCustomer.data.phoneNumber ?? "",
      customerMode: "existing",
      customerId: prefilledCustomer.data.id,
      customerName: prefilledCustomer.data.fullName ?? "",
      customerTown: prefilledCustomer.data.town ?? "",
      customerAddress: prefilledCustomer.data.address ?? "",
      customerNotes: prefilledCustomer.data.notes ?? "",
      hospitalName: prefilledCustomer.data.hospitalName ?? "",
      orderSource: "PHYSICAL_SHOP",
      paymentStatus: "UNPAID",
      paymentMode: "CASH",
      items: [buildInitialItem()],
    });

    setFoundCustomer(mapCustomerDetailsToCustomerByPhone(prefilledCustomer.data));
    setCustomerSearched(true);
  }, [
    isPrefillFlow,
    hasMeasurementPrefill,
    isPrefilledCustomerLoading,
    prefilledCustomer,
    reset,
  ]);

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

      if (customer?.data) {
        setFoundCustomer(customer.data);
        setValue("customerMode", "existing");
        setValue("customerId", customer.data.id);
        setValue("customerName", customer.data.fullName);
        setValue("customerTown", customer.data.town || "");
        setValue("customerAddress", customer.data.address || "");
        setValue("customerNotes", customer.data.notes || "");
        setValue("hospitalName", customer.data.hospitalName || "");
      } else {
        setFoundCustomer(null);
        setValue("customerMode", "new");
        setValue("customerId", "");
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
      items: values.items.map((item) => {
        const shouldUseExistingBlock = item.blockMode === "existing";
        const shouldSendMeasurements =
          !item.measurementId && hasMeasurementValues(item.measurements);

        return {
          categoryId: item.categoryId,
          blockId: shouldUseExistingBlock
            ? item.blockId || undefined
            : undefined,
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
          measurementNote: shouldSendMeasurements
            ? item.measurementNote || undefined
            : undefined,
        };
      }),
    };

    await createOrderMutation.mutateAsync(payload);

    if (onSubmit) {
      await onSubmit(payload);
    }

    navigate({ to: "/app/orders" });
  };

  const isSearchingCustomer = findCustomerMutation.isPending;
  const isSubmitting = createOrderMutation.isPending;

  const isPrefillLoading = hasMeasurementPrefill
    ? isPrefillMeasurementLoading
    : isPrefillFlow
      ? isPrefilledCustomerLoading
      : false;

  const isSubmitDisabled =
    isSubmitting || isPrefillLoading || isCategoriesLoading;

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitOrder)}>
          <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:px-6">
              <PageHeader />

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
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
                  disabled={isSubmitDisabled}
                  className="rounded-lg bg-slate-900 hover:bg-slate-800"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting ? "Creating..." : "Create Order"}
                </Button>
              </div>
            </div>
          </div>

          <main className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[1fr_340px] lg:px-6">
            <div className="space-y-5">
              {isCategoriesError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  Categories could not be loaded. Please refresh the page.
                </div>
              )}

              <SectionCard
                title="Customer"
                description="Find the customer first. New customer creation should happen before order creation."
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
                      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                        <FormField
                          control={control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Phone number / customer lookup
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="rounded-lg"
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
                            className="w-full rounded-lg sm:w-auto"
                          >
                            {isSearchingCustomer ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Search className="mr-2 h-4 w-4" />
                            )}
                            Find Customer
                          </Button>
                        </div>
                      </div>
                    )}

                    {customerSearched && foundCustomer && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-emerald-950">
                              {foundCustomer.fullName}
                            </p>
                            <p className="mt-0.5 text-xs text-emerald-700">
                              {foundCustomer.phoneNumber}
                              {foundCustomer.town
                                ? ` • ${foundCustomer.town}`
                                : ""}
                            </p>
                          </div>

                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                        </div>
                      </div>
                    )}

                    {customerSearched && !foundCustomer && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                        Customer not found. Create the customer first, then come
                        back to create the order.
                      </div>
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
                                className="rounded-lg"
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
                              <Input className="rounded-lg" {...field} />
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
                              <Input className="rounded-lg" {...field} />
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
                        <FormLabel>Promised Date</FormLabel>
                        <FormControl>
                          <Input className="rounded-lg" type="date" {...field} />
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

              <SectionCard
                title="Order Items & Measurements"
                description="Use measurement-only when the block will be created later from the block page."
                icon={ClipboardList}
                action={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => append(buildInitialItem())}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                }
              >
                <div className="space-y-4">
                  {fields.map((field, index) => {
                    const watchedItem = watchedItems?.[index];
                    const categoryId = watchedItem?.categoryId;
                    const blocks = getFilteredBlocks(categoryId);
                    const measurementFields = getMeasurementFields(categoryId);
                    const isExistingMeasurement = Boolean(
                      watchedItem?.measurementId,
                    );
                    const isExistingBlock =
                      watchedItem?.blockMode === "existing";

                    return (
                      <div
                        key={field.id}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              Item {index + 1}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {isExistingBlock
                                ? "Using existing customer block."
                                : "Measurements will be saved now; block can be linked later."}
                            </p>
                          </div>

                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="rounded-lg"
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
                                  <SelectInput
                                    {...field}
                                    disabled={
                                      isExistingMeasurement ||
                                      isCategoriesLoading
                                    }
                                  >
                                    <option value="">
                                      {isCategoriesLoading
                                        ? "Loading categories..."
                                        : "Select category"}
                                    </option>

                                    {categoriesForForm.map((category) => (
                                      <option
                                        key={category.id}
                                        value={category.id}
                                      >
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
                            name={`items.${index}.quantity`}
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
                            name={`items.${index}.unitPrice`}
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
                            name={`items.${index}.blockMode`}
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
                                      Existing block
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
                              name={`items.${index}.blockId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Block No</FormLabel>
                                  <FormControl>
                                    <SelectInput
                                      {...field}
                                      disabled={isExistingMeasurement}
                                    >
                                      <option value="">Select block</option>
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
                            name={`items.${index}.status`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Item Status</FormLabel>
                                <FormControl>
                                  <SelectInput {...field}>
                                    {ORDER_ITEM_STATUS_OPTIONS.map((option) => (
                                      <option
                                        key={option.value}
                                        value={option.value}
                                      >
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
                            name={`items.${index}.lineTotal`}
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
                            name={`items.${index}.notes`}
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
                            name={`items.${index}.tailorNote`}
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

                        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
                          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                              <Ruler className="h-4 w-4 text-slate-500" />
                              <div>
                                <p className="text-sm font-bold text-slate-800">
                                  Measurements
                                </p>
                                <p className="text-xs text-slate-500">
                                  {isExistingMeasurement
                                    ? "Existing measurement is attached."
                                    : "These measurements are saved with the order and can be linked to a block later."}
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

                          <MeasurementFields
                            fields={measurementFields}
                            values={watchedItem?.measurements ?? {}}
                            disabled={isExistingMeasurement}
                            onChange={(key, value) =>
                              handleMeasurementChange(index, key, value)
                            }
                          />

                          <FormField
                            control={control}
                            name={`items.${index}.measurementNote`}
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
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-36 lg:self-start">
              <SectionCard title="Payment Summary" icon={Banknote}>
                <div className="grid gap-3">
                  <SummaryMetric
                    label="Items"
                    value={watchedItems?.length ?? 0}
                  />
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
                    Block will be linked later
                  </p>
                  <p className="mt-2 text-xs leading-5 text-amber-800">
                    For new measurements, this page sends{" "}
                    <strong>measurements</strong> and{" "}
                    <strong>measurementNote</strong> with the order item. The
                    block page can later search those unlinked measurements by
                    customer name or phone and connect them to a block.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm font-bold text-slate-900">
                    Before creating
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

export default CreateOrderPage;