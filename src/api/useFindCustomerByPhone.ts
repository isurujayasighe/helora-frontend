import { useMutation } from "@tanstack/react-query";
import { covalentHubClient } from "@/services/clients/covalent.client";

export interface CustomerBlockCategory {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerBlock {
  id: string;
  tenantId: string;
  customerId: string;
  categoryId: string;
  blockNumber: string;
  readyMadeSize?: string | null;
  sizeLabel?: string | null;
  fitNotes?: string | null;
  versionNo?: number;
  previousBlockId?: string | null;
  description?: string | null;
  status?: string;
  isDefault?: boolean;
  lastUsedAt?: string | null;
  remarks?: string | null;
  legacyId?: number | null;
  createdById?: string;
  updatedById?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: CustomerBlockCategory | null;
}

export interface CustomerByPhone {
  id: string;
  tenantId: string;
  fullName: string;
  phoneNumber: string;
  alternatePhone?: string | null;
  town?: string | null;
  address?: string | null;
  notes?: string | null;
  createdById?: string;
  updatedById?: string;
  createdAt?: string;
  updatedAt?: string;
  blocks: CustomerBlock[];
  _count?: {
    blocks: number;
    orders: number;
  };
}

interface FindCustomerByPhoneApiResponse {
  success: boolean;
  data: CustomerByPhone | null;
}

const findCustomerByPhone = async (
  phoneNumber: string
): Promise<FindCustomerByPhoneApiResponse | null> => {
  const response = await covalentHubClient.get<FindCustomerByPhoneApiResponse>(
    "/customers/by-phone",
    {
      params: { phoneNumber },
    }
  );

  return response.data;
};

export const useFindCustomerByPhoneMutation = () => {
  return useMutation({
    mutationFn: findCustomerByPhone,
  });
};