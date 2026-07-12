"use client";

import * as React from "react";
import {
  FileText,
  Hash,
  Link2,
  Loader2,
  PackageOpen,
  Plus,
  Save,
  Settings2,
  Trash2,
  UserRound,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  getLatestMeasurement,
  useGetLatestMeasurement,
} from "@/api/useGetLatestMeasurement";
import type { CustomerLookupItem } from "@/api/useGetCustomerLookup";
import { CustomerPhoneLookupField } from "@/components/layout/components/customer-phone-lookup-field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/errors/api-error-response";
import { useGetBlockById } from "../api/useGetBlockById";
import { getBlocks } from "../api/useGetBlocks";
import { useLinkMeasurementToBlock } from "../api/useLinkMeasurementToBlock";
import { useRemoveBlockCustomer } from "../api/useRemoveBlockCustomer";
import { useUpdateBlock } from "../api/useUpdateBlock";
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
  const [assignments, setAssignments] = React.useState<CustomerAssignment[]>(
    [],
  );
  const [selectedCustomer, setSelectedCustomer] =
    React.useState<CustomerLookupItem | null>(null);
  const [lookupResetKey, setLookupResetKey] = React.useState(0);
  const [linkingCustomerId, setLinkingCustomerId] = React.useState<
    string | null
  >(null);
  const [pendingRemoval, setPendingRemoval] =
    React.useState<CustomerAssignment | null>(null);

  const form = useForm<AssignmentFormValues>({ defaultValues });
  const updateBlockCustomers = useUpdateBlockCustomers();
  const linkMeasurementToBlock = useLinkMeasurementToBlock();
  const removeBlockCustomer = useRemoveBlockCustomer();
  const { data, isLoading, isFetching } = useGetBlockById(blockId, open);

  const block = data?.data;
  const categoryId = block?.categoryId;

  // Customers already persisted on the block. Removing one of these deletes the
  // relationship on the server (with confirmation); customers only added in this
  // session are just dropped from local state.
  const persistedCustomerIds = React.useMemo(
    () =>
      new Set((block?.customerBlocks ?? []).map((item) => item.customerId)),
    [block],
  );

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

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

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
    });

    return () => {
      cancelled = true;
    };
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
      setPendingRemoval(null);
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

      toast.success("Customer assignments updated successfully");
      onUpdated?.();
      handleClose(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update customer assignments."),
      );
    }
  };

  const handleLinkLatestMeasurement = async (
    assignment: CustomerAssignment,
  ) => {
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

  const handleRemoveClick = (assignment: CustomerAssignment) => {
    if (persistedCustomerIds.has(assignment.customerId)) {
      // Persisted relationship — confirm before deleting on the server.
      setPendingRemoval(assignment);
      return;
    }

    // Draft-only customer — nothing persisted yet, drop it locally.
    setAssignments((current) =>
      current.filter((item) => item.customerId !== assignment.customerId),
    );
  };

  const handleConfirmRemoval = async () => {
    if (!blockId || !pendingRemoval) return;

    const target = pendingRemoval;

    try {
      await removeBlockCustomer.mutateAsync({
        blockId,
        customerId: target.customerId,
      });

      setAssignments((current) =>
        current.filter((item) => item.customerId !== target.customerId),
      );

      toast.success(`${target.customerName} removed from this block`);
      onUpdated?.();
      setPendingRemoval(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to remove customer from this block."),
      );
    }
  };

  const isBusy = isLoading || isFetching;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-lg">Assign Customers</DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                Add customers, choose their default block, and link matching
                measurements.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {isBusy ? (
            <div className="flex h-56 items-center justify-center text-sm">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading block customers...
            </div>
          ) : (
            <>
              <div className="rounded-lg border p-4">
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
                  <p className="text-xs">
                    {customerId && isMeasurementFetching
                      ? "Finding latest measurement..."
                      : latestMeasurement
                        ? `Latest measurement: ${latestMeasurement.measurementNumber}`
                        : "Customer can be assigned without a measurement link."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!customerId || isMeasurementFetching}
                    onClick={handleAddCustomer}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add customer
                  </Button>
                </div>
              </div>

              <div className="border">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <p className="text-sm font-semibold">Assigned Customers</p>
                  <Badge variant="outline">{assignments.length}</Badge>
                </div>

                {assignments.length ? (
                  <div className="divide-y">
                    {assignments.map((assignment) => (
                      <div key={assignment.customerId} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {assignment.customerName}
                            </p>
                            <p className="mt-1 truncate text-xs">
                              {assignment.phoneNumber || "-"}
                              {assignment.town ? ` - ${assignment.town}` : ""}
                              {assignment.hospitalName
                                ? ` - ${assignment.hospitalName}`
                                : ""}
                            </p>
                            <p className="mt-1 truncate text-xs">
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
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            aria-label={`Remove ${assignment.customerName} from this block`}
                            onClick={() => handleRemoveClick(assignment)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="mt-3 flex items-center justify-between px-3 py-2">
                          <span className="text-xs">
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
                            className="h-8"
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
                  <div className="px-4 py-10 text-center text-sm">
                    <UserRound className="mx-auto mb-2 h-6 w-6" />
                    No customers assigned to this block.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="border-t px-5 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={updateBlockCustomers.isPending}
            onClick={() => handleClose(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
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

      <AlertDialog
        open={Boolean(pendingRemoval)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !removeBlockCustomer.isPending) {
            setPendingRemoval(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2 className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Remove customer from block?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you really want to remove{" "}
              <span className="font-medium text-foreground">
                {pendingRemoval?.customerName}
              </span>{" "}
              from block{" "}
              <span className="font-medium text-foreground">
                {block?.blockNumber}
              </span>
              ? This only removes the link between the customer and this block.
              The customer stays in your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeBlockCustomer.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={removeBlockCustomer.isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmRemoval();
              }}
            >
              {removeBlockCustomer.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Remove customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

type BlockEditValues = {
  blockNumber: string;
  readyMadeSize: string;
  sizeLabel: string;
  versionNo: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  legacyId: string;
  fitNotes: string;
  description: string;
  remarks: string;
};

const emptyBlockEditValues: BlockEditValues = {
  blockNumber: "",
  readyMadeSize: "",
  sizeLabel: "",
  versionNo: "1",
  status: "ACTIVE",
  legacyId: "",
  fitNotes: "",
  description: "",
  remarks: "",
};

type EditBlockDialogProps = {
  blockId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
};

export function EditBlockDialog({
  blockId,
  open,
  onOpenChange,
  onUpdated,
}: EditBlockDialogProps) {
  const [values, setValues] =
    React.useState<BlockEditValues>(emptyBlockEditValues);
  const [blockNumberError, setBlockNumberError] = React.useState("");
  const [versionError, setVersionError] = React.useState("");
  const { data, isLoading, isFetching } = useGetBlockById(blockId, open);
  const updateBlock = useUpdateBlock();
  const block = data?.data;

  React.useEffect(() => {
    if (!open || !block) return;

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      setValues({
        blockNumber: block.blockNumber,
        readyMadeSize: block.readyMadeSize ?? "",
        sizeLabel: block.sizeLabel ?? "",
        versionNo: String(block.versionNo || 1),
        status:
          block.status === "INACTIVE" || block.status === "ARCHIVED"
            ? block.status
            : "ACTIVE",
        legacyId: block.legacyId == null ? "" : String(block.legacyId),
        fitNotes: block.fitNotes ?? "",
        description: block.description ?? "",
        remarks: block.remarks ?? "",
      });
      setBlockNumberError("");
      setVersionError("");
    });

    return () => {
      cancelled = true;
    };
  }, [block, open]);

  const setField = <K extends keyof BlockEditValues>(
    key: K,
    value: BlockEditValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleClose = (nextOpen: boolean) => {
    if (updateBlock.isPending) return;

    onOpenChange(nextOpen);

    if (!nextOpen) {
      setValues(emptyBlockEditValues);
      setBlockNumberError("");
      setVersionError("");
    }
  };

  const handleSave = async () => {
    if (!blockId || !block) return;

    const blockNumber = values.blockNumber.trim().toUpperCase();
    const versionNo = Number(values.versionNo);
    setBlockNumberError("");
    setVersionError("");

    if (!blockNumber) {
      setBlockNumberError("Block number is required.");
      return;
    }

    if (!Number.isInteger(versionNo) || versionNo < 1) {
      setVersionError("Version must be a whole number greater than zero.");
      return;
    }

    try {
      if (blockNumber !== block.blockNumber.trim().toUpperCase()) {
        const response = await getBlocks({
          page: 1,
          pageSize: 25,
          search: blockNumber,
          categoryId: block.categoryId,
          includeCounts: false,
          includeTotal: false,
        });

        const duplicate = response.data.items.some(
          (item) =>
            item.id !== blockId &&
            item.blockNumber.trim().toUpperCase() === blockNumber,
        );

        if (duplicate) {
          setBlockNumberError(
            "This block number already exists in this category.",
          );
          return;
        }
      }

      await updateBlock.mutateAsync({
        blockId,
        payload: {
          blockNumber,
          readyMadeSize: values.readyMadeSize.trim(),
          sizeLabel: values.sizeLabel.trim(),
          versionNo,
          status: values.status,
          legacyId: values.legacyId ? Number(values.legacyId) : null,
          fitNotes: values.fitNotes.trim(),
          description: values.description.trim(),
          remarks: values.remarks.trim(),
        },
      });

      toast.success("Block details updated successfully");
      onUpdated?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update block details."));
    }
  };

  const isBusy = isLoading || isFetching;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Settings2 className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg">Edit Block</DialogTitle>
              <DialogDescription className="mt-1">
                Update identity, sizing, status, and notes. Customer assignments
                are managed separately.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isBusy ? (
          <div className="flex min-h-80 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Loading block details...
          </div>
        ) : block ? (
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            <BlockEditSection
              icon={Hash}
              title="Block Identity"
              description="The number must be unique inside its category."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <BlockEditField label="Block Number" error={blockNumberError}>
                  <Input
                    value={values.blockNumber}
                    maxLength={100}
                    aria-invalid={Boolean(blockNumberError)}
                    onChange={(event) => {
                      setField("blockNumber", event.target.value.toUpperCase());
                      setBlockNumberError("");
                    }}
                  />
                </BlockEditField>

                <BlockEditField label="Category">
                  <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3">
                    <Badge variant="secondary">{block.category.name}</Badge>
                  </div>
                </BlockEditField>

                <BlockEditField label="Status">
                  <Select
                    value={values.status}
                    onValueChange={(value: BlockEditValues["status"]) =>
                      setField("status", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </BlockEditField>

                <BlockEditField label="Legacy ID">
                  <Input
                    type="number"
                    min={0}
                    value={values.legacyId}
                    placeholder="Optional"
                    onChange={(event) =>
                      setField("legacyId", event.target.value)
                    }
                  />
                </BlockEditField>
              </div>
            </BlockEditSection>

            <BlockEditSection
              icon={PackageOpen}
              title="Size & Version"
              description="Keep reusable sizing information easy to identify."
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <BlockEditField label="Ready-made Size">
                  <Input
                    value={values.readyMadeSize}
                    placeholder="e.g. M"
                    onChange={(event) =>
                      setField("readyMadeSize", event.target.value)
                    }
                  />
                </BlockEditField>

                <BlockEditField label="Size Label">
                  <Input
                    value={values.sizeLabel}
                    placeholder="e.g. Standard Medium"
                    onChange={(event) =>
                      setField("sizeLabel", event.target.value)
                    }
                  />
                </BlockEditField>

                <BlockEditField label="Version No." error={versionError}>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    value={values.versionNo}
                    aria-invalid={Boolean(versionError)}
                    onChange={(event) => {
                      setField("versionNo", event.target.value);
                      setVersionError("");
                    }}
                  />
                </BlockEditField>
              </div>

              {block.previousBlock && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Previous version: {block.previousBlock.blockNumber} (V
                  {block.previousBlock.versionNo})
                </p>
              )}
            </BlockEditSection>

            <BlockEditSection
              icon={FileText}
              title="Notes & Description"
              description="Add practical details used when selecting this block."
            >
              <div className="space-y-4">
                <BlockEditField label="Fit Notes">
                  <Input
                    value={values.fitNotes}
                    placeholder="e.g. Regular fit with extra shoulder allowance"
                    onChange={(event) =>
                      setField("fitNotes", event.target.value)
                    }
                  />
                </BlockEditField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <BlockEditField label="Description">
                    <Textarea
                      value={values.description}
                      className="min-h-24 resize-none"
                      placeholder="Describe this block"
                      onChange={(event) =>
                        setField("description", event.target.value)
                      }
                    />
                  </BlockEditField>

                  <BlockEditField label="Remarks">
                    <Textarea
                      value={values.remarks}
                      className="min-h-24 resize-none"
                      placeholder="Add internal remarks"
                      onChange={(event) =>
                        setField("remarks", event.target.value)
                      }
                    />
                  </BlockEditField>
                </div>
              </div>
            </BlockEditSection>
          </div>
        ) : (
          <div className="flex min-h-80 items-center justify-center text-sm text-muted-foreground">
            Block details could not be loaded.
          </div>
        )}

        <DialogFooter className="border-t px-5 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={updateBlock.isPending}
            onClick={() => handleClose(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isBusy || !block || updateBlock.isPending}
            onClick={handleSave}
          >
            {updateBlock.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BlockEditSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border p-4">
      <div className="mb-4 flex items-center gap-3 border-b pb-3">
        <div className="flex size-8 items-center justify-center rounded-md bg-muted">
          <Icon className="size-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function BlockEditField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
