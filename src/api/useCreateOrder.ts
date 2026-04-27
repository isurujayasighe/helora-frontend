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

export type CreateOrderPayload = {
  customerId: string;
  groupOrderId?: string;
  orderNumber?: string;
  orderDate?: string;
  promisedDate?: string;
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
  items: Array<{
    categoryId: string;
    blockId?: string;
    measurementId?: string;
    itemDescription: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    notes?: string;
    tailorNote?: string;
    status?: OrderItemStatus;
  }>;
};

type CreateOrderResponse = {
  success: boolean;
  message?: string;
  data: unknown;
};

const cleanObject = <T extends Record<string, unknown>>(value: T) => {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, item]) => item !== undefined && item !== null && item !== ""
    )
  ) as T;
};

const createOrder = async (payload: CreateOrderPayload) => {
  const response = await covalentHubClient.post<CreateOrderResponse>(
    "/orders",
    {
      ...cleanObject(payload),
      items: payload.items.map((item) => cleanObject(item)),
    }
  );

  return response.data;
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["group-orders"] });
    },
  });
};