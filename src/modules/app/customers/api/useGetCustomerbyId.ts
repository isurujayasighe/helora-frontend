// src/modules/app/customers/api/useGetCustomerById.ts

import { useQuery } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";

/* ------------------------------------------------------------------ */
/* Shared Types                                                       */
/* ------------------------------------------------------------------ */

export type CustomerMeasurementField = {
  id: string;
  code: string;
  label: string;
  unit: string | null;
  sortOrder: number;
  inputType: string;
};

export type CustomerMeasurementValue = {
  id: string;
  value: string | null;
  numericValue: string | number | null;
  note: string | null;
  field: CustomerMeasurementField;
};

export type CustomerMeasurementSummary = {
  id: string;
  measurementNumber: string;
  verificationStatus: string;
  verifiedAt: string | null;
  verificationNote: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  values: CustomerMeasurementValue[];
};

export type CustomerCategorySummary = {
  id: string;
  name: string;
  description?: string | null;
};

/* ------------------------------------------------------------------ */
/* Block Types                                                        */
/* ------------------------------------------------------------------ */

export type CustomerBlockDetails = {
  id: string;
  blockNumber: string;
  readyMadeSize: string | null;
  sizeLabel: string | null;
  fitNotes: string | null;
  description: string | null;
  status: string;
  lastUsedAt: string | null;
  remarks: string | null;

  category: CustomerCategorySummary | null;

  _count?: {
    orderItems: number;
  };
};

export type CustomerBlockAssignment = {
  id: string;
  isDefault: boolean;
  assignedAt: string;

  block: CustomerBlockDetails;
  measurement: CustomerMeasurementSummary | null;
};

/* ------------------------------------------------------------------ */
/* Order Types                                                        */
/* ------------------------------------------------------------------ */

export type CustomerOrderItemSummary = {
  id: string;
  itemDescription: string | null;
  quantity: number;
  unitPrice: string | number | null;
  lineTotal: string | number | null;
  status: string;

  category: CustomerCategorySummary | null;
};

export type CustomerOrderSummary = {
  id: string;
  orderNumber: string;
  orderDate: string;
  promisedDate: string | null;
  status: string;
  paymentStatus: string;
  orderSource:
    | "DREZAURA"
    | "PHYSICAL_SHOP"
    | "PHONE_CALL"
    | "WHATSAPP"
    | "ONLINE"
    | string;

  totalQty: number;
  totalAmount: string | number | null;
  advanceAmount: string | number | null;
  balanceAmount: string | number | null;
  courierCharges: string | number | null;
  createdAt: string;

  items: CustomerOrderItemSummary[];
};

/* ------------------------------------------------------------------ */
/* Main Customer Details Type                                          */
/* ------------------------------------------------------------------ */

export type CustomerDetails = {
  id: string;
  tenantId: string;
  fullName: string;
  phoneNumber: string | null;
  alternatePhone: string | null;
  hospitalName: string | null;
  town: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;

  customerBlocks: CustomerBlockAssignment[];
  orders: CustomerOrderSummary[];

  _count: {
    customerBlocks: number;
    orders: number;
    measurements: number;
  };
};

type GetCustomerByIdResponse = {
  success: boolean;
  data: CustomerDetails;
};

/* ------------------------------------------------------------------ */
/* Query Keys                                                         */
/* ------------------------------------------------------------------ */

export const customerDetailsQueryKeys = {
  all: ["customer-details"] as const,

  detail: (customerId?: string | null) =>
    [...customerDetailsQueryKeys.all, "detail", customerId ?? ""] as const,
};

/* ------------------------------------------------------------------ */
/* API                                                                */
/* ------------------------------------------------------------------ */

const getCustomerById = async (
  customerId: string,
): Promise<CustomerDetails> => {
  const response = await covalentHubClient.get<GetCustomerByIdResponse>(
    `/customers/${customerId}`,
  );

  return response.data.data;
};

/* ------------------------------------------------------------------ */
/* Hook                                                               */
/* ------------------------------------------------------------------ */

export const useGetCustomerById = (
  customerId?: string | null,
  enabled = true,
) => {
  return useQuery({
    queryKey: customerDetailsQueryKeys.detail(customerId),
    queryFn: () => getCustomerById(customerId!),
    enabled: Boolean(customerId) && enabled,
    staleTime: 30_000,
  });
};