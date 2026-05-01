import { useQuery } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";
import type { GroupOrder } from "../types/group-orders.types";

export type GroupOrderDetailCustomer = {
  id: string;
  tenantId?: string;
  fullName: string;
  phoneNumber: string | null;
  alternatePhone?: string | null;
  hospitalName?: string | null;
  town: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type GroupOrderDetailCategory = {
  id: string;
  tenantId?: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type GroupOrderDetailBlock = {
  id: string;
  tenantId?: string;
  categoryId: string;
  blockNumber: string;
  readyMadeSize?: string | null;
  sizeLabel?: string | null;
  fitNotes?: string | null;
  versionNo?: number;
  previousBlockId?: string | null;
  description?: string | null;
  status?: string;
  lastUsedAt?: string | null;
  remarks?: string | null;
  legacyId?: number | null;
  createdAt?: string;
  updatedAt?: string;
  category?: GroupOrderDetailCategory;
};

export type GroupOrderMeasurementField = {
  id: string;
  tenantId?: string;
  categoryId: string;
  code: string;
  label: string;
  inputType: string;
  unit: string | null;
  sortOrder: number;
  isRequired: boolean;
  isActive: boolean;
  helpText?: string | null;
  options?: unknown | null;
  createdAt?: string;
  updatedAt?: string;
};

export type GroupOrderMeasurementValue = {
  id: string;
  measurementId: string;
  fieldId: string;
  value: string;
  numericValue: string | number | null;
  note: string | null;
  createdAt?: string;
  updatedAt?: string;
  field?: GroupOrderMeasurementField;
};

export type GroupOrderDetailMeasurement = {
  id: string;
  tenantId?: string;
  customerId: string;
  blockId: string;
  categoryId: string;
  measurementNumber: string;
  verificationStatus: string;
  verifiedAt: string | null;
  verifiedById: string | null;
  verificationNote: string | null;
  isActive: boolean;
  versionNo: number;
  previousMeasurementId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  values: GroupOrderMeasurementValue[];
};

export type GroupOrderDetailOrderItem = {
  id: string;
  orderId: string;
  categoryId: string;
  blockId: string | null;
  measurementId: string | null;
  itemDescription: string;
  quantity: number;
  unitPrice: string | number;
  lineTotal: string | number;
  notes: string | null;
  tailorNote: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  category?: GroupOrderDetailCategory;
  block?: GroupOrderDetailBlock | null;
  measurement?: GroupOrderDetailMeasurement | null;
};

export type GroupOrderDetailOrder = {
  id: string;
  tenantId?: string;
  orderNumber: string;
  customerId?: string;
  groupOrderId?: string;
  orderType?: string;
  hospitalName?: string | null;
  town?: string | null;
  customerAddress?: string | null;
  status: string;
  orderSource?: string;
  paymentStatus: string;
  paymentMode?: string | null;
  totalQty: number;
  totalAmount: string | number;
  advanceAmount: string | number;
  balanceAmount: string | number;
  courierCharges?: string | number;
  orderDate: string;
  promisedDate: string | null;
  completedAt?: string | null;
  deliveredAt?: string | null;
  notes?: string | null;
  specialNotes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  customer?: GroupOrderDetailCustomer;
  payments?: unknown[];
  items?: GroupOrderDetailOrderItem[];
};

export type GroupOrderDetails = GroupOrder & {
  coordinatorCustomer?: GroupOrderDetailCustomer;
  orders?: GroupOrderDetailOrder[];
  payments?: unknown[];
  _count?: {
    orders?: number;
    payments?: number;
  };
};

type GetGroupOrderByIdResponse = {
  success: boolean;
  data: GroupOrderDetails;
};

const getGroupOrderById = async (
  groupOrderId: string
): Promise<GetGroupOrderByIdResponse> => {
  const response = await covalentHubClient.get<GetGroupOrderByIdResponse>(
    `/group-orders/${groupOrderId}`
  );

  return response.data;
};

export const groupOrderDetailsQueryKeys = {
  all: ["group-order-details"] as const,
  detail: (groupOrderId: string) =>
    [...groupOrderDetailsQueryKeys.all, groupOrderId] as const,
};

export const useGetGroupOrderById = (groupOrderId: string) => {
  return useQuery({
    queryKey: groupOrderDetailsQueryKeys.detail(groupOrderId),
    queryFn: () => getGroupOrderById(groupOrderId),
    enabled: Boolean(groupOrderId),
  });
};