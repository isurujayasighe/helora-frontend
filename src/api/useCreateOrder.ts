import { useMutation, useQueryClient } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CUTTING"
  | "SEWING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export type OrderSource =
  | "DREZAURA"
  | "PHYSICAL_SHOP"
  | "PHONE_CALL"
  | "WHATSAPP"
  | "ONLINE";

export type PaymentStatus =
  | "UNPAID"
  | "ADVANCE_PAID"
  | "PARTIALLY_PAID"
  | "PAID"
  | "REFUNDED";

export type OrderPaymentMode =
  | "CASH"
  | "ONLINE_TRANSFER"
  | "BANK_DEPOSIT"
  | "CARD"
  | "MIXED";

export type OrderItemStatus =
  | "PENDING"
  | "CUTTING"
  | "SEWING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export type OrderItemMeasurements = Record<
  string,
  string | number | null | undefined
>;

export type CreateOrderItemPayload = {
  categoryId: string;

  /**
   * Existing block. Optional because new order can be created
   * with measurements first, then block can be linked later.
   */
  blockId?: string;

  /**
   * Existing measurement. Optional because backend can create
   * a new measurement from `measurements` during order creation.
   */
  measurementId?: string;

  itemDescription: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;

  notes?: string;
  tailorNote?: string;
  status?: OrderItemStatus;

  /**
   * New measurement values collected while creating the order.
   * Example:
   * {
   *   shoulder: "14.5",
   *   chest: "34",
   *   waist: "39"
   * }
   */
  measurements?: OrderItemMeasurements;

  /**
   * Note for the measurement created during order creation.
   */
  measurementNote?: string;
};

export type CreateOrderPayload = {
  customerId: string;
  groupOrderId?: string;

  orderNumber?: string;
  orderDate?: string;
  promisedDate?: string;
  completedAt?: string;
  deliveredAt?: string;

  status?: OrderStatus;
  orderSource?: OrderSource;
  paymentStatus?: PaymentStatus;
  paymentMode?: OrderPaymentMode;

  hospitalName?: string;
  town?: string;
  customerAddress?: string;

  totalQty?: number;
  totalAmount?: number;
  advanceAmount?: number;
  balanceAmount?: number;
  courierCharges?: number;

  notes?: string;
  specialNotes?: string;

  items: CreateOrderItemPayload[];
};

export type CreatedOrder = unknown;

export type CreateOrderResponse = {
  success: boolean;
  message?: string;
  data: CreatedOrder;
  error?: string | null;
};

const isEmptyValue = (value: unknown) => {
  return value === undefined || value === null || value === "";
};

const cleanObject = <T extends Record<string, unknown>>(value: T) => {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => !isEmptyValue(item)),
  ) as Partial<T>;
};

const cleanMeasurements = (measurements?: OrderItemMeasurements) => {
  if (!measurements) return undefined;

  const cleaned = Object.fromEntries(
    Object.entries(measurements).filter(([, value]) => !isEmptyValue(value)),
  );

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
};

const cleanOrderItem = (item: CreateOrderItemPayload) => {
  const cleanedMeasurements = cleanMeasurements(item.measurements);

  return cleanObject({
    ...item,
    measurements: cleanedMeasurements,
  });
};

const createOrder = async (payload: CreateOrderPayload) => {
  const cleanedPayload = cleanObject({
    ...payload,
    items: payload.items.map(cleanOrderItem),
  });

  const response = await covalentHubClient.post<CreateOrderResponse>(
    "/orders",
    cleanedPayload,
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create order");
  }

  return response.data;
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["group-orders"] });
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["blocks"] });
    },
  });
};