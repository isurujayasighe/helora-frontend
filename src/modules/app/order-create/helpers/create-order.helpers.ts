import type { MeasurementFieldConfig } from "@/components/layout/components/measurements-fields";
import type { CreateOrderFormInput } from "../types/create-order.types";

export function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysInputValue(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function toIsoDateString(dateValue?: string) {
  if (!dateValue) return undefined;
  return new Date(`${dateValue}T00:00:00`).toISOString();
}

export function toMeasurementStringValue(
  value: string | null | undefined,
  numericValue: string | number | null | undefined,
) {
  return value ?? (numericValue != null ? String(numericValue) : "");
}

export function buildMeasurementMap(
  values:
    | Array<{
        value: string | null;
        numericValue: string | number | null;
        field: { code: string };
      }>
    | undefined,
) {
  if (!values?.length) return {};

  return values.reduce<Record<string, string>>((result, item) => {
    result[item.field.code] = toMeasurementStringValue(
      item.value,
      item.numericValue,
    );

    return result;
  }, {});
}

export function buildMeasurementFieldsFromApi(
  values:
    | Array<{
        field: {
          code: string;
          label: string;
          unit: string | null;
          sortOrder: number;
        };
      }>
    | undefined,
): MeasurementFieldConfig[] {
  if (!values?.length) return [];

  return [...values]
    .sort((a, b) => a.field.sortOrder - b.field.sortOrder)
    .map((item) => ({
      key: item.field.code,
      label: item.field.label,
      unit: item.field.unit ?? undefined,
    }));
}

export function hasMeasurementValues(values?: Record<string, unknown>) {
  if (!values) return false;

  return Object.values(values).some(
    (value) => value !== undefined && value !== null && value !== "",
  );
}

export const buildInitialItem = (): CreateOrderFormInput["items"][number] => ({
  categoryId: "",
  blockId: "",
  measurementId: "",
  itemDescription: "",
  quantity: 1,
  unitPrice: 0,
  lineTotal: 0,
  notes: "",
  tailorNote: "",
  status: "PENDING",
  blockMode: "measurement-only",
  measurements: {},
  measurementNote: "Measurements taken while placing order.",
});

export const buildInitialValues = (): CreateOrderFormInput => ({
  phoneNumber: "",
  customerMode: "existing",
  customerId: "",
  customerName: "",
  customerTown: "",
  customerAddress: "",
  customerNotes: "",
  hospitalName: "",
  groupOrderId: "",
  orderNumber: "",
  orderDate: todayInputValue(),
  promisedDate: addDaysInputValue(7),
  completedAt: "",
  deliveredAt: "",
  status: "PENDING",
  orderSource: "PHYSICAL_SHOP",
  paymentStatus: "UNPAID",
  paymentMode: "CASH",
  totalQty: 1,
  totalAmount: 0,
  advanceAmount: 0,
  balanceAmount: 0,
  courierCharges: 0,
  notes: "",
  specialNotes: "",
  items: [buildInitialItem()],
});

