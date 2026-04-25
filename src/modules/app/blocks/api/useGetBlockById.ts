import { useQuery } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";

export type BlockDetailsCustomer = {
  id: string;
  tenantId: string;
  fullName: string;
  phoneNumber: string | null;
  alternatePhone: string | null;
  town: string | null;
  address: string | null;
  notes: string | null;
  createdById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
};

export type BlockDetailsCategory = {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BlockDetailsPreviousBlock = {
  id: string;
  blockNumber: string;
  versionNo: number;
} | null;

export type BlockDetailsNextVersion = {
  id: string;
  blockNumber: string;
  versionNo: number;
  createdAt: string;
};

export type BlockDetailsCustomerAssignment = {
  customerId: string;
  blockId: string;
  isDefault: boolean;
  assignedAt: string;
  assignedById: string | null;
  customer: BlockDetailsCustomer;
};

export type BlockDetailsOrderItem = {
  id: string;
  orderId: string;
  categoryId: string;
  blockId: string | null;
  itemDescription: string | null;
  quantity: number;
  unitPrice: string | number | null;
  lineTotal: string | number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    orderDate: string;
  };
  category?: {
    id: string;
    name: string;
    description: string | null;
  };
};

export type BlockDetails = {
  id: string;
  tenantId: string;
  categoryId: string;
  blockNumber: string;
  readyMadeSize: string | null;
  sizeLabel: string | null;
  fitNotes: string | null;
  versionNo: number;
  previousBlockId: string | null;
  description: string | null;
  status: string;
  lastUsedAt: string | null;
  remarks: string | null;
  legacyId: number | null;
  createdById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
  category: BlockDetailsCategory;
  previousBlock: BlockDetailsPreviousBlock;
  nextVersions: BlockDetailsNextVersion[];
  customerBlocks: BlockDetailsCustomerAssignment[];
  orderItems: BlockDetailsOrderItem[];
  _count: {
    orderItems: number;
  };
};

interface GetBlockByIdApiResponse {
  success: boolean;
  data: BlockDetails;
}

export const blockDetailsQueryKeys = {
  all: ["block-details"] as const,
  detail: (blockId?: string | null) =>
    [...blockDetailsQueryKeys.all, blockId] as const,
};

const getBlockById = async (
  blockId: string
): Promise<GetBlockByIdApiResponse> => {
  const response = await covalentHubClient.get<GetBlockByIdApiResponse>(
    `/blocks/${blockId}`
  );

  return response.data;
};

export const useGetBlockById = (
  blockId?: string | null,
  enabled = true
) => {
  return useQuery({
    queryKey: blockDetailsQueryKeys.detail(blockId),
    queryFn: () => getBlockById(blockId!),
    enabled: Boolean(blockId) && enabled,
  });
};