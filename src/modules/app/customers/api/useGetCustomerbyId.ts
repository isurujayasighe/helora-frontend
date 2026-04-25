import { useQuery } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";

export type CustomerBlock = {
  id: string;
  blockNumber: string;
  readyMadeSize: string | null;
  sizeLabel: string | null;
  fitNotes: string | null;
  versionNo: number;
  description: string | null;
  status: string;
  isDefault: boolean;
  lastUsedAt: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    description: string | null;
  };
};

export type CustomerOrderItem = {
  id: string;
  itemDescription: string | null;
  quantity: number;
  unitPrice: string | number | null;
  lineTotal: string | number | null;
  notes: string | null;
  createdAt: string;
  category?: {
    id: string;
    name: string;
    description: string | null;
  };
  block?: {
    id: string;
    blockNumber: string;
    readyMadeSize: string | null;
    sizeLabel: string | null;
    fitNotes: string | null;
    description: string | null;
    status: string;
  } | null;
};

export type CustomerOrder = {
  id: string;
  orderNumber: string;
  orderDate: string;
  promisedDate: string | null;
  status: string;
  orderSource: "DREZAURA" | "PHYSICAL_SHOP";
  notes: string | null;
  totalAmount: string | number | null;
  advanceAmount: string | number | null;
  balanceAmount: string | number | null;
  createdAt: string;
  updatedAt: string;
  items: CustomerOrderItem[];
};

export type CustomerDetails = {
  id: string;
  tenantId: string;
  fullName: string;
  phoneNumber: string;
  alternatePhone: string | null;
  town: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  blocks: CustomerBlock[];
  orders: CustomerOrder[];
  _count: {
    blocks: number;
    orders: number;
  };
};

type GetCustomerByIdResponse = {
  success: boolean;
  data: CustomerDetails;
};

export const customerDetailsQueryKeys = {
  all: ["customer-details"] as const,
  detail: (customerId?: string | null) =>
    [...customerDetailsQueryKeys.all, customerId] as const,
};

const getCustomerById = async (
  customerId: string
): Promise<GetCustomerByIdResponse> => {
  const response = await covalentHubClient.get<GetCustomerByIdResponse>(
    `/customers/${customerId}`
  );

  return response.data;
};

export const useGetCustomerById = (
  customerId?: string | null,
  enabled = true
) => {
  return useQuery({
    queryKey: customerDetailsQueryKeys.detail(customerId),
    queryFn: () => getCustomerById(customerId!),
    enabled: Boolean(customerId) && enabled,
  });
};