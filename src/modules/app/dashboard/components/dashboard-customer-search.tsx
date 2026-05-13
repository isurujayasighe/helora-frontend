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
  useGetCustomerById,
  type CustomerBlockAssignment,
  type CustomerDetails,
  type CustomerOrderSummary,
} from "@/modules/app/customers/api/useGetCustomerbyId";

import {
  useGetLatestMeasurement,
  type Measurement,
  type MeasurementVerificationStatus,
} from "@/api/useGetLatestMeasurement";

import { useCreateMeasurement } from "@/api/useCreateMeasurement";
import { useUpdateMeasurement } from "@/api/useUpdateMeasurements";
import { useGetCategories, type Category } from "@/api/useGetCategories";
import {
  useMeasurementFieldsQuery,
  type MeasurementField,
  type MeasurementFieldsResponse,
} from "@/modules/app/measurements/api/useGetMeasurementsFieldsByCID";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getVerificationLabel(status?: MeasurementVerificationStatus | null) {
  switch (status) {
    case "VERIFIED_OK":
      return "Verified OK";
    case "NEEDS_UPDATE":
      return "Needs Update";
    case "UPDATED":
      return "Updated";
    case "REJECTED":
      return "Rejected";
    case "PENDING":
      return "Pending";
    case "NOT_VERIFIED":
      return "Not Verified";
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
    case "UPDATED":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-700";
    case "PENDING":
    case "NOT_VERIFIED":
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

function getMeasurementFieldRows(
  response?: MeasurementFieldsResponse | MeasurementField[],
): MeasurementField[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

function getBlockCategoryId(assignment: CustomerBlockAssignment) {
  return assignment.block.category?.id ?? "";
}

function getInitialMeasurementCategoryId(blocks: CustomerBlockAssignment[]) {
  const block = blocks.find((assignment) => assignment.isDefault) ?? blocks[0];

  return block ? getBlockCategoryId(block) : "";
}

function getInitialMeasurementBlockId(
  blocks: CustomerBlockAssignment[],
  categoryId: string,
) {
  const matchingBlocks = categoryId
    ? blocks.filter(
        (assignment) => getBlockCategoryId(assignment) === categoryId,
      )
    : blocks;

  return (
    (
      matchingBlocks.find((assignment) => assignment.isDefault) ??
      matchingBlocks[0]
    )?.block.id ?? ""
  );
}

function getMeasurementValueMap(measurement: Measurement | null | undefined) {
  if (!measurement?.values?.length) return {};

  return measurement.values.reduce<Record<string, string>>((result, item) => {
    result[item.fieldId] =
      item.value ??
      (item.numericValue != null ? String(item.numericValue) : "");
    return result;
  }, {});
}

function CustomerInitial({ name }: { name?: string | null }) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "C";

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white shadow-sm">
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
        This customer does not have a saved measurement for the selected garment
        part yet. Add measurements before assigning that part to an order.
      </p>
    </div>
  );
}

function AddMeasurementForm({
  customerId,
  blocks,
  categories,
  initialCategoryId,
  initialBlockId,
  initialValues,
  initialMeasurementNote,
  initialBlock,
  initialCategory,
  previousMeasurementId,
  previousVersionNo,
  isNewVersion = false,
  onSaved,
  onCancel,
}: {
  customerId: string;
  blocks: CustomerBlockAssignment[];
  categories: Category[];
  initialCategoryId?: string;
  initialBlockId?: string;
  initialValues?: Record<string, string>;
  initialMeasurementNote?: string;
  initialBlock?: Measurement["block"] | null;
  initialCategory?: Measurement["category"] | null;
  previousMeasurementId?: string;
  previousVersionNo?: number;
  isNewVersion?: boolean;
  onSaved: (measurement: Measurement) => void;
  onCancel: () => void;
}) {
  const createMeasurementMutation = useCreateMeasurement();

  const [selectedCategoryId, setSelectedCategoryId] = React.useState(
    () => initialCategoryId || getInitialMeasurementCategoryId(blocks),
  );
  const [selectedBlockId, setSelectedBlockId] = React.useState(
    () =>
      initialBlockId ||
      getInitialMeasurementBlockId(
        blocks,
        initialCategoryId || getInitialMeasurementCategoryId(blocks),
      ),
  );
  const [values, setValues] = React.useState<Record<string, string>>(
    initialValues ?? {},
  );
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [measurementNote, setMeasurementNote] = React.useState(
    initialMeasurementNote ??
      (isNewVersion
        ? "New measurement version created because the previous measurement changed heavily."
        : "Legacy customer measurement added before placing order."),
  );

  const categoryOptions = React.useMemo(() => {
    const activeCategories = categories
      .filter((category) => category.isActive)
      .map((category) => ({
        id: category.id,
        name: category.name,
      }));
    const blockCategories = blocks
      .map((assignment) => assignment.block.category)
      .filter((category): category is NonNullable<typeof category> =>
        Boolean(category?.id),
      )
      .map((category) => ({
        id: category.id,
        name: category.name,
      }));
    const seedCategory = initialCategory?.id
      ? [{ id: initialCategory.id, name: initialCategory.name }]
      : [];

    return [...activeCategories, ...blockCategories, ...seedCategory].filter(
      (category, index, list) =>
        list.findIndex((item) => item.id === category.id) === index,
    );
  }, [blocks, categories, initialCategory]);

  const categoryBlocks = React.useMemo(() => {
    const assignedBlocks = blocks
      .filter(
        (assignment) => getBlockCategoryId(assignment) === selectedCategoryId,
      )
      .map((assignment) => assignment.block);
    const seedBlock =
      initialBlock?.id && initialBlock.categoryId === selectedCategoryId
        ? [initialBlock]
        : [];

    return [...assignedBlocks, ...seedBlock].filter(
      (block, index, list) =>
        list.findIndex((item) => item.id === block.id) === index,
    );
  }, [blocks, initialBlock, selectedCategoryId]);

  const selectedBlock = categoryBlocks.find(
    (block) => block.id === selectedBlockId,
  );

  const {
    data: measurementFieldsResponse,
    isLoading: isMeasurementFieldsLoading,
    isFetching: isMeasurementFieldsFetching,
    isError: isMeasurementFieldsError,
  } = useMeasurementFieldsQuery(
    {
      pageIndex: 0,
      pageSize: 100,
      categoryId: selectedCategoryId,
      isActive: true,
    },
    {
      enabled: Boolean(selectedCategoryId),
    },
  );

  const measurementFields = React.useMemo(
    () =>
      getMeasurementFieldRows(measurementFieldsResponse)
        .filter((field) => field.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [measurementFieldsResponse],
  );

  const isLoadingFields =
    Boolean(selectedCategoryId) &&
    (isMeasurementFieldsLoading || isMeasurementFieldsFetching);

  const hasAnyValue = measurementFields.some((field) =>
    values[field.id]?.trim(),
  );

  const missingRequiredFields = measurementFields.filter(
    (field) => field.isRequired && !values[field.id]?.trim(),
  );

  const isSaveDisabled =
    createMeasurementMutation.isPending ||
    !customerId ||
    !selectedCategoryId ||
    isLoadingFields ||
    isMeasurementFieldsError ||
    measurementFields.length === 0 ||
    missingRequiredFields.length > 0 ||
    !hasAnyValue;

  React.useEffect(() => {
    const nextCategoryId =
      initialCategoryId || getInitialMeasurementCategoryId(blocks);
    setSelectedCategoryId(nextCategoryId);
    setSelectedBlockId(
      initialBlockId || getInitialMeasurementBlockId(blocks, nextCategoryId),
    );
    setValues(initialValues ?? {});
    setNotes({});
    setMeasurementNote(
      initialMeasurementNote ??
        (isNewVersion
          ? "New measurement version created because the previous measurement changed heavily."
          : "Legacy customer measurement added before placing order."),
    );
  }, [
    blocks,
    initialBlockId,
    initialCategoryId,
    initialMeasurementNote,
    initialValues,
    isNewVersion,
  ]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedBlockId(getInitialMeasurementBlockId(blocks, categoryId));
    setValues({});
    setNotes({});
  };

  const handleBlockChange = (blockId: string) => {
    const block = categoryBlocks.find((item) => item.id === blockId);
    setSelectedBlockId(blockId);

    const blockCategoryId = block?.category?.id ?? selectedCategoryId;
    if (blockCategoryId && blockCategoryId !== selectedCategoryId) {
      setSelectedCategoryId(blockCategoryId);
      setValues({});
      setNotes({});
    }
  };

  const handleSave = async () => {
    if (isSaveDisabled) return;

    const measurement = await createMeasurementMutation.mutateAsync({
      customerId,
      blockId: selectedBlockId || undefined,
      categoryId: selectedCategoryId,
      verificationStatus: "NOT_VERIFIED",
      verificationNote: isNewVersion
        ? "New measurement version added from dashboard customer search."
        : "Measurement added from dashboard customer search.",
      previousMeasurementId,
      versionNo: previousVersionNo ? previousVersionNo + 1 : undefined,
      notes: measurementNote.trim() || undefined,
      values: measurementFields
        .filter((field) => values[field.id]?.trim() || notes[field.id]?.trim())
        .map((field) => ({
          fieldId: field.id,
          value: values[field.id]?.trim() || undefined,
          note: notes[field.id]?.trim() || undefined,
        })),
    });

    onSaved(measurement);
  };

  return (
    <div className="space-y-4 rounded-lg border border-blue-100 bg-blue-50/40 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm">
          <Ruler className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-black text-slate-900">
            {isNewVersion ? "New Measurements" : "Add Measurements"}
          </h4>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {isNewVersion
              ? "Use this when the customer's body measurements changed heavily. The previous measurement stays available as history."
              : "Select the garment category first. Measurement fields will load for that category and the saved measurement will be used for the order."}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
            Category
          </label>
          <select
            value={selectedCategoryId}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            <option value="">Select category</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
            Block No Optional
          </label>
          <select
            value={selectedBlockId}
            onChange={(event) => handleBlockChange(event.target.value)}
            disabled={!selectedCategoryId}
            className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">
              {!selectedCategoryId
                ? "Select category first"
                : "No block - create after order"}
            </option>
            {categoryBlocks.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.blockNumber}
                {assignment.sizeLabel ? ` - ${assignment.sizeLabel}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedBlock && (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
          Using block {selectedBlock.blockNumber}
          {selectedBlock.category?.name
            ? ` for ${selectedBlock.category.name}`
            : ""}
        </div>
      )}

      {selectedCategoryId && !selectedBlock && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
          No block selected. Save the measurements now and create or link the
          block after placing the order.
        </div>
      )}

      {!selectedCategoryId && (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500">
          Select a category to enter measurements.
        </div>
      )}

      {isLoadingFields && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading measurement fields...
        </div>
      )}

      {selectedCategoryId && isMeasurementFieldsError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          Measurement fields could not be loaded. Please try again.
        </div>
      )}

      {selectedCategoryId &&
        !isLoadingFields &&
        !isMeasurementFieldsError &&
        measurementFields.length === 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            No active measurement fields found for this category.
          </div>
        )}

      {measurementFields.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {measurementFields.map((field) => {
            const inputType = String(field.inputType);
            const isTextArea = inputType === "TEXTAREA";

            return (
              <div
                key={field.id}
                className={cn(
                  "rounded-lg border border-slate-200 bg-white p-3",
                  isTextArea && "sm:col-span-2 md:col-span-3",
                )}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                      {field.label}
                    </p>
                    {field.unit && (
                      <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                        Unit: {field.unit}
                      </p>
                    )}
                  </div>

                  {field.isRequired && (
                    <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-red-600">
                      Required
                    </span>
                  )}
                </div>

                {isTextArea ? (
                  <Textarea
                    value={values[field.id] ?? ""}
                    onChange={(event) =>
                      setValues((previous) => ({
                        ...previous,
                        [field.id]: event.target.value,
                      }))
                    }
                    className="min-h-24 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-900"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                ) : (
                  <Input
                    value={values[field.id] ?? ""}
                    onChange={(event) =>
                      setValues((previous) => ({
                        ...previous,
                        [field.id]: event.target.value,
                      }))
                    }
                    inputMode={
                      field.inputType === "DECIMAL" ||
                      field.inputType === "NUMBER" ||
                      inputType === "INTEGER"
                        ? "decimal"
                        : "text"
                    }
                    className="h-11 rounded-xl border-slate-200 bg-white text-base font-black text-slate-900"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}

                <Input
                  value={notes[field.id] ?? ""}
                  onChange={(event) =>
                    setNotes((previous) => ({
                      ...previous,
                      [field.id]: event.target.value,
                    }))
                  }
                  className="mt-2 h-9 rounded-xl border-slate-200 bg-white text-xs"
                  placeholder="Optional note"
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
          Measurement Note
        </p>
        <Textarea
          value={measurementNote}
          onChange={(event) => setMeasurementNote(event.target.value)}
          className="mt-2 min-h-20 rounded-xl border-slate-200 bg-white text-sm"
          placeholder="Example: Measurements added from legacy block confirmation."
        />
      </div>

      {missingRequiredFields.length > 0 && selectedCategoryId && (
        <p className="text-xs font-semibold text-amber-700">
          Required fields missing:{" "}
          {missingRequiredFields.map((field) => field.label).join(", ")}
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          className="mr-2 h-11 rounded-lg border-slate-200 px-5 font-bold"
          disabled={createMeasurementMutation.isPending}
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          type="button"
          className="h-11 rounded-lg bg-slate-900 px-5 font-bold text-white hover:bg-slate-800"
          disabled={isSaveDisabled}
          onClick={handleSave}
        >
          {createMeasurementMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isNewVersion ? "Save New Measurements" : "Save Measurements"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function LatestMeasurementSection({
  latestMeasurement,
  measurementItems,
  isLoading,
  isFetching,
  isAddMode,
  isEditMode,
  editableValues,
  editableNotes,
  changeNote,
  isSaving,
  canAddMeasurement,
  addMeasurementForm,
  onAdd,
  onCancelAdd,
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
  isAddMode: boolean;
  isEditMode: boolean;
  editableValues: Record<string, string>;
  editableNotes: Record<string, string>;
  changeNote: string;
  isSaving: boolean;
  canAddMeasurement: boolean;
  addMeasurementForm: React.ReactNode;
  onAdd: () => void;
  onCancelAdd: () => void;
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
                    : isAddMode
                      ? "bg-blue-50 text-blue-700"
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
                  {isEditMode
                    ? "Edit Measurements"
                    : isAddMode
                      ? hasMeasurement
                        ? "New Measurements"
                        : "Add Measurements"
                      : "Measurement Actions"}
                </h4>
                <p className="mt-0.5 text-xs text-slate-500">
                  {isEditMode
                    ? "Update only the values that changed after confirming with the customer."
                    : isAddMode
                      ? hasMeasurement
                        ? "Create a new measurement version for heavy body measurement changes."
                        : "Create the first measurement for this customer."
                      : "Use this area to edit the selected measurement or create a new version before starting an order."}
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

              {isAddMode && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-lg border-slate-200 px-3 text-xs font-black"
                  onClick={onCancelAdd}
                >
                  Cancel
                </Button>
              )}

              {hasMeasurement && !isEditMode && !isAddMode && (
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

              {hasMeasurement && !isEditMode && !isAddMode && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-lg border-blue-200 bg-blue-50 px-3 text-xs font-black text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                  disabled={!canAddMeasurement}
                  onClick={onAdd}
                >
                  <Ruler className="mr-1.5 h-3.5 w-3.5" />
                  New Measurements
                </Button>
              )}

              {!hasMeasurement && !isAddMode && !isLoading && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-lg border-blue-200 bg-blue-50 px-3 text-xs font-black text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                  disabled={!canAddMeasurement}
                  onClick={onAdd}
                >
                  <Ruler className="mr-1.5 h-3.5 w-3.5" />
                  Add Measurements
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {isLoading ? (
            <MeasurementSkeleton />
          ) : isAddMode ? (
            addMeasurementForm
          ) : !hasMeasurement ? (
            <div className="space-y-4">
              <EmptyMeasurementState />

              <div className="flex justify-center">
                <Button
                  type="button"
                  className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800"
                  disabled={!canAddMeasurement}
                  onClick={onAdd}
                >
                  <Ruler className="mr-2 h-4 w-4" />
                  Add Measurements
                </Button>
              </div>
            </div>
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

function DetailSection({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3">
          <h4 className="text-sm font-black text-slate-900">{title}</h4>

          {typeof count === "number" && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600">
              {count}
            </span>
          )}
        </div>

        <div className="p-4">{children}</div>
      </CardContent>
    </Card>
  );
}

function EmptyDetailState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
      {message}
    </div>
  );
}

function CustomerOrdersSection({ orders }: { orders: CustomerOrderSummary[] }) {
  return (
    <DetailSection title="Order Details" count={orders.length}>
      {!orders.length ? (
        <EmptyDetailState message="No orders found for this customer." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <Table className="min-w-180">
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="h-10 text-start text-[10px] text-slate-800">
                    Order No
                  </TableHead>

                  <TableHead className="h-10 text-start text-[10px] text-slate-800">
                    Date
                  </TableHead>

                  <TableHead className="h-10 text-start text-[10px] text-slate-800">
                    Promise Date
                  </TableHead>

                  <TableHead className="h-10 text-start text-[10px] text-slate-800">
                    Status
                  </TableHead>

                  <TableHead className="h-10 text-start text-[10px] text-slate-800">
                    Block No
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {orders.map((order) => {
                  const blockNumbers = Array.from(
                    new Set(
                      order.items
                        .map((item) => item.block?.blockNumber)
                        .filter(Boolean),
                    ),
                  );

                  return (
                    <TableRow
                      key={order.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <TableCell className="py-3 text-start align-middle">
                        <p className="whitespace-nowrap text-xs ">
                          {order.orderNumber}
                        </p>
                      </TableCell>

                      <TableCell className="py-3 text-start">
                        <p className="whitespace-nowrap text-sm font-semibold text-slate-600">
                          {formatDate(order.orderDate)}
                        </p>
                      </TableCell>

                      <TableCell className="py-3 text-start">
                        <p className="whitespace-nowrap text-sm font-semibold text-slate-600">
                          {formatDate(order.promisedDate)}
                        </p>
                      </TableCell>

                      <TableCell className="py-3 text-center ">
                        <div className="flex justify-start">
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700">
                            {order.status}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-center align-middle">
                        <p className="mx-auto max-w-55 truncate text-sm font-semibold text-slate-700">
                          {blockNumbers.length ? blockNumbers.join(", ") : "-"}
                        </p>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </DetailSection>
  );
}

function CustomerBlocksSection({
  blocks,
}: {
  blocks: CustomerBlockAssignment[];
}) {
  return (
    <DetailSection title="Block Details" count={blocks.length}>
      {!blocks.length ? (
        <EmptyDetailState message="No blocks assigned to this customer." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="h-10 text-[10px]  text-slate-800">
                  Block No
                </TableHead>

                <TableHead className="h-10 text-[10px]  text-slate-800">
                  Category
                </TableHead>

                <TableHead className="h-10 text-[10px]  text-slate-800">
                  Status
                </TableHead>

                <TableHead className="h-10 text-[10px]  text-slate-800">
                  Default
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {blocks.map((assignment) => (
                <TableRow
                  key={assignment.id}
                  className="transition-colors hover:bg-slate-50"
                >
                  <TableCell className="py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900">
                        {assignment.block.blockNumber}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    <p className="truncate text-sm font-semibold text-slate-700">
                      {assignment.block.category?.name ?? "-"}
                    </p>
                  </TableCell>

                  <TableCell className="py-3">
                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {assignment.block.status}
                    </span>
                  </TableCell>

                  <TableCell className="py-3 text-right">
                    {assignment.isDefault ? (
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                        Default
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">
                        -
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DetailSection>
  );
}

function MeasurementBlockCoverageSection({
  customer,
  categories,
}: {
  customer: CustomerDetails | null;
  categories: Category[];
}) {
  const rows = React.useMemo(() => {
    const byCategory = new Map<
      string,
      {
        categoryId: string;
        categoryName: string;
        block: CustomerBlockAssignment | null;
        measurement: NonNullable<CustomerDetails["measurements"]>[number] | null;
      }
    >();

    categories
      .filter((category) => category.isActive)
      .forEach((category) => {
        byCategory.set(category.id, {
          categoryId: category.id,
          categoryName: category.name,
          block: null,
          measurement: null,
        });
      });

    customer?.customerBlocks?.forEach((assignment) => {
      const category = assignment.block.category;
      if (!category?.id) return;

      const row =
        byCategory.get(category.id) ??
        {
          categoryId: category.id,
          categoryName: category.name,
          block: null,
          measurement: null,
        };

      if (!row.block || assignment.isDefault) {
        row.block = assignment;
      }

      if (assignment.measurement && !row.measurement) {
        row.measurement = {
          ...assignment.measurement,
          categoryId: category.id,
          blockId: assignment.block.id,
          category,
          block: {
            id: assignment.block.id,
            blockNumber: assignment.block.blockNumber,
          },
        };
      }

      byCategory.set(category.id, row);
    });

    customer?.measurements?.forEach((measurement) => {
      const categoryId = measurement.categoryId ?? measurement.category?.id;
      if (!categoryId) return;

      const row =
        byCategory.get(categoryId) ??
        {
          categoryId,
          categoryName: measurement.category?.name ?? "Garment part",
          block: null,
          measurement: null,
        };

      if (
        !row.measurement ||
        new Date(measurement.createdAt).getTime() >
          new Date(row.measurement.createdAt).getTime()
      ) {
        row.measurement = measurement;
      }

      byCategory.set(categoryId, row);
    });

    return Array.from(byCategory.values()).sort((a, b) =>
      a.categoryName.localeCompare(b.categoryName),
    );
  }, [categories, customer]);

  return (
    <DetailSection title="Measurement & Block Coverage" count={rows.length}>
      {!rows.length ? (
        <EmptyDetailState message="No garment categories found for coverage." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <Table className="min-w-180">
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="h-10 text-[10px] text-slate-800">
                    Garment Part
                  </TableHead>
                  <TableHead className="h-10 text-[10px] text-slate-800">
                    Latest Block
                  </TableHead>
                  <TableHead className="h-10 text-[10px] text-slate-800">
                    Latest Measurement
                  </TableHead>
                  <TableHead className="h-10 text-[10px] text-slate-800">
                    Status
                  </TableHead>
                  <TableHead className="h-10 text-right text-[10px] text-slate-800">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((row) => {
                  const hasMeasurement = Boolean(row.measurement);
                  const hasBlock = Boolean(row.block ?? row.measurement?.block);

                  return (
                    <TableRow key={row.categoryId}>
                      <TableCell className="py-3 text-sm font-black text-slate-900">
                        {row.categoryName}
                      </TableCell>
                      <TableCell className="py-3 text-sm font-semibold text-slate-700">
                        {row.block?.block.blockNumber ??
                          row.measurement?.block?.blockNumber ??
                          "-"}
                      </TableCell>
                      <TableCell className="py-3 text-sm font-semibold text-slate-700">
                        {row.measurement?.measurementNumber ?? "-"}
                      </TableCell>
                      <TableCell className="py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-2.5 py-1 text-xs font-bold",
                            hasMeasurement
                              ? getVerificationClasses(
                                  row.measurement?.verificationStatus as
                                    | MeasurementVerificationStatus
                                    | null,
                                )
                              : "border-amber-200 bg-amber-50 text-amber-700",
                          )}
                        >
                          {hasMeasurement
                            ? getVerificationLabel(
                                row.measurement?.verificationStatus as
                                  | MeasurementVerificationStatus
                                  | null,
                              )
                            : hasBlock
                              ? "Block only"
                              : "Missing"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-right text-xs font-bold text-slate-500">
                        {hasMeasurement ? "Edit or new version below" : "Add measurement below"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </DetailSection>
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
  const [isMeasurementAddMode, setIsMeasurementAddMode] = React.useState(false);
  const [createdMeasurement, setCreatedMeasurement] =
    React.useState<Measurement | null>(null);

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

  const {
    data: customerDetails,
    isLoading: isCustomerDetailsLoading,
    isFetching: isCustomerDetailsFetching,
  } = useGetCustomerById(selectedCustomer?.id, isDetailOpen);

  const { data: categories = [] } = useGetCategories();

  const updateMeasurementMutation = useUpdateMeasurement();

  const customerList = customers ?? [];
  const detailedCustomer: CustomerDetails | null =
    customerDetails ??
    (selectedCustomer
      ? {
          id: selectedCustomer.id,
          tenantId: "",
          fullName: selectedCustomer.fullName,
          phoneNumber: selectedCustomer.phoneNumber,
          alternatePhone: selectedCustomer.alternatePhone,
          hospitalName: selectedCustomer.hospitalName ?? null,
          town: selectedCustomer.town,
          address: selectedCustomer.address ?? null,
          notes: null,
          createdAt: "",
          updatedAt: "",
          customerBlocks: [],
          orders: [],
          measurements: [],
          _count: {
            customerBlocks: 0,
            orders: 0,
            measurements: 0,
          },
        }
      : null);

  const activeMeasurement = createdMeasurement ?? latestMeasurement;

  const measurementItems = React.useMemo(
    () => getMeasurementItems(activeMeasurement),
    [activeMeasurement],
  );

  const newMeasurementInitialValues = React.useMemo(
    () => getMeasurementValueMap(activeMeasurement),
    [activeMeasurement],
  );

  const showCustomerList = trimmedSearch.length > 0 && !selectedCustomer;

  React.useEffect(() => {
    if (!activeMeasurement?.values?.length) {
      setEditableMeasurementValues({});
      setEditableMeasurementNotes({});
      setMeasurementChangeNote("");
      setIsMeasurementEditMode(false);
      return;
    }

    const nextValues: Record<string, string> = {};
    const nextNotes: Record<string, string> = {};

    activeMeasurement.values.forEach((item) => {
      nextValues[item.fieldId] =
        item.value ??
        (item.numericValue != null ? String(item.numericValue) : "");
      nextNotes[item.fieldId] = item.note ?? "";
    });

    setEditableMeasurementValues(nextValues);
    setEditableMeasurementNotes(nextNotes);
    setMeasurementChangeNote("");
    setIsMeasurementEditMode(false);
    setIsMeasurementAddMode(false);
  }, [activeMeasurement?.id]);

  const handleClear = () => {
    setSearch("");
    setSelectedCustomer(null);
    setIsDetailOpen(false);
    setIsMeasurementEditMode(false);
    setIsMeasurementAddMode(false);
    setCreatedMeasurement(null);
  };

  const handleSelectCustomer = (customer: CustomerLookupItem) => {
    setSelectedCustomer(customer);
    setSearch(customer.fullName);
    setIsMeasurementEditMode(false);
    setIsMeasurementAddMode(false);
    setCreatedMeasurement(null);
  };

  const handleCancelMeasurementEdit = () => {
    const nextValues: Record<string, string> = {};
    const nextNotes: Record<string, string> = {};

    activeMeasurement?.values?.forEach((item) => {
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
    if (!activeMeasurement) return;

    const values = activeMeasurement.values.map((item) => ({
      fieldId: item.fieldId,
      value: editableMeasurementValues[item.fieldId]?.trim() || null,
      note: editableMeasurementNotes[item.fieldId]?.trim() || null,
    }));

    const measurement = await updateMeasurementMutation.mutateAsync({
      measurementId: activeMeasurement.id,
      verificationStatus: "NEEDS_UPDATE",
      verificationNote:
        measurementChangeNote.trim() ||
        "Measurement updated during customer confirmation.",
      notes: activeMeasurement.notes,
      values,
    });

    setCreatedMeasurement(measurement);
    setIsMeasurementEditMode(false);
  };

  const handleStartOrder = () => {
    if (!selectedCustomer) return;

    navigate({
      to: "/app/create-order-page",
      search: {
        customerId: selectedCustomer.id,
      },
    });
  };

  const canAddMeasurement = Boolean(selectedCustomer);

  return (
    <>
      <Card className="relative z-30 overflow-visible rounded-lg border-border bg-white">
        <CardContent className="p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_220px] sm:items-end">
            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Find Customer
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Search by name, phone number, or town.
                  </p>
                </div>

                {selectedCustomer && (
                  <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
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
                    "h-12 w-full rounded-lg bg-white pl-11 pr-11 text-base font-semibold text-slate-900",
                    "placeholder:text-sm placeholder:font-medium placeholder:text-slate-400",
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
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-lg border border-border bg-white shadow-xl">
                    {isCustomersLoading ? (
                      <div className="flex items-center gap-3 px-4 py-4 text-sm font-medium text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching customers...
                      </div>
                    ) : customerList.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
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
                            className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-slate-50"
                          >
                            <CustomerInitial name={customer.fullName} />

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-900">
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
                "h-12 w-full rounded-lg px-6 text-sm font-semibold shadow-sm",
                "disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-100",
              )}
              disabled={!selectedCustomer}
              onClick={() => setIsDetailOpen(true)}
            >
              Customer Workspace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="flex max-h-[92vh] gap-0 flex-col overflow-hidden rounded-lg border-border p-0 sm:max-w-5xl">
          <DialogHeader className="shrink-0 border-b border-border bg-white px-5 py-4">
            <DialogTitle className="text-base font-semibold text-slate-900">
              Customer Order Workspace
            </DialogTitle>
          </DialogHeader>

          {!selectedCustomer ? null : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                <div className="space-y-5">
                  {isCustomerDetailsLoading && (
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading customer details...
                    </div>
                  )}

                  <Card className="overflow-hidden rounded-lg border-slate-200 shadow-sm">
                    <CardContent className="p-0">
                      <div className="border-b border-slate-100 bg-white p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                              Customer
                            </p>

                            <h3 className="mt-1 truncate text-xl font-black text-slate-900">
                              {detailedCustomer?.fullName ??
                                selectedCustomer.fullName}
                            </h3>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-slate-500">
                              {detailedCustomer?.phoneNumber && (
                                <span className="inline-flex items-center gap-1.5">
                                  <Phone className="h-4 w-4 text-slate-400" />
                                  {detailedCustomer.phoneNumber}
                                </span>
                              )}

                              {detailedCustomer?.town && (
                                <span className="inline-flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4 text-slate-400" />
                                  {detailedCustomer.town}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 gap-2">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-center">
                              <p className="text-base font-black text-slate-900">
                                {detailedCustomer?._count.customerBlocks ?? 0}
                              </p>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Blocks
                              </p>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-center">
                              <p className="text-base font-black text-slate-900">
                                {detailedCustomer?._count.orders ?? 0}
                              </p>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Orders
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {detailedCustomer?.hospitalName && (
                        <div className="bg-slate-50 px-4 py-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                            Hospital / Workplace
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {detailedCustomer.hospitalName}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {isCustomerDetailsFetching && !isCustomerDetailsLoading && (
                    <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Updating details
                    </div>
                  )}

                  <MeasurementBlockCoverageSection
                    customer={detailedCustomer}
                    categories={categories}
                  />

                  <LatestMeasurementSection
                    latestMeasurement={activeMeasurement}
                    measurementItems={measurementItems}
                    isLoading={isMeasurementsLoading}
                    isFetching={isMeasurementsFetching}
                    isAddMode={isMeasurementAddMode}
                    isEditMode={isMeasurementEditMode}
                    editableValues={editableMeasurementValues}
                    editableNotes={editableMeasurementNotes}
                    changeNote={measurementChangeNote}
                    isSaving={updateMeasurementMutation.isPending}
                    canAddMeasurement={canAddMeasurement}
                    addMeasurementForm={
                      selectedCustomer ? (
                        <AddMeasurementForm
                          customerId={selectedCustomer.id}
                          blocks={detailedCustomer?.customerBlocks ?? []}
                          categories={categories}
                          initialCategoryId={activeMeasurement?.categoryId}
                          initialBlockId={
                            activeMeasurement?.blockId ?? undefined
                          }
                          initialValues={
                            activeMeasurement
                              ? newMeasurementInitialValues
                              : undefined
                          }
                          initialMeasurementNote={
                            activeMeasurement
                              ? "New measurement version created because the previous measurement changed heavily."
                              : undefined
                          }
                          initialBlock={activeMeasurement?.block}
                          initialCategory={activeMeasurement?.category}
                          previousMeasurementId={activeMeasurement?.id}
                          previousVersionNo={activeMeasurement?.versionNo}
                          isNewVersion={Boolean(activeMeasurement)}
                          onSaved={(measurement) => {
                            setCreatedMeasurement(measurement);
                            setIsMeasurementAddMode(false);
                          }}
                          onCancel={() => setIsMeasurementAddMode(false)}
                        />
                      ) : null
                    }
                    onAdd={() => {
                      setIsMeasurementEditMode(false);
                      setIsMeasurementAddMode(true);
                    }}
                    onCancelAdd={() => setIsMeasurementAddMode(false)}
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

                  <CustomerOrdersSection
                    orders={detailedCustomer?.orders ?? []}
                  />

                  <CustomerBlocksSection
                    blocks={detailedCustomer?.customerBlocks ?? []}
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
                      isMeasurementAddMode ||
                      isMeasurementsLoading ||
                      updateMeasurementMutation.isPending ||
                      !selectedCustomer
                    }
                    onClick={handleStartOrder}
                  >
                    Start Order
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
