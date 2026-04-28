import { covalentHubClient } from "@/services/clients/covalent.client";
import { useQuery } from "@tanstack/react-query";

export type MeasurementVerificationStatus =
  | "PENDING"
  | "VERIFIED_OK"
  | "NEEDS_UPDATE"
  | "REJECTED";

export type MeasurementValue = {
  id: string;
  measurementId: string;
  fieldId: string;
  value: string | null;
  numericValue: string | null;
  note: string | null;
  field: {
    id: string;
    code: string;
    label: string;
    inputType: string;
    unit: string | null;
    sortOrder: number;
    isRequired: boolean;
  };
};

export type Measurement = {
  id: string;
  tenantId: string;
  customerId: string;
  blockId: string | null;
  categoryId: string;
  measurementNumber: string;
  verificationStatus: MeasurementVerificationStatus;
  verifiedAt: string | null;
  verificationNote: string | null;
  isActive: boolean;
  versionNo: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;

  customer?: {
    id: string;
    fullName: string;
    phoneNumber: string | null;
    town: string | null;
    hospitalName?: string | null;
  };

  block?: {
    id: string;
    blockNumber: string;
    readyMadeSize: string | null;
    sizeLabel: string | null;
  } | null;

  category?: {
    id: string;
    name: string;
  };

  verifiedBy?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;

  values: MeasurementValue[];

  _count?: {
    orderItems: number;
  };
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type UseGetLatestMeasurementParams = {
  customerId?: string;
  blockId?: string;
  categoryId?: string;
  enabled?: boolean;
};

export const measurementKeys = {
  all: ["measurements"] as const,
  latest: (params: {
    customerId?: string;
    blockId?: string;
    categoryId?: string;
  }) => [...measurementKeys.all, "latest", params] as const,
  customerList: (customerId?: string) =>
    [...measurementKeys.all, "customer-list", customerId] as const,
};

export function useGetLatestMeasurement({
  customerId,
  blockId,
  categoryId,
  enabled = true,
}: UseGetLatestMeasurementParams) {
  return useQuery({
    queryKey: measurementKeys.latest({
      customerId,
      blockId,
      categoryId,
    }),
    queryFn: async () => {
      const response = await covalentHubClient.get<ApiResponse<Measurement | null>>(
        "/measurements/latest",
        {
          params: {
            customerId,
            blockId,
            categoryId,
          },
        }
      );

      return response.data.data;
    },
    enabled: enabled && Boolean(customerId),
  });
}