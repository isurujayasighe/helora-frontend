"use client";

import * as React from "react";
import {
  Link2,
  Loader2,
  Plus,
  Save,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  getLatestMeasurement,
  useGetLatestMeasurement,
} from "@/api/useGetLatestMeasurement";
import type { CustomerLookupItem } from "@/api/useGetCustomerLookup";
import { CustomerPhoneLookupField } from "@/components/layout/components/customer-phone-lookup-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { getApiErrorMessage } from "@/errors/api-error-response";
import { useGetBlockById } from "../api/useGetBlockById";
import { useLinkMeasurementToBlock } from "../api/useLinkMeasurementToBlock";
import { useUpdateBlockCustomers } from "../api/useUpdateBlockCustomers";

type AssignmentFormValues = {
  customerId: string;
  customerName: string;
  phoneNumber: string;
  customerTown: string;
  customerAddress: string;
  customerNotes: string;
  hospitalName: string;
};

type CustomerAssignment = {
  customerId: string;
  customerName: string;
  phoneNumber?: string;
  town?: string;
  hospitalName?: string;
  measurementId?: string;
  measurementNumber?: string;
  isDefault: boolean;
};

const defaultValues: AssignmentFormValues = {
  customerId: "",
  customerName: "",
  phoneNumber: "",
  customerTown: "",
  customerAddress: "",
  customerNotes: "",
  hospitalName: "",
};

function clean(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

type EditBlockCustomersDialogProps = {
  blockId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
};

export function EditBlockCustomersDialog({
  blockId,
  open,
  onOpenChange,
  onUpdated,
}: EditBlockCustomersDialogProps) {
  const [assignments, setAssignments] = React.useState<CustomerAssignment[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    React.useState<CustomerLookupItem | null>(null);
  const [lookupResetKey, setLookupResetKey] = React.useState(0);
  const [linkingCustomerId, setLinkingCustomerId] = React.useState<
    string | null
  >(null);

  const form = useForm<AssignmentFormValues>({ defaultValues });
  const updateBlockCustomers = useUpdateBlockCustomers();
  const linkMeasurementToBlock = useLinkMeasurementToBlock();
  const { data, isLoading, isFetching } = useGetBlockById(blockId, open);

  const block = data?.data;
  const categoryId = block?.categoryId;

  const customerId = useWatch({
    control: form.control,
    name: "customerId",
  });

  const { data: latestMeasurement, isFetching: isMeasurementFetching } =
    useGetLatestMeasurement({
      customerId,
      categoryId,
      enabled: Boolean(open && customerId && categoryId),
    });

  React.useEffect(() => {
    if (!open || !block) return;

    setAssignments(
      (block.customerBlocks ?? []).map((item) => ({
        customerId: item.customerId,
        customerName: item.customer.fullName,
        phoneNumber: item.customer.phoneNumber ?? undefined,
        town: item.customer.town ?? undefined,
        measurementId: item.measurementId ?? undefined,
        measurementNumber: item.measurement?.measurementNumber,
        isDefault: item.isDefault,
      })),
    );
  }, [block, open]);

  const clearDraftCustomer = React.useCallback(() => {
    setSelectedCustomer(null);
    setLookupResetKey((key) => key + 1);
    form.reset(defaultValues);
  }, [form]);

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setAssignments([]);
      clearDraftCustomer();
    }
  };

  const handleAddCustomer = () => {
    const values = form.getValues();

    if (!values.customerId) {
      form.setError("customerId", {
        message: "Select a customer before adding.",
      });
      return;
    }

    const nextAssignment: CustomerAssignment = {
      customerId: values.customerId,
      customerName:
        clean(values.customerName) ||
        selectedCustomer?.fullName ||
        "Selected customer",
      phoneNumber:
        clean(values.phoneNumber) || selectedCustomer?.phoneNumber || undefined,
      town: clean(values.customerTown) || selectedCustomer?.town || undefined,
      hospitalName:
        clean(values.hospitalName) ||
        selectedCustomer?.hospitalName ||
        undefined,
      measurementId: latestMeasurement?.id,
      measurementNumber: latestMeasurement?.measurementNumber,
      isDefault: true,
    };

    setAssignments((current) => [
      ...current.filter(
        (assignment) => assignment.customerId !== nextAssignment.customerId,
      ),
      nextAssignment,
    ]);

    clearDraftCustomer();
  };

  const handleSave = async () => {
    if (!blockId) return;

    if (!assignments.length) {
      form.setError("customerId", {
        message: "Add at least one customer to this block.",
      });
      return;
    }

    try {
      await updateBlockCustomers.mutateAsync({
        blockId,
        payload: {
          customers: assignments.map((assignment) => ({
            customerId: assignment.customerId,
            measurementId: assignment.measurementId,
            isDefault: assignment.isDefault,
          })),
        },
      });

      toast.success("Block customer assignments updated");
      onUpdated?.();
      handleClose(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to update block customer assignments.",
        ),
      );
    }
  };

  const handleLinkLatestMeasurement = async (assignment: CustomerAssignment) => {
    if (!blockId || !categoryId) return;

    setLinkingCustomerId(assignment.customerId);

    try {
      const measurement = await getLatestMeasurement({
        customerId: assignment.customerId,
        categoryId,
      });

      if (!measurement) {
        toast.error("No matching measurement found for this customer.");
        return;
      }

      await linkMeasurementToBlock.mutateAsync({
        blockId,
        payload: {
          measurementId: measurement.id,
          makeDefaultForCustomer: assignment.isDefault,
          updateOrderItems: false,
        },
      });

      setAssignments((current) =>
        current.map((item) =>
          item.customerId === assignment.customerId
            ? {
                ...item,
                measurementId: measurement.id,
                measurementNumber: measurement.measurementNumber,
              }
            : item,
        ),
      );

      toast.success("Measurement linked to block");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to link measurement to block."),
      );
    } finally {
      setLinkingCustomerId(null);
    }
  };

  const isBusy = isLoading || isFetching;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden rounded-lg border-slate-200 bg-slate-50 p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-bold text-slate-900">
                Edit Block Customers
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-slate-500">
                Assign this block to multiple customers and choose whether it is
                their default block for this category.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {isBusy ? (
            <div className="flex h-56 items-center justify-center text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading block customers...
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <Form {...form}>
                  <CustomerPhoneLookupField
                    key={lookupResetKey}
                    control={form.control}
                    setValue={form.setValue}
                    names={{
                      customerId: "customerId",
                      customerName: "customerName",
                      phoneNumber: "phoneNumber",
                      town: "customerTown",
                      address: "customerAddress",
                      notes: "customerNotes",
                      hospitalName: "hospitalName",
                    }}
                    onCustomerSelect={(customer) => {
                      setSelectedCustomer(customer);
                      form.setValue("customerId", customer.id, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    onClear={clearDraftCustomer}
                  />
                </Form>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    {customerId && isMeasurementFetching
                      ? "Finding latest measurement..."
                      : latestMeasurement
                        ? `Latest measurement: ${latestMeasurement.measurementNumber}`
                        : "Customer can be assigned without a measurement link."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg bg-white"
                    disabled={!customerId || isMeasurementFetching}
                    onClick={handleAddCustomer}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add customer
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Assigned Customers
                  </p>
                  <Badge variant="outline" className="rounded-md">
                    {assignments.length}
                  </Badge>
                </div>

                {assignments.length ? (
                  <div className="divide-y divide-slate-100">
                    {assignments.map((assignment) => (
                      <div key={assignment.customerId} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {assignment.customerName}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {assignment.phoneNumber || "-"}
                              {assignment.town ? ` - ${assignment.town}` : ""}
                              {assignment.hospitalName
                                ? ` - ${assignment.hospitalName}`
                                : ""}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {assignment.measurementNumber
                                ? `Measurement ${assignment.measurementNumber}`
                                : assignment.measurementId
                                  ? "Measurement linked"
                                  : "No measurement linked"}
                            </p>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                            onClick={() =>
                              setAssignments((current) =>
                                current.filter(
                                  (item) =>
                                    item.customerId !== assignment.customerId,
                                ),
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="mt-3 flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                          <span className="text-xs text-slate-600">
                            Default block for this customer
                          </span>
                          <Switch
                            checked={assignment.isDefault}
                            onCheckedChange={(checked) =>
                              setAssignments((current) =>
                                current.map((item) =>
                                  item.customerId === assignment.customerId
                                    ? { ...item, isDefault: checked }
                                    : item,
                                ),
                              )
                            }
                          />
                        </div>

                        <div className="mt-2 flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 bg-white"
                            disabled={
                              linkingCustomerId === assignment.customerId
                            }
                            onClick={() =>
                              handleLinkLatestMeasurement(assignment)
                            }
                          >
                            {linkingCustomerId === assignment.customerId ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Link2 className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            {assignment.measurementId
                              ? "Relink latest measurement"
                              : "Link latest measurement"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-10 text-center text-sm text-slate-500">
                    <UserRound className="mx-auto mb-2 h-6 w-6 text-slate-400" />
                    No customers assigned to this block.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="border-t border-slate-200 bg-white px-5 py-4">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            disabled={updateBlockCustomers.isPending}
            onClick={() => handleClose(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-lg bg-slate-900 hover:bg-slate-800"
            disabled={isBusy || updateBlockCustomers.isPending}
            onClick={handleSave}
          >
            {updateBlockCustomers.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Assignments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
