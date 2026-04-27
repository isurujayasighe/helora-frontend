"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CircleAlert,
  Loader2,
  Package,
  Phone,
  ReceiptText,
  Ruler,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
  useCustomerLookup,
  type CustomerLookupItem,
} from "@/api/useGetCustomerLookup";
import {
  useCreateOrder,
  type OrderPaymentMode,
  type OrderSource,
  type OrderStatus,
  type PaymentStatus,
} from "@/api/useCreateOrder";

type GroupOrderForAddOrder = {
  id: string;
  groupOrderNumber: string;
  title: string | null;
  hospitalName: string | null;
  town: string | null;
  deliveryAddress: string | null;
  deliveryTown: string | null;
  expectedDeliveryDate: string | null;
};

type AddOrderToGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupOrder: GroupOrderForAddOrder;
  onCreated?: () => void;
};

type FormState = {
  orderNumber: string;
  customerId: string;
  orderDate: string;
  promisedDate: string;

  status: OrderStatus;
  orderSource: OrderSource;
  paymentStatus: PaymentStatus;
  paymentMode: OrderPaymentMode;

  customerAddress: string;
  notes: string;
  specialNotes: string;

  categoryId: string;
  blockId: string;
  measurementId: string;
  itemDescription: string;
  quantity: string;
  unitPrice: string;
  itemNotes: string;
  tailorNote: string;

  advanceAmount: string;
  courierCharges: string;
};

const initialFormState: FormState = {
  orderNumber: "",
  customerId: "",
  orderDate: new Date().toISOString().slice(0, 10),
  promisedDate: "",

  status: "PENDING",
  orderSource: "PHYSICAL_SHOP",
  paymentStatus: "UNPAID",
  paymentMode: "CASH",

  customerAddress: "",
  notes: "",
  specialNotes: "",

  categoryId: "",
  blockId: "",
  measurementId: "",
  itemDescription: "Nurse uniform",
  quantity: "1",
  unitPrice: "0",
  itemNotes: "",
  tailorNote: "",

  advanceAmount: "0",
  courierCharges: "0",
};

const toIsoDate = (value: string) => {
  if (!value) return undefined;
  return new Date(`${value}T00:00:00.000Z`).toISOString();
};

const money = (value: string | number) => {
  return Number(value || 0);
};

export function AddOrderToGroupDialog({
  open,
  onOpenChange,
  groupOrder,
  onCreated,
}: AddOrderToGroupDialogProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerLookupItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createOrderMutation = useCreateOrder();

  const { data: customerLookupResponse, isFetching: isSearchingCustomers } =
    useCustomerLookup({
      search: customerSearch,
      limit: 8,
    });

  const customers = customerLookupResponse?.data ?? [];

  useEffect(() => {
    if (!open) {
      setForm(initialFormState);
      setCustomerSearch("");
      setSelectedCustomer(null);
      setError(null);
      return;
    }

    setForm((previous) => ({
      ...previous,
      promisedDate: groupOrder.expectedDeliveryDate
        ? groupOrder.expectedDeliveryDate.slice(0, 10)
        : "",
      customerAddress: groupOrder.deliveryAddress || "",
    }));
  }, [open, groupOrder.expectedDeliveryDate, groupOrder.deliveryAddress]);

  const quantity = money(form.quantity);
  const unitPrice = money(form.unitPrice);
  const totalAmount = quantity * unitPrice;
  const advanceAmount = money(form.advanceAmount);
  const courierCharges = money(form.courierCharges);
  const balanceAmount = Math.max(totalAmount + courierCharges - advanceAmount, 0);

  const canSubmit =
    Boolean(form.customerId) &&
    Boolean(form.categoryId.trim()) &&
    Boolean(form.itemDescription.trim()) &&
    quantity > 0;

  const updateForm = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleSelectCustomer = (customer: CustomerLookupItem) => {
    setSelectedCustomer(customer);

    setForm((previous) => ({
      ...previous,
      customerId: customer.id,
      customerAddress: previous.customerAddress || "",
    }));

    setCustomerSearch("");
  };

  const handleSubmit = async () => {
    setError(null);

    if (!form.customerId) {
      setError("Please select a customer.");
      return;
    }

    if (!form.categoryId.trim()) {
      setError("Category is required.");
      return;
    }

    if (!form.itemDescription.trim()) {
      setError("Item description is required.");
      return;
    }

    try {
      await createOrderMutation.mutateAsync({
        customerId: form.customerId,
        groupOrderId: groupOrder.id,
        orderNumber: form.orderNumber.trim() || undefined,
        orderDate: toIsoDate(form.orderDate),
        promisedDate: toIsoDate(form.promisedDate),

        status: form.status,
        orderSource: form.orderSource,
        paymentStatus:
          balanceAmount <= 0
            ? "PAID"
            : advanceAmount > 0
              ? "ADVANCE_PAID"
              : form.paymentStatus,
        paymentMode: form.paymentMode,

        hospitalName: groupOrder.hospitalName || undefined,
        town: groupOrder.town || groupOrder.deliveryTown || undefined,
        customerAddress: form.customerAddress.trim() || undefined,

        totalQty: quantity,
        totalAmount,
        advanceAmount,
        balanceAmount,
        courierCharges,

        notes: form.notes.trim() || undefined,
        specialNotes: form.specialNotes.trim() || undefined,

        items: [
          {
            categoryId: form.categoryId.trim(),
            blockId: form.blockId.trim() || undefined,
            measurementId: form.measurementId.trim() || undefined,
            itemDescription: form.itemDescription.trim(),
            quantity,
            unitPrice,
            lineTotal: totalAmount,
            notes: form.itemNotes.trim() || undefined,
            tailorNote: form.tailorNote.trim() || undefined,
            status: "PENDING",
          },
        ],
      });

      onCreated?.();
      onOpenChange(false);
    } catch {
      setError("Unable to add order to this group. Please try again.");
    }
  };

  const summaryItems = useMemo(
    () => [
      { label: "Qty", value: quantity },
      { label: "Total", value: `LKR ${totalAmount.toLocaleString()}` },
      { label: "Advance", value: `LKR ${advanceAmount.toLocaleString()}` },
      { label: "Balance", value: `LKR ${balanceAmount.toLocaleString()}` },
    ],
    [quantity, totalAmount, advanceAmount, balanceAmount]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[calc(100vw-1rem)] max-w-5xl flex-col overflow-hidden rounded-2xl p-0 sm:w-full">
        <DialogHeader className="border-b border-slate-200 px-5 py-4 text-left">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <UsersRound className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold text-slate-950">
                Add order to group
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-slate-500">
                Add one customer order under{" "}
                <span className="font-medium text-slate-700">
                  {groupOrder.groupOrderNumber}
                </span>
                . Group delivery and hospital details are applied automatically.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-slate-50/60 px-5 py-4">
          <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
            <div className="flex gap-3">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
              <p className="text-sm leading-6 text-blue-800">
                This order will be linked to{" "}
                <span className="font-semibold">
                  {groupOrder.title || groupOrder.groupOrderNumber}
                </span>
                . You only need to select the customer and item details.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <Card className="rounded-2xl border-slate-200 shadow-none">
                <CardContent className="space-y-4 p-4">
                  <SectionHeader
                    icon={UserRound}
                    title="Customer"
                    description="Select the customer who owns this order."
                  />

                  {!selectedCustomer ? (
                    <div className="space-y-3">
                      <Field label="Search Customer" required>
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            value={customerSearch}
                            onChange={(event) =>
                              setCustomerSearch(event.target.value)
                            }
                            placeholder="Search by customer name or phone"
                            className="pl-9"
                          />
                        </div>
                      </Field>

                      {customerSearch.trim().length > 0 &&
                        customerSearch.trim().length < 2 && (
                          <p className="text-xs text-slate-500">
                            Type at least 2 characters to search.
                          </p>
                        )}

                      {isSearchingCustomers && (
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Searching customers...
                        </div>
                      )}

                      {!isSearchingCustomers && customers.length > 0 && (
                        <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                          {customers.map((customer) => (
                            <button
                              key={customer.id}
                              type="button"
                              onClick={() => handleSelectCustomer(customer)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-blue-200 hover:bg-blue-50/60"
                            >
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {customer.fullName}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {customer.phoneNumber || "-"} ·{" "}
                                {customer.town || "-"}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3">
                      <p className="text-sm font-bold text-blue-950">
                        {selectedCustomer.fullName}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-blue-800">
                        <Phone className="h-3.5 w-3.5" />
                        {selectedCustomer.phoneNumber || "-"} ·{" "}
                        {selectedCustomer.town || "-"}
                      </p>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-7 px-2 text-blue-700 hover:bg-blue-100"
                        onClick={() => {
                          setSelectedCustomer(null);
                          updateForm("customerId", "");
                        }}
                      >
                        Change customer
                      </Button>
                    </div>
                  )}

                  <Field label="Customer Address">
                    <Textarea
                      value={form.customerAddress}
                      onChange={(event) =>
                        updateForm("customerAddress", event.target.value)
                      }
                      placeholder="Customer address"
                      className="min-h-20 resize-none"
                    />
                  </Field>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200 shadow-none">
                <CardContent className="space-y-4 p-4">
                  <SectionHeader
                    icon={Package}
                    title="Order item"
                    description="Add the uniform/item details for this customer."
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Category ID" required>
                      <Input
                        value={form.categoryId}
                        onChange={(event) =>
                          updateForm("categoryId", event.target.value)
                        }
                        placeholder="category_cuid"
                      />
                    </Field>

                    <Field label="Block ID">
                      <Input
                        value={form.blockId}
                        onChange={(event) =>
                          updateForm("blockId", event.target.value)
                        }
                        placeholder="block_cuid"
                      />
                    </Field>

                    <Field label="Measurement ID">
                      <div className="relative">
                        <Ruler className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          value={form.measurementId}
                          onChange={(event) =>
                            updateForm("measurementId", event.target.value)
                          }
                          placeholder="measurement_cuid"
                          className="pl-9"
                        />
                      </div>
                    </Field>

                    <Field label="Item Description" required>
                      <Input
                        value={form.itemDescription}
                        onChange={(event) =>
                          updateForm("itemDescription", event.target.value)
                        }
                        placeholder="Nurse uniform"
                      />
                    </Field>

                    <Field label="Quantity" required>
                      <Input
                        type="number"
                        min={1}
                        value={form.quantity}
                        onChange={(event) =>
                          updateForm("quantity", event.target.value)
                        }
                      />
                    </Field>

                    <Field label="Unit Price">
                      <Input
                        type="number"
                        min={0}
                        value={form.unitPrice}
                        onChange={(event) =>
                          updateForm("unitPrice", event.target.value)
                        }
                      />
                    </Field>

                    <div className="sm:col-span-2">
                      <Field label="Item Notes">
                        <Textarea
                          value={form.itemNotes}
                          onChange={(event) =>
                            updateForm("itemNotes", event.target.value)
                          }
                          placeholder="Customer requested loose fit"
                          className="min-h-20 resize-none"
                        />
                      </Field>
                    </div>

                    <div className="sm:col-span-2">
                      <Field label="Tailor Note">
                        <Textarea
                          value={form.tailorNote}
                          onChange={(event) =>
                            updateForm("tailorNote", event.target.value)
                          }
                          placeholder="Use previous cutting style"
                          className="min-h-20 resize-none"
                        />
                      </Field>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200 shadow-none">
                <CardContent className="space-y-4 p-4">
                  <SectionHeader
                    icon={ReceiptText}
                    title="Payment & notes"
                    description="Record advance, courier and order notes."
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Payment Mode">
                      <Select
                        value={form.paymentMode}
                        onValueChange={(value) =>
                          updateForm("paymentMode", value as OrderPaymentMode)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="ONLINE_TRANSFER">
                            Online Transfer
                          </SelectItem>
                          <SelectItem value="BANK_DEPOSIT">
                            Bank Deposit
                          </SelectItem>
                          <SelectItem value="CARD">Card</SelectItem>
                          <SelectItem value="MIXED">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Order Source">
                      <Select
                        value={form.orderSource}
                        onValueChange={(value) =>
                          updateForm("orderSource", value as OrderSource)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PHYSICAL_SHOP">
                            Physical Shop
                          </SelectItem>
                          <SelectItem value="PHONE_CALL">Phone Call</SelectItem>
                          <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                          <SelectItem value="ONLINE">Online</SelectItem>
                          <SelectItem value="DREZAURA">Drezaura</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Advance Amount">
                      <Input
                        type="number"
                        min={0}
                        value={form.advanceAmount}
                        onChange={(event) =>
                          updateForm("advanceAmount", event.target.value)
                        }
                      />
                    </Field>

                    <Field label="Courier Charges">
                      <Input
                        type="number"
                        min={0}
                        value={form.courierCharges}
                        onChange={(event) =>
                          updateForm("courierCharges", event.target.value)
                        }
                      />
                    </Field>

                    <div className="sm:col-span-2">
                      <Field label="Order Notes">
                        <Textarea
                          value={form.notes}
                          onChange={(event) =>
                            updateForm("notes", event.target.value)
                          }
                          placeholder="Order note"
                          className="min-h-20 resize-none"
                        />
                      </Field>
                    </div>

                    <div className="sm:col-span-2">
                      <Field label="Special Notes">
                        <Textarea
                          value={form.specialNotes}
                          onChange={(event) =>
                            updateForm("specialNotes", event.target.value)
                          }
                          placeholder="Special delivery note"
                          className="min-h-20 resize-none"
                        />
                      </Field>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="rounded-2xl border-slate-200 shadow-none">
                <CardContent className="space-y-4 p-4">
                  <SectionHeader
                    icon={UsersRound}
                    title="Group"
                    description="This order will be linked to this batch."
                  />

                  <div className="space-y-2 rounded-2xl bg-slate-50 p-3">
                    <p className="text-sm font-bold text-slate-950">
                      {groupOrder.groupOrderNumber}
                    </p>
                    <p className="text-xs text-slate-500">
                      {groupOrder.title || "-"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {groupOrder.hospitalName || "-"} ·{" "}
                      {groupOrder.deliveryTown || groupOrder.town || "-"}
                    </p>
                  </div>

                  <Field label="Order Date">
                    <Input
                      type="date"
                      value={form.orderDate}
                      onChange={(event) =>
                        updateForm("orderDate", event.target.value)
                      }
                    />
                  </Field>

                  <Field label="Promised Date">
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="date"
                        value={form.promisedDate}
                        onChange={(event) =>
                          updateForm("promisedDate", event.target.value)
                        }
                        className="pl-9"
                      />
                    </div>
                  </Field>

                  <Field label="Order Number">
                    <Input
                      value={form.orderNumber}
                      onChange={(event) =>
                        updateForm("orderNumber", event.target.value)
                      }
                      placeholder="Auto generated if empty"
                    />
                  </Field>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200 shadow-none">
                <CardContent className="space-y-4 p-4">
                  <SectionHeader
                    icon={ReceiptText}
                    title="Summary"
                    description="Calculated from item and payment details."
                  />

                  <div className="space-y-2">
                    {summaryItems.map((item) => (
                      <div
                        key={item.label}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-3 py-2",
                          item.label === "Balance"
                            ? "bg-amber-50 text-amber-800"
                            : "bg-slate-50"
                        )}
                      >
                        <span className="text-xs font-medium">{item.label}</span>
                        <span className="text-sm font-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200 bg-white px-5 py-4">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createOrderMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || createOrderMutation.isPending}
              className="gap-2"
            >
              {createOrderMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Add Order to Group
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type FieldProps = {
  label: string;
  required?: boolean;
  children: React.ReactNode;
};

function Field({ label, required, children }: FieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

type SectionHeaderProps = {
  icon: React.ElementType;
  title: string;
  description: string;
};

function SectionHeader({
  icon: Icon,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}