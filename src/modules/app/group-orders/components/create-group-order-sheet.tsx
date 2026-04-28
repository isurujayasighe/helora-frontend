"use client";

import * as React from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Building2,
  CalendarDays,
  Check,
  ChevronsUpDown,
  ClipboardList,
  Loader2,
  MapPin,
  PackagePlus,
  Phone,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useCustomerLookup } from "@/api/useGetCustomerLookup";

type GroupOrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "READY"
  | "PARTIALLY_DELIVERED"
  | "DELIVERED"
  | "CANCELLED";

type CustomerOption = {
  id: string;
  fullName: string;
  phoneNumber?: string | null;
  town?: string | null;
  hospitalName?: string | null;
};

export type CreateGroupOrderPayload = {
  groupOrderNumber: string;
  title: string;
  coordinatorCustomerId?: string;
  hospitalName: string;
  town: string;
  contactName: string;
  contactPhone: string;
  deliveryAddress: string;
  deliveryTown: string;
  status: GroupOrderStatus;
  expectedDeliveryDate?: string;
  notes?: string;
};

type CreateGroupOrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
  isLoading?: boolean;
  onSubmit?: (payload: CreateGroupOrderPayload) => Promise<void> | void;
};

const createGroupOrderSchema = z.object({
  groupOrderNumber: z.string().min(1, "Group order number is required"),
  title: z.string().min(1, "Title is required"),
  coordinatorCustomerId: z.string().min(1, "Coordinator customer is required"),
  hospitalName: z.string().min(1, "Hospital name is required"),
  town: z.string().min(1, "Town is required"),
  contactName: z.string().min(1, "Contact name is required"),
  contactPhone: z.string().min(1, "Contact phone is required"),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  deliveryTown: z.string().min(1, "Delivery town is required"),
  status: z.enum([
    "DRAFT",
    "CONFIRMED",
    "IN_PROGRESS",
    "READY",
    "PARTIALLY_DELIVERED",
    "DELIVERED",
    "CANCELLED",
  ]),
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
});

type FormErrors = Partial<Record<keyof CreateGroupOrderPayload, string>>;

const defaultForm: CreateGroupOrderPayload = {
  groupOrderNumber: "GRP-00001",
  title: "",
  coordinatorCustomerId: "",
  hospitalName: "",
  town: "",
  contactName: "",
  contactPhone: "",
  deliveryAddress: "",
  deliveryTown: "",
  status: "DRAFT",
  expectedDeliveryDate: "",
  notes: "",
};

export function CreateGroupOrderDialog({
  open,
  onOpenChange,
  onCreated,
  isLoading = false,
  onSubmit,
}: CreateGroupOrderDialogProps) {
  const [form, setForm] = React.useState<CreateGroupOrderPayload>(defaultForm);
  const [errors, setErrors] = React.useState<FormErrors>({});

  const [customerDropdownOpen, setCustomerDropdownOpen] =
    React.useState(false);

  const [customerSearch, setCustomerSearch] = React.useState("");
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] =
    React.useState("");

  const [selectedCustomer, setSelectedCustomer] =
    React.useState<CustomerOption | null>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedCustomerSearch(customerSearch.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [customerSearch]);

  const {
    data: customerLookupResponse,
    isLoading: isCustomersLoading,
    isFetching: isCustomersFetching,
  } = useCustomerLookup({
    search: debouncedCustomerSearch || undefined,
  });

  const customers: CustomerOption[] = React.useMemo(() => {
    const response = customerLookupResponse as any;

    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.items)) {
      return response.data.items;
    }

    if (Array.isArray(response?.items)) {
      return response.items;
    }

    return [];
  }, [customerLookupResponse]);

  const isCustomerSearching = isCustomersLoading || isCustomersFetching;

  const updateField = <K extends keyof CreateGroupOrderPayload>(
    key: K,
    value: CreateGroupOrderPayload[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [key]: undefined,
    }));
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((item) => item.id === customerId);

    if (!customer) return;

    setSelectedCustomer(customer);

    setForm((previous) => ({
      ...previous,
      coordinatorCustomerId: customer.id,
      contactName: customer.fullName || previous.contactName,
      contactPhone: customer.phoneNumber || previous.contactPhone,
      town: customer.town || previous.town,
      deliveryTown: customer.town || previous.deliveryTown,
      hospitalName: customer.hospitalName || previous.hospitalName,
    }));

    setErrors((previous) => ({
      ...previous,
      coordinatorCustomerId: undefined,
      contactName: undefined,
      contactPhone: undefined,
      town: undefined,
      deliveryTown: undefined,
      hospitalName: undefined,
    }));

    setCustomerDropdownOpen(false);
  };

  const resetForm = () => {
    setForm(defaultForm);
    setErrors({});
    setCustomerSearch("");
    setDebouncedCustomerSearch("");
    setSelectedCustomer(null);
    setCustomerDropdownOpen(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    const result = createGroupOrderSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: FormErrors = {};

      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof CreateGroupOrderPayload;
        fieldErrors[key] = issue.message;
      });

      setErrors(fieldErrors);
      return;
    }

    const payload: CreateGroupOrderPayload = {
      ...result.data,
      coordinatorCustomerId: result.data.coordinatorCustomerId || undefined,
      expectedDeliveryDate: result.data.expectedDeliveryDate
        ? new Date(result.data.expectedDeliveryDate).toISOString()
        : undefined,
      notes: result.data.notes?.trim() || undefined,
    };

    await onSubmit?.(payload);

    onCreated?.();
    resetForm();
    onOpenChange(false);
  };

  React.useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-7xl">
        <DialogHeader className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                <PackagePlus className="h-5 w-5 text-blue-600" />
                Create Group Order
              </DialogTitle>

              <p className="mt-1 text-sm text-slate-500">
                Create a batch order for hospital uniforms, nurses, or grouped
                customer orders.
              </p>
            </div>

            <Badge className="rounded-full border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-50">
              Group Order
            </Badge>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(92vh-145px)] overflow-y-auto bg-slate-50/70 px-5 py-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
            <div className="space-y-5">
              <Card className="rounded-2xl border-slate-200 shadow-none">
                <CardContent className="p-5">
                  <SectionHeader
                    icon={ClipboardList}
                    title="Group Order Details"
                    description="Basic information used to identify this batch order."
                  />

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <FormField
                      label="Group Order Number"
                      error={errors.groupOrderNumber}
                    >
                      <Input
                        value={form.groupOrderNumber}
                        onChange={(event) =>
                          updateField("groupOrderNumber", event.target.value)
                        }
                        placeholder="GRP-00001"
                      />
                    </FormField>

                    <FormField label="Status" error={errors.status}>
                      <Select
                        value={form.status}
                        onValueChange={(value) =>
                          updateField("status", value as GroupOrderStatus)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                          <SelectItem value="IN_PROGRESS">
                            In Progress
                          </SelectItem>
                          <SelectItem value="READY">Ready</SelectItem>
                          <SelectItem value="PARTIALLY_DELIVERED">
                            Partially Delivered
                          </SelectItem>
                          <SelectItem value="DELIVERED">Delivered</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField
                      label="Title"
                      error={errors.title}
                      className="md:col-span-2"
                    >
                      <Input
                        value={form.title}
                        onChange={(event) =>
                          updateField("title", event.target.value)
                        }
                        placeholder="Horana Hospital Nurses - April Batch"
                      />
                    </FormField>

                    <FormField
                      label="Hospital Name"
                      error={errors.hospitalName}
                    >
                      <Input
                        value={form.hospitalName}
                        onChange={(event) =>
                          updateField("hospitalName", event.target.value)
                        }
                        placeholder="Horana Hospital"
                      />
                    </FormField>

                    <FormField label="Town" error={errors.town}>
                      <Input
                        value={form.town}
                        onChange={(event) =>
                          updateField("town", event.target.value)
                        }
                        placeholder="Horana"
                      />
                    </FormField>

                    <FormField
                      label="Expected Delivery Date"
                      error={errors.expectedDeliveryDate}
                      className="md:col-span-2"
                    >
                      <div className="relative">
                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          type="date"
                          value={form.expectedDeliveryDate || ""}
                          onChange={(event) =>
                            updateField(
                              "expectedDeliveryDate",
                              event.target.value
                            )
                          }
                          className="pl-9"
                        />
                      </div>
                    </FormField>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200 shadow-none">
                <CardContent className="p-5">
                  <SectionHeader
                    icon={UserRound}
                    title="Coordinator"
                    description="Select the customer coordinating this group order. Search by name, phone, or town."
                  />

                  <div className="mt-5">
                    <FormField
                      label="Coordinator Customer"
                      error={errors.coordinatorCustomerId}
                    >
                      <Popover
                        open={customerDropdownOpen}
                        onOpenChange={setCustomerDropdownOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={customerDropdownOpen}
                            className={cn(
                              "h-auto min-h-11 w-full justify-between px-3 py-2 text-left font-normal",
                              !selectedCustomer && "text-slate-500"
                            )}
                          >
                            {selectedCustomer ? (
                              <div className="flex min-w-0 flex-col items-start">
                                <span className="truncate font-medium text-slate-900">
                                  {selectedCustomer.fullName}
                                </span>

                                <span className="truncate text-xs text-slate-500">
                                  {selectedCustomer.phoneNumber || "No phone"} ·{" "}
                                  {selectedCustomer.town || "No town"}
                                </span>
                              </div>
                            ) : (
                              <span>Select or search customer</span>
                            )}

                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent
                          align="start"
                          className="w-full p-0"
                        >
                          <Command shouldFilter={false}>
                            <CommandInput
                              value={customerSearch}
                              onValueChange={setCustomerSearch}
                              placeholder="Search customer name, phone, town..."
                            />

                            <CommandList>
                              {isCustomerSearching ? (
                                <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-500">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Searching customers...
                                </div>
                              ) : customers.length > 0 ? (
                                <CommandGroup heading="Customers">
                                  {customers.map((customer) => {
                                    const isSelected =
                                      form.coordinatorCustomerId ===
                                      customer.id;

                                    return (
                                      <CommandItem
                                        key={customer.id}
                                        value={customer.id}
                                        onSelect={() =>
                                          handleCustomerChange(customer.id)
                                        }
                                        className="cursor-pointer"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            isSelected
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />

                                        <div className="flex min-w-0 flex-col">
                                          <span className="truncate font-medium">
                                            {customer.fullName}
                                          </span>

                                          <span className="truncate text-xs text-slate-500">
                                            {customer.phoneNumber ||
                                              "No phone"}{" "}
                                            · {customer.town || "No town"}
                                          </span>
                                        </div>
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              ) : (
                                <CommandEmpty>
                                  <div className="px-3 py-4 text-center">
                                    <p className="text-sm font-medium text-slate-700">
                                      No customers found
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      Try searching by customer name, phone
                                      number, or town.
                                    </p>
                                  </div>
                                </CommandEmpty>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormField>
                  </div>

                  {selectedCustomer && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">
                            {selectedCustomer.fullName}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {selectedCustomer.phoneNumber || "No phone"} ·{" "}
                            {selectedCustomer.town || "No town"}
                          </p>
                        </div>

                        <Badge
                          variant="outline"
                          className="rounded-full border-green-100 bg-green-50 text-green-700"
                        >
                          Selected
                        </Badge>
                      </div>
                    </motion.div>
                  )}

                  <Separator className="my-5" />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      label="Contact Name"
                      error={errors.contactName}
                    >
                      <div className="relative">
                        <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          value={form.contactName}
                          onChange={(event) =>
                            updateField("contactName", event.target.value)
                          }
                          placeholder="Dinesha Shamali"
                          className="pl-9"
                        />
                      </div>
                    </FormField>

                    <FormField
                      label="Contact Phone"
                      error={errors.contactPhone}
                    >
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          value={form.contactPhone}
                          onChange={(event) =>
                            updateField("contactPhone", event.target.value)
                          }
                          placeholder="0718370292"
                          className="pl-9"
                        />
                      </div>
                    </FormField>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-5">
              <Card className="rounded-2xl border-slate-200 shadow-none">
                <CardContent className="p-5">
                  <SectionHeader
                    icon={MapPin}
                    title="Delivery Details"
                    description="Where the complete batch should be delivered."
                  />

                  <div className="mt-5 space-y-4">
                    <FormField
                      label="Delivery Address"
                      error={errors.deliveryAddress}
                    >
                      <Textarea
                        value={form.deliveryAddress}
                        onChange={(event) =>
                          updateField("deliveryAddress", event.target.value)
                        }
                        placeholder="No 12, Main Street, Horana"
                        className="min-h-24 resize-none"
                      />
                    </FormField>

                    <FormField
                      label="Delivery Town"
                      error={errors.deliveryTown}
                    >
                      <Input
                        value={form.deliveryTown}
                        onChange={(event) =>
                          updateField("deliveryTown", event.target.value)
                        }
                        placeholder="Horana"
                      />
                    </FormField>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200 shadow-none">
                <CardContent className="p-5">
                  <SectionHeader
                    icon={Building2}
                    title="Notes"
                    description="Special notes for this batch order."
                  />

                  <div className="mt-5">
                    <FormField label="Notes" error={errors.notes}>
                      <Textarea
                        value={form.notes || ""}
                        onChange={(event) =>
                          updateField("notes", event.target.value)
                        }
                        placeholder="Deliver all uniforms together."
                        className="min-h-32 resize-none"
                      />
                    </FormField>
                  </div>

                  <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-300">
                      Preview
                    </p>

                    <p className="mt-2 text-base font-semibold">
                      {form.title || "Group order title"}
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      {form.hospitalName || "Hospital"} ·{" "}
                      {form.town || "Town"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge className="bg-white/10 text-white hover:bg-white/10">
                        {form.groupOrderNumber || "GRP-00001"}
                      </Badge>

                      <Badge className="bg-white/10 text-white hover:bg-white/10">
                        {form.status}
                      </Badge>

                      {selectedCustomer && (
                        <Badge className="bg-white/10 text-white hover:bg-white/10">
                          {selectedCustomer.fullName}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            This will create the group order header. Orders can be added after
            opening the group order.
          </p>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PackagePlus className="h-4 w-4" />
              )}
              Create Group Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function FormField({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {children}

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}