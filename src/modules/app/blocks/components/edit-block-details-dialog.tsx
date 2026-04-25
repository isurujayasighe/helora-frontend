"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Blocks, Loader2, Search, Trash2, X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
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

import { cn } from "@/lib/utils";
import { useGetBlockById } from "../api/useGetBlockById";
import { useGetCategories } from "../api/useGetCategories";
import { useUpdateBlock } from "../api/useUpdateBlock";
import {
  useCustomerLookup,
  type CustomerLookupItem,
} from "@/api/useGetCustomerLookup";

const editBlockSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  blockNumber: z.string().min(1, "Block number is required"),
  readyMadeSize: z.string().optional(),
  sizeLabel: z.string().optional(),
  fitNotes: z.string().optional(),
  versionNo: z.coerce.number().min(1).default(1),
  previousBlockId: z.string().optional(),
  description: z.string().optional(),
  status: z.string().default("ACTIVE"),
  remarks: z.string().optional(),
  legacyId: z.coerce.number().optional(),
  customers: z
    .array(
      z.object({
        customerId: z.string().min(1, "Customer is required"),
        isDefault: z.boolean().default(false),
      })
    )
    .min(1, "At least one customer is required"),
});

type EditBlockFormValues = z.infer<typeof editBlockSchema>;

type EditBlockDialogProps = {
  blockId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const defaultValues: EditBlockFormValues = {
  categoryId: "",
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
  customers: [],
};

export function EditBlockDialog({
  blockId,
  open,
  onOpenChange,
}: EditBlockDialogProps) {
  const updateBlockMutation = useUpdateBlock();
  const customerLookupMutation = useCustomerLookup();

  const {
    data: blockResponse,
    isLoading: isBlockLoading,
    isFetching: isBlockFetching,
  } = useGetBlockById(blockId, open);

  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    useGetCategories(open);

  const block = blockResponse?.data;
  const categories = categoriesResponse?.data ?? [];

  const [customerSearch, setCustomerSearch] = useState("");
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState("");
  const [selectedCustomerMap, setSelectedCustomerMap] = useState<
    Record<string, CustomerLookupItem>
  >({});

  const form = useForm<EditBlockFormValues>({
    resolver: zodResolver(editBlockSchema),
    defaultValues,
  });

  const { control, handleSubmit, reset, watch, setValue } = form;

  const { fields, append, replace } = useFieldArray({
    control,
    name: "customers",
  });

  const selectedCustomers = watch("customers");

  const selectedCustomerIds = useMemo(
    () => selectedCustomers.map((item) => item.customerId).filter(Boolean),
    [selectedCustomers]
  );

  const customerOptions = customerLookupMutation.data?.data ?? [];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedCustomerSearch(customerSearch.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [customerSearch]);

  useEffect(() => {
    if (!open) return;

    if (debouncedCustomerSearch.length < 2) {
      customerLookupMutation.reset();
      return;
    }

    customerLookupMutation.mutate({
      search: debouncedCustomerSearch,
      limit: 10,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, debouncedCustomerSearch]);

  useEffect(() => {
    if (!open || !block) return;

    const existingCustomers: Record<string, CustomerLookupItem> = {};

    block.customerBlocks?.forEach((item) => {
      existingCustomers[item.customerId] = {
        id: item.customer.id,
        fullName: item.customer.fullName,
        phoneNumber: item.customer.phoneNumber,
        alternatePhone: item.customer.alternatePhone,
        town: item.customer.town,
      };
    });

    const mappedCustomers =
      block.customerBlocks?.map((item) => ({
        customerId: item.customerId,
        isDefault: item.isDefault,
      })) ?? [];

    reset({
      categoryId: block.categoryId,
      blockNumber: block.blockNumber,
      readyMadeSize: block.readyMadeSize ?? "",
      sizeLabel: block.sizeLabel ?? "",
      fitNotes: block.fitNotes ?? "",
      versionNo: block.versionNo ?? 1,
      previousBlockId: block.previousBlockId ?? "",
      description: block.description ?? "",
      status: block.status ?? "ACTIVE",
      remarks: block.remarks ?? "",
      legacyId: block.legacyId ?? undefined,
      customers: mappedCustomers,
    });

    replace(mappedCustomers);
    setSelectedCustomerMap(existingCustomers);
  }, [open, block, reset, replace]);

  const handleClose = () => {
    reset(defaultValues);
    replace([]);
    setCustomerSearch("");
    setDebouncedCustomerSearch("");
    setSelectedCustomerMap({});
    customerLookupMutation.reset();
    onOpenChange(false);
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      handleClose();
      return;
    }

    onOpenChange(true);
  };

  const onSubmit = async (values: EditBlockFormValues) => {
    if (!blockId) return;

    await updateBlockMutation.mutateAsync({
      blockId,
      payload: {
        categoryId: values.categoryId,
        blockNumber: values.blockNumber.trim(),
        readyMadeSize: values.readyMadeSize?.trim() || undefined,
        sizeLabel: values.sizeLabel?.trim() || undefined,
        fitNotes: values.fitNotes?.trim() || undefined,
        versionNo: values.versionNo,
        previousBlockId: values.previousBlockId?.trim() || undefined,
        description: values.description?.trim() || undefined,
        status: values.status || "ACTIVE",
        remarks: values.remarks?.trim() || undefined,
        legacyId:
          values.legacyId === undefined || Number.isNaN(values.legacyId)
            ? undefined
            : values.legacyId,
        customers: values.customers.map((customer) => ({
          customerId: customer.customerId,
          isDefault: customer.isDefault,
        })),
      },
    });

    handleClose();
  };

  const setDefaultCustomer = (index: number) => {
    selectedCustomers.forEach((_, currentIndex) => {
      setValue(`customers.${currentIndex}.isDefault`, currentIndex === index, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  };

  const handleAssignCustomer = (customer: CustomerLookupItem) => {
    if (selectedCustomerIds.includes(customer.id)) {
      return;
    }

    append({
      customerId: customer.id,
      isDefault: selectedCustomerIds.length === 0,
    });

    setSelectedCustomerMap((previous) => ({
      ...previous,
      [customer.id]: customer,
    }));

    setCustomerSearch("");
    setDebouncedCustomerSearch("");
    customerLookupMutation.reset();
  };

  const handleRemoveCustomer = (index: number, customerId: string) => {
    const isRemovingDefault = selectedCustomers[index]?.isDefault;

    const remainingCustomers = selectedCustomers.filter(
      (_, currentIndex) => currentIndex !== index
    );

    const nextCustomers =
      isRemovingDefault && remainingCustomers.length > 0
        ? remainingCustomers.map((customer, currentIndex) => ({
            ...customer,
            isDefault: currentIndex === 0,
          }))
        : remainingCustomers;

    replace(nextCustomers);

    setSelectedCustomerMap((previous) => {
      const next = { ...previous };
      delete next[customerId];
      return next;
    });
  };

  const getSelectedCustomer = (customerId?: string) => {
    if (!customerId) return null;

    return (
      selectedCustomerMap[customerId] ??
      customerOptions.find((customer) => customer.id === customerId) ??
      null
    );
  };

  const isBusy =
    isBlockLoading ||
    isCategoriesLoading ||
    updateBlockMutation.isPending ||
    isBlockFetching;

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-h-[92vh] sm:max-w-5xl overflow-hidden p-0 gap-0">
        <DialogHeader className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Blocks className="h-4 w-4" />
                </span>
                Edit Block
              </DialogTitle>
              <p className="mt-1 text-sm text-slate-500">
                Update block details and manage assigned customers.
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
          {isBlockLoading ? (
            <div className="flex min-h-80 items-center justify-center text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading block details...
            </div>
          ) : !block ? (
            <div className="flex min-h-80 items-center justify-center text-sm text-slate-500">
              Block details not found.
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5">
                <section className="rounded-xl border border-slate-200 bg-white">
                  <SectionHeader
                    title="Block Information"
                    description="Update the basic block details used for searching and assignment."
                  />

                  <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
                    <FormField
                      control={control}
                      name="blockNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Block No</FormLabel>
                          <FormControl>
                            <Input placeholder="UNI-1001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              disabled={isCategoriesLoading}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <option value="">
                                {isCategoriesLoading
                                  ? "Loading categories..."
                                  : "Select category"}
                              </option>

                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
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
                      name="readyMadeSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ready Made Size</FormLabel>
                          <FormControl>
                            <Input placeholder="M" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="versionNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Version</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="sizeLabel"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Size Label</FormLabel>
                          <FormControl>
                            <Input placeholder="Standard Medium" {...field} />
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
                              <option value="ACTIVE">Active</option>
                              <option value="INACTIVE">Inactive</option>
                              <option value="ARCHIVED">Archived</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="legacyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legacy ID</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="52"
                              value={field.value ?? ""}
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value
                                    ? Number(event.target.value)
                                    : undefined
                                )
                              }
                            />
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
                    description="Optional tailoring notes and internal remarks."
                  />

                  <div className="grid gap-4 p-4 md:grid-cols-3">
                    <FormField
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Sample uniform block"
                              className="min-h-24 resize-none"
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
                        <FormItem>
                          <FormLabel>Fit Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Uniform block for regular fit"
                              className="min-h-24 resize-none"
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
                        <FormItem>
                          <FormLabel>Remarks</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Default uniform block"
                              className="min-h-24 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white">
                  <SectionHeader
                    title="Assigned Customers"
                    description="Search and assign customers who can use this block."
                  />

                  <div className="space-y-4 p-4">
                    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                      <label className="mb-2 block text-xs font-semibold text-slate-700">
                        Search Customer
                      </label>

                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          value={customerSearch}
                          onChange={(event) =>
                            setCustomerSearch(event.target.value)
                          }
                          placeholder="Type at least 2 characters..."
                          className="pl-9"
                        />
                      </div>

                      <div className="mt-3">
                        {!customerSearch.trim() ? (
                          <p className="text-xs text-slate-500">
                            Start typing a customer name, phone number, or town.
                          </p>
                        ) : debouncedCustomerSearch.length < 2 ? (
                          <p className="text-xs text-slate-500">
                            Type at least 2 characters to search.
                          </p>
                        ) : customerLookupMutation.isPending ? (
                          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Searching customers...
                          </div>
                        ) : customerOptions.length > 0 ? (
                          <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                            {customerOptions.map((customer) => {
                              const alreadyAssigned =
                                selectedCustomerIds.includes(customer.id);

                              return (
                                <div
                                  key={customer.id}
                                  className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2.5 last:border-b-0"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900">
                                      {customer.fullName}
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                      {customer.phoneNumber || "-"}
                                      {customer.alternatePhone
                                        ? ` / ${customer.alternatePhone}`
                                        : ""}
                                      {customer.town
                                        ? ` • ${customer.town}`
                                        : ""}
                                    </p>
                                  </div>

                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={
                                      alreadyAssigned ? "outline" : "default"
                                    }
                                    disabled={alreadyAssigned}
                                    onClick={() =>
                                      handleAssignCustomer(customer)
                                    }
                                    className="shrink-0"
                                  >
                                    {alreadyAssigned ? "Assigned" : "Assign"}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-5 text-center text-sm text-slate-500">
                            No customers found.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Selected Customers
                        </p>

                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {selectedCustomerIds.length}
                        </span>
                      </div>

                      {selectedCustomerIds.length > 0 ? (
                        <div className="space-y-2">
                          {fields.map((field, index) => {
                            const selectedCustomerId =
                              selectedCustomers[index]?.customerId;
                            const selectedCustomer =
                              getSelectedCustomer(selectedCustomerId);

                            if (!selectedCustomer || !selectedCustomerId) {
                              return null;
                            }

                            return (
                              <div
                                key={field.id}
                                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="truncate text-sm font-semibold text-slate-900">
                                      {selectedCustomer.fullName}
                                    </p>

                                    {selectedCustomers[index]?.isDefault && (
                                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                        Default
                                      </span>
                                    )}
                                  </div>

                                  <p className="mt-0.5 text-xs text-slate-500">
                                    {selectedCustomer.phoneNumber || "-"}
                                    {selectedCustomer.alternatePhone
                                      ? ` / ${selectedCustomer.alternatePhone}`
                                      : ""}
                                    {selectedCustomer.town
                                      ? ` • ${selectedCustomer.town}`
                                      : ""}
                                  </p>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                  <Button
                                    type="button"
                                    variant={
                                      selectedCustomers[index]?.isDefault
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setDefaultCustomer(index)}
                                  >
                                    {selectedCustomers[index]?.isDefault
                                      ? "Default"
                                      : "Set Default"}
                                  </Button>

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled={selectedCustomerIds.length === 1}
                                    onClick={() =>
                                      handleRemoveCustomer(
                                        index,
                                        selectedCustomerId
                                      )
                                    }
                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-5 text-center text-sm text-slate-500">
                          No customers assigned yet. Search and assign at least
                          one customer.
                        </div>
                      )}

                      {form.formState.errors.customers?.root?.message && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.customers.root.message}
                        </p>
                      )}

                      {typeof form.formState.errors.customers?.message ===
                        "string" && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.customers.message}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-3">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>

                  <Button type="submit" disabled={isBusy}>
                    {updateBlockMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Block
                  </Button>
                </div>
              </form>
            </Form>
          )}
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