import { covalentHubClient } from "@/services/clients/covalent.client";
import { useQuery } from "@tanstack/react-query";

export type MeasurementVerificationStatus =
  | "PENDING"
  | "VERIFIED_OK"
  | "NEEDS_UPDATE"
  | "REJECTED";

export type MeasurementInputType =
  | "TEXT"
  | "TEXTAREA"
  | "NUMBER"
  | "INTEGER"
  | "DECIMAL"
  | "SELECT"
  | string;

export type MeasurementField = {
  id: string;
  tenantId?: string;
  categoryId?: string;
  code: string;
  label: string;
  inputType: MeasurementInputType;
  unit: string | null;
  sortOrder: number;
  isRequired: boolean;
  isActive?: boolean;
  helpText?: string | null;
  options?: unknown | null;
  createdAt?: string;
  updatedAt?: string;
};

export type MeasurementValue = {
  id: string;
  measurementId: string;
  fieldId: string;
  value: string | null;
  numericValue: string | number | null;
  note: string | null;
  createdAt?: string;
  updatedAt?: string;
  field: MeasurementField;
};

export type MeasurementCustomer = {
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
  _count?: {
    customerBlocks: number;
    orders: number;
  };
};

export type MeasurementCategory = {
  id: string;
  tenantId?: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type MeasurementBlock = {
  id: string;
  tenantId?: string;
  categoryId?: string;
  blockNumber: string;
  readyMadeSize: string | null;
  sizeLabel: string | null;
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
  category?: MeasurementCategory;
};

export type MeasurementVerifiedBy = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
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
  verifiedById?: string | null;
  verificationNote: string | null;

  isActive: boolean;
  versionNo: number;
  previousMeasurementId?: string | null;
  notes: string | null;

  createdById?: string;
  updatedById?: string;
  createdAt: string;
  updatedAt: string;

  customer?: MeasurementCustomer;
  block?: MeasurementBlock | null;
  category?: MeasurementCategory;
  verifiedBy?: MeasurementVerifiedBy | null;

  values: MeasurementValue[];

  previousMeasurement?: Measurement | null;
  nextMeasurements?: Measurement[];

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

  detail: (measurementId?: string) =>
    [...measurementKeys.all, "detail", measurementId] as const,
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
      const response = await covalentHubClient.get<
        ApiResponse<Measurement | null>
      >("/measurements/latest", {
        params: {
          customerId,
          blockId,
          categoryId,
        },
      });

      return response.data.data;
    },

    enabled: enabled && Boolean(customerId),
  });
}