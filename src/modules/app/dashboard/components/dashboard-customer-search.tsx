"use client";

import * as React from "react";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Edit3,
  Loader2,
  MapPin,
  Phone,
  RefreshCcw,
  Ruler,
  Save,
  Search,
  Shirt,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  useCustomerLookup,
  type CustomerLookupItem,
} from "@/api/useGetCustomerLookup";

import {
  useGetLatestMeasurement,
  type Measurement,
  type MeasurementVerificationStatus,
} from "@/api/useGetLatestMeasurement";

import { useUpdateMeasurement } from "@/api/useUpdateMeasurements";

type MeasurementItem = {
  id: string;
  fieldId: string;
  key: string;
  label: string;
  value: string;
  unit: string | null;
  note: string | null;
  inputType: string;
  isRequired: boolean;
  sortOrder: number;
};

function formatDateTime(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getVerificationLabel(status?: MeasurementVerificationStatus | null) {
  switch (status) {
    case "VERIFIED_OK":
      return "Verified OK";
    case "NEEDS_UPDATE":
      return "Needs Update";
    case "REJECTED":
      return "Rejected";
    case "PENDING":
      return "Pending";
    default:
      return "Not Verified";
  }
}

function getVerificationClasses(status?: MeasurementVerificationStatus | null) {
  switch (status) {
    case "VERIFIED_OK":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "NEEDS_UPDATE":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-700";
    case "PENDING":
      return "border-slate-200 bg-slate-50 text-slate-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getMeasurementItems(
  measurement: Measurement | null | undefined,
): MeasurementItem[] {
  if (!measurement?.values?.length) return [];

  return [...measurement.values]
    .sort((a, b) => a.field.sortOrder - b.field.sortOrder)
    .map((item) => ({
      id: item.id,
      fieldId: item.fieldId,
      key: item.field.code,
      label: item.field.label,
      value:
        item.value ??
        (item.numericValue != null ? String(item.numericValue) : ""),
      unit: item.field.unit,
      note: item.note,
      inputType: item.field.inputType,
      isRequired: item.field.isRequired,
      sortOrder: item.field.sortOrder,
    }));
}

function CustomerInitial({ name }: { name?: string | null }) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "C";

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white shadow-sm">
      {initial}
    </div>
  );
}

function MeasurementSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-2xl bg-slate-100"
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-2xl bg-slate-100"
          />
        ))}
      </div>
    </div>
  );
}

function EmptyMeasurementState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
        <Ruler className="h-5 w-5" />
      </div>

      <h4 className="mt-4 text-sm font-black text-slate-900">
        No measurements found
      </h4>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
        This customer does not have a saved latest measurement yet. Add or
        verify measurements before creating the next order.
      </p>
    </div>
  );
}

function LatestMeasurementSection({
  latestMeasurement,
  measurementItems,
  isLoading,
  isFetching,
  isEditMode,
  editableValues,
  editableNotes,
  changeNote,
  isSaving,
  onEdit,
  onCancelEdit,
  onSave,
  onValueChange,
  onNoteChange,
  onChangeNoteChange,
}: {
  latestMeasurement: Measurement | null | undefined;
  measurementItems: MeasurementItem[];
  isLoading: boolean;
  isFetching: boolean;
  isEditMode: boolean;
  editableValues: Record<string, string>;
  editableNotes: Record<string, string>;
  changeNote: string;
  isSaving: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onValueChange: (fieldId: string, value: string) => void;
  onNoteChange: (fieldId: string, value: string) => void;
  onChangeNoteChange: (value: string) => void;
}) {
  const hasMeasurement = measurementItems.length > 0;

  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 shadow-sm">
      <CardContent className="p-0">
        <div className="border-b border-slate-100 bg-white px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-2xl",
                  isEditMode
                    ? "bg-amber-50 text-amber-700"
                    : "bg-blue-50 text-blue-700",
                )}
              >
                {isEditMode ? (
                  <Edit3 className="h-4 w-4" />
                ) : (
                  <Ruler className="h-4 w-4" />
                )}
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-900">
                  {isEditMode ? "Edit Measurements" : "Latest Measurements"}
                </h4>
                <p className="mt-0.5 text-xs text-slate-500">
                  {isEditMode
                    ? "Update only the values that changed after confirming with the customer."
                    : "Confirm these previous measurements before placing the order."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isFetching && !isLoading && (
                <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating
                </div>
              )}

              {hasMeasurement && !isEditMode && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-lg border-amber-200 bg-amber-50 px-3 text-xs font-black text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                  onClick={onEdit}
                >
                  <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                  Edit Measurements
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {isLoading ? (
            <MeasurementSkeleton />
          ) : !hasMeasurement ? (
            <EmptyMeasurementState />
          ) : (
            <div className="space-y-5">
              {isEditMode && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                    <div>
                      <p className="text-sm font-black text-amber-900">
                        Customer has measurement changes
                      </p>
                      <p className="mt-1 text-xs leading-5 text-amber-800">
                        Change only the required fields. Save the measurement
                        before placing the order.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Measurement No
                  </p>
                  <p className="mt-1 truncate text-sm font-black text-slate-900">
                    {latestMeasurement?.measurementNumber ?? "-"}
                  </p>
                </div>

                <div
                  className={cn(
                    "rounded-2xl border p-3",
                    isEditMode
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : getVerificationClasses(
                          latestMeasurement?.verificationStatus,
                        ),
                  )}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] opacity-70">
                    Status
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <p className="truncate text-sm font-black">
                      {isEditMode
                        ? "Editing"
                        : getVerificationLabel(
                            latestMeasurement?.verificationStatus,
                          )}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Category
                  </p>
                  <p className="mt-1 truncate text-sm font-black text-slate-900">
                    {latestMeasurement?.category?.name ?? "-"}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Block
                  </p>
                  <p className="mt-1 truncate text-sm font-black text-slate-900">
                    {latestMeasurement?.block?.blockNumber ?? "-"}
                  </p>
                </div>
              </div>

              {latestMeasurement?.block && (
                <div className="rounded-lg border border-purple-100 bg-purple-50/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-purple-700 shadow-sm">
                      <Shirt className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="text-sm font-black text-slate-900">
                          Block {latestMeasurement.block.blockNumber}
                        </h5>

                        {latestMeasurement.block.readyMadeSize && (
                          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-purple-700 shadow-sm">
                            Size {latestMeasurement.block.readyMadeSize}
                          </span>
                        )}
                      </div>

                      {latestMeasurement.block.sizeLabel && (
                        <p className="mt-1 text-xs font-medium text-slate-600">
                          {latestMeasurement.block.sizeLabel}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {measurementItems.map((item) => {
                  const isTextArea = item.inputType === "TEXTAREA";
                  const currentValue = editableValues[item.fieldId] ?? "";
                  const originalValue = item.value ?? "";
                  const currentNote = editableNotes[item.fieldId] ?? "";
                  const originalNote = item.note ?? "";
                  const isChanged =
                    currentValue !== originalValue ||
                    currentNote !== originalNote;

                  return (
                    <div
                      key={item.key}
                      className={cn(
                        "rounded-2xl border p-3 transition",
                        isEditMode
                          ? isChanged
                            ? "border-amber-300 bg-amber-50 shadow-sm"
                            : "border-slate-200 bg-white"
                          : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white hover:shadow-sm",
                        isTextArea &&
                          "sm:col-span-2 md:col-span-3 lg:col-span-4",
                      )}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                            {item.label}
                          </p>

                          {item.unit && (
                            <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                              Unit: {item.unit}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          {isChanged && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-700">
                              Changed
                            </span>
                          )}

                          {item.isRequired && (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-red-600">
                              Required
                            </span>
                          )}
                        </div>
                      </div>

                      {isEditMode ? (
                        <div className="space-y-2">
                          {isTextArea ? (
                            <Textarea
                              value={currentValue}
                              onChange={(event) =>
                                onValueChange(item.fieldId, event.target.value)
                              }
                              className="min-h-24 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-900"
                              placeholder={`Enter ${item.label.toLowerCase()}`}
                            />
                          ) : (
                            <Input
                              value={currentValue}
                              onChange={(event) =>
                                onValueChange(item.fieldId, event.target.value)
                              }
                              inputMode={
                                item.inputType === "DECIMAL" ||
                                item.inputType === "NUMBER"
                                  ? "decimal"
                                  : "text"
                              }
                              className="h-11 rounded-xl border-slate-200 bg-white text-base font-black text-slate-900"
                              placeholder={`Enter ${item.label.toLowerCase()}`}
                            />
                          )}

                          <Input
                            value={currentNote}
                            onChange={(event) =>
                              onNoteChange(item.fieldId, event.target.value)
                            }
                            className="h-9 rounded-xl border-slate-200 bg-white text-xs"
                            placeholder="Optional note"
                          />
                        </div>
                      ) : (
                        <>
                          <p
                            className={cn(
                              "mt-2 font-black text-slate-900",
                              isTextArea
                                ? "text-sm leading-6"
                                : "text-xl tracking-tight",
                            )}
                          >
                            {item.value || "-"}
                            {item.unit && (
                              <span className="ml-1 text-xs font-bold text-slate-500">
                                {item.unit}
                              </span>
                            )}
                          </p>

                          {item.note && (
                            <p className="mt-2 rounded-xl bg-white px-2 py-1.5 text-xs font-medium text-slate-500">
                              {item.note}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {isEditMode && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Change Note
                  </p>

                  <Textarea
                    value={changeNote}
                    onChange={(event) => onChangeNoteChange(event.target.value)}
                    className="mt-2 min-h-20 rounded-xl border-slate-200 bg-white text-sm"
                    placeholder="Example: Customer said waist and sleeve length changed over the phone."
                  />
                </div>
              )}

              {!isEditMode &&
                (latestMeasurement?.verificationNote ||
                  latestMeasurement?.notes ||
                  latestMeasurement?.verifiedBy ||
                  latestMeasurement?.verifiedAt) && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                          Verification
                        </p>

                        <div className="mt-2 space-y-2 text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            <BadgeCheck className="h-4 w-4 text-emerald-600" />
                            <span className="font-semibold">
                              {latestMeasurement?.verifiedBy
                                ? `${latestMeasurement.verifiedBy.firstName} ${latestMeasurement.verifiedBy.lastName}`
                                : "Not assigned"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <CalendarClock className="h-4 w-4" />
                            <span>
                              {formatDateTime(latestMeasurement?.verifiedAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                          Notes
                        </p>

                        <div className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                          {latestMeasurement?.verificationNote && (
                            <p>{latestMeasurement.verificationNote}</p>
                          )}

                          {latestMeasurement?.notes && (
                            <p className="text-slate-500">
                              {latestMeasurement.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {isEditMode && (
                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-lg border-slate-200 px-5 font-bold"
                    disabled={isSaving}
                    onClick={onCancelEdit}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Cancel Changes
                  </Button>

                  <Button
                    type="button"
                    className="h-11 rounded-lg px-5 font-bold"
                    disabled={isSaving}
                    onClick={onSave}
                  >
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Measurements
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardCustomerSearchCard() {
  const navigate = useNavigate();

  const [search, setSearch] = React.useState("");
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    React.useState<CustomerLookupItem | null>(null);

  const [isMeasurementEditMode, setIsMeasurementEditMode] =
    React.useState(false);

  const [editableMeasurementValues, setEditableMeasurementValues] =
    React.useState<Record<string, string>>({});

  const [editableMeasurementNotes, setEditableMeasurementNotes] =
    React.useState<Record<string, string>>({});

  const [measurementChangeNote, setMeasurementChangeNote] = React.useState("");

  const trimmedSearch = search.trim();

  const { data: customers, isLoading: isCustomersLoading } = useCustomerLookup({
    search: trimmedSearch,
    limit: 8,
  });

  const {
    data: latestMeasurement,
    isLoading: isMeasurementsLoading,
    isFetching: isMeasurementsFetching,
  } = useGetLatestMeasurement({
    customerId: selectedCustomer?.id,
    enabled: Boolean(selectedCustomer?.id),
  });

  const updateMeasurementMutation = useUpdateMeasurement();

  const customerList = customers?.data ?? [];

  const measurementItems = React.useMemo(
    () => getMeasurementItems(latestMeasurement),
    [latestMeasurement],
  );

  const showCustomerList = trimmedSearch.length > 0 && !selectedCustomer;

  React.useEffect(() => {
    if (!latestMeasurement?.values?.length) {
      setEditableMeasurementValues({});
      setEditableMeasurementNotes({});
      setMeasurementChangeNote("");
      setIsMeasurementEditMode(false);
      return;
    }

    const nextValues: Record<string, string> = {};
    const nextNotes: Record<string, string> = {};

    latestMeasurement.values.forEach((item) => {
      nextValues[item.fieldId] =
        item.value ??
        (item.numericValue != null ? String(item.numericValue) : "");
      nextNotes[item.fieldId] = item.note ?? "";
    });

    setEditableMeasurementValues(nextValues);
    setEditableMeasurementNotes(nextNotes);
    setMeasurementChangeNote("");
    setIsMeasurementEditMode(false);
  }, [latestMeasurement?.id]);

  const handleClear = () => {
    setSearch("");
    setSelectedCustomer(null);
    setIsDetailOpen(false);
    setIsMeasurementEditMode(false);
  };

  const handleSelectCustomer = (customer: CustomerLookupItem) => {
    setSelectedCustomer(customer);
    setSearch(customer.fullName);
    setIsMeasurementEditMode(false);
  };

  const handleCancelMeasurementEdit = () => {
    const nextValues: Record<string, string> = {};
    const nextNotes: Record<string, string> = {};

    latestMeasurement?.values?.forEach((item) => {
      nextValues[item.fieldId] =
        item.value ??
        (item.numericValue != null ? String(item.numericValue) : "");
      nextNotes[item.fieldId] = item.note ?? "";
    });

    setEditableMeasurementValues(nextValues);
    setEditableMeasurementNotes(nextNotes);
    setMeasurementChangeNote("");
    setIsMeasurementEditMode(false);
  };

  const handleSaveMeasurementChanges = async () => {
    if (!latestMeasurement) return;

    const values = latestMeasurement.values.map((item) => ({
      fieldId: item.fieldId,
      value: editableMeasurementValues[item.fieldId]?.trim() || null,
      note: editableMeasurementNotes[item.fieldId]?.trim() || null,
    }));

    await updateMeasurementMutation.mutateAsync({
      measurementId: latestMeasurement.id,
      verificationStatus: "NEEDS_UPDATE",
      verificationNote:
        measurementChangeNote.trim() ||
        "Measurement updated during customer confirmation.",
      notes: latestMeasurement.notes,
      values,
    });

    setIsMeasurementEditMode(false);
  };

  const handlePlaceOrder = () => {
    if (!selectedCustomer) return;

    navigate({
      to: "/app/orders",
      search: {
        addOrder: true,
        customerId: selectedCustomer.id,
        measurementId: latestMeasurement?.id,
        blockId: latestMeasurement?.blockId ?? undefined,
        categoryId: latestMeasurement?.categoryId ?? undefined,
      },
    });
  };

  return (
    <>
      <Card className="relative z-30 overflow-visible rounded-lg border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_220px] sm:items-end">
            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Find Customer
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Search by name, phone number, or town.
                  </p>
                </div>

                {selectedCustomer && (
                  <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 sm:inline-flex">
                    Customer Selected
                  </span>
                )}
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <Input
                  value={selectedCustomer ? selectedCustomer.fullName : search}
                  onChange={(event) => {
                    setSelectedCustomer(null);
                    setSearch(event.target.value);
                    setIsMeasurementEditMode(false);
                  }}
                  placeholder="Search customer by name, phone or town..."
                  className={cn(
                    "h-13 w-full rounded-2xl border-slate-200 bg-slate-50 pl-11 pr-11 text-base font-semibold text-slate-900 shadow-none outline-none transition",
                    "placeholder:text-sm placeholder:font-medium placeholder:text-slate-400",
                    "focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50",
                  )}
                />

                {(search || selectedCustomer) && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Clear customer search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {showCustomerList && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                    {isCustomersLoading ? (
                      <div className="flex items-center gap-3 px-4 py-4 text-sm font-medium text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching customers...
                      </div>
                    ) : customerList.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                          <UserRound className="h-4 w-4" />
                        </div>
                        <p className="mt-3 text-sm font-bold text-slate-800">
                          No customers found
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Try customer name, phone number, or town.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto p-2">
                        {customerList.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => handleSelectCustomer(customer)}
                            className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50"
                          >
                            <CustomerInitial name={customer.fullName} />

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-black text-slate-900">
                                {customer.fullName}
                              </p>

                              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
                                {customer.phoneNumber && (
                                  <span className="inline-flex items-center gap-1 truncate">
                                    <Phone className="h-3 w-3" />
                                    {customer.phoneNumber}
                                  </span>
                                )}

                                {customer.town && (
                                  <span className="inline-flex items-center gap-1 truncate">
                                    <MapPin className="h-3 w-3" />
                                    {customer.town}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm ring-1 ring-slate-100 transition group-hover:text-slate-700">
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Button
              type="button"
              className={cn(
                "h-13 w-full rounded-2xl px-6 text-sm font-black shadow-sm",
                "disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-100",
              )}
              disabled={!selectedCustomer}
              onClick={() => setIsDetailOpen(true)}
            >
              Customer Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="flex max-h-[92vh] gap-0 flex-col overflow-hidden rounded-lg border-slate-200 p-0 sm:max-w-5xl">
          {/* Fixed Header */}
          <DialogHeader className="shrink-0 border-b border-gray-300 px-5 py-4 bg-background">
            <DialogTitle className="text-base font-black text-slate-900">
              Customer Details
            </DialogTitle>
          </DialogHeader>

          {!selectedCustomer ? null : (
            <>
              {/* Scrollable Content Only */}
              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                <div className="space-y-5">
                  <Card className="overflow-hidden rounded-lg border-slate-200 shadow-sm">
                    <CardContent className="p-0">
                      <div className="border-b border-slate-100 bg-white p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                              Customer
                            </p>

                            <h3 className="mt-1 truncate text-xl font-black text-slate-900">
                              {selectedCustomer.fullName}
                            </h3>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-slate-500">
                              {selectedCustomer.phoneNumber && (
                                <span className="inline-flex items-center gap-1.5">
                                  <Phone className="h-4 w-4 text-slate-400" />
                                  {selectedCustomer.phoneNumber}
                                </span>
                              )}

                              {selectedCustomer.town && (
                                <span className="inline-flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4 text-slate-400" />
                                  {selectedCustomer.town}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 gap-2">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-center">
                              <p className="text-base font-black text-slate-900">
                                {latestMeasurement?.customer?._count
                                  ?.customerBlocks ?? 0}
                              </p>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Blocks
                              </p>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-center">
                              <p className="text-base font-black text-slate-900">
                                {latestMeasurement?.customer?._count?.orders ??
                                  0}
                              </p>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Orders
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedCustomer.hospitalName && (
                        <div className="bg-slate-50 px-4 py-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                            Hospital / Workplace
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {selectedCustomer.hospitalName}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <LatestMeasurementSection
                    latestMeasurement={latestMeasurement}
                    measurementItems={measurementItems}
                    isLoading={isMeasurementsLoading}
                    isFetching={isMeasurementsFetching}
                    isEditMode={isMeasurementEditMode}
                    editableValues={editableMeasurementValues}
                    editableNotes={editableMeasurementNotes}
                    changeNote={measurementChangeNote}
                    isSaving={updateMeasurementMutation.isPending}
                    onEdit={() => setIsMeasurementEditMode(true)}
                    onCancelEdit={handleCancelMeasurementEdit}
                    onSave={handleSaveMeasurementChanges}
                    onValueChange={(fieldId, value) =>
                      setEditableMeasurementValues((previous) => ({
                        ...previous,
                        [fieldId]: value,
                      }))
                    }
                    onNoteChange={(fieldId, value) =>
                      setEditableMeasurementNotes((previous) => ({
                        ...previous,
                        [fieldId]: value,
                      }))
                    }
                    onChangeNoteChange={setMeasurementChangeNote}
                  />
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="shrink-0 border-t border-b-slate-200 bg-background px-4 py-3 sm:px-5">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-lg border-slate-200 px-5 font-bold"
                    disabled={updateMeasurementMutation.isPending}
                    onClick={() => setIsDetailOpen(false)}
                  >
                    Close
                  </Button>

                  <Button
                    type="button"
                    className="h-11 rounded-lg bg-slate-900 px-5 font-bold text-white hover:bg-slate-800"
                    disabled={
                      isMeasurementEditMode ||
                      isMeasurementsLoading ||
                      updateMeasurementMutation.isPending ||
                      !selectedCustomer
                    }
                    onClick={handlePlaceOrder}
                  >
                    Place Order
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
