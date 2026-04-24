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
import { Plus, Search, Trash2, UserRound, Package2 } from "lucide-react";
import { cn } from "@/lib/utils";

const orderItemSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  itemDescription: z.string().min(1, "Item description is required"),
  quantity: z.coerce.number().min(1, "Qty must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price must be 0 or more"),
  lineTotal: z.coerce.number().min(0),
  notes: z.string().optional(),
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
  totalAmount: z.coerce.number().min(0),
  advanceAmount: z.coerce.number().min(0),
  balanceAmount: z.coerce.number().min(0),

  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

type CreateOrderFormInput = z.input<typeof formSchema>;
type CreateOrderFormValues = z.output<typeof formSchema>;

type CustomerBlock = {
  id: string;
  blockNo: string;
};

type CustomerLookupResult = {
  id: string;
  fullName: string;
  phoneNumber: string;
  town?: string | null;
  address?: string | null;
  notes?: string | null;
  blocks?: CustomerBlock[];
};

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
  items: Array<{
    categoryId: string;
    itemDescription: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    notes?: string;
  }>;
};

type CreateOrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (payload: CreateOrderPayload) => Promise<void> | void;
  categories?: CategoryOption[];
};

const defaultCategories: CategoryOption[] = [
  { id: "cat-uniform", name: "Uniform" },
  { id: "cat-saree", name: "Saree" },
  { id: "cat-shirt", name: "Shirt" },
];

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
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [foundCustomer, setFoundCustomer] =
    useState<CustomerLookupResult | null>(null);
  const [customerSearched, setCustomerSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateOrderFormInput, any, CreateOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: buildInitialValues(),
  });

  const { control, watch, setValue, getValues, reset, setError } = form;

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
    calculatedTotal - Number(watchedAdvance || 0)
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

    setIsSearchingCustomer(true);
    setCustomerSearched(true);

    try {
      // Replace with real API
      // const res = await customerClient.get(`/customers/by-phone?phone=${phoneNumber}`);
      // const customer = res.data;

      await new Promise((resolve) => setTimeout(resolve, 600));

      if (phoneNumber === "0712345678") {
        const customer: CustomerLookupResult = {
          id: "customer_cuid_existing",
          fullName: "Nimal Perera",
          phoneNumber: "0712345678",
          town: "Matara",
          address: "No. 25, Main Street",
          notes: "Regular customer",
          blocks: [
            { id: "b1", blockNo: "BLK-001" },
            { id: "b2", blockNo: "BLK-007" },
            { id: "b3", blockNo: "BLK-014" },
          ],
        };

        setFoundCustomer(customer);
        setValue("customerMode", "existing");
        setValue("customerId", customer.id);
        setValue("customerName", customer.fullName);
        setValue("customerTown", customer.town || "");
        setValue("customerAddress", customer.address || "");
        setValue("customerNotes", customer.notes || "");
      } else {
        setFoundCustomer(null);
        setValue("customerMode", "new");
        setValue("customerId", "");
        setValue("customerName", "");
        setValue("customerTown", "");
        setValue("customerAddress", "");
        setValue("customerNotes", "");
      }
    } finally {
      setIsSearchingCustomer(false);
    }
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
        notes: values.notes,
        totalAmount: Number(values.totalAmount),
        advanceAmount: Number(values.advanceAmount),
        balanceAmount: Number(values.balanceAmount),
        items: values.items.map((item) => ({
          categoryId: item.categoryId,
          itemDescription: item.itemDescription,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          lineTotal: Number(item.lineTotal),
          notes: item.notes,
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

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Search customer by phone number, review existing blocks for
            reference, then create the order. Block preparation can be handled
            after order placement.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(submitOrder)} className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
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
                        Existing Block Numbers
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {foundCustomer.blocks.map((block) => (
                          <Badge
                            key={block.id}
                            variant="secondary"
                            className="border border-slate-200 bg-white text-slate-700"
                          >
                            {block.blockNo}
                          </Badge>
                        ))}
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        These blocks are shown for reference only. Block
                        preparation can be done after placing the order.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {customerSearched && !foundCustomer && (
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
                            <Input placeholder="Enter customer name" {...field} />
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
            </section>

            <section className="rounded-xl border border-slate-200 p-4">
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
            </section>

            <section className="rounded-xl border border-slate-200 p-4">
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
                {fields.map((itemField, index) => (
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
                              >
                                <option value="">Select category</option>
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
                              <Input type="number" min={0} step="0.01" {...field} />
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
                                  Number(watchedItems?.[index]?.quantity || 0) *
                                  Number(watchedItems?.[index]?.unitPrice || 0)
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
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 p-4">
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
            </section>

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