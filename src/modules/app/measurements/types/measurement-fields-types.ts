export type MeasurementInputType =
  | "TEXT"
  | "NUMBER"
  | "DECIMAL"
  | "SELECT"
  | "MULTI_SELECT"
  | "BOOLEAN";

export interface MeasurementCategory {
  id: string;
  name: string;
  code?: string | null;
}

export interface MeasurementField {
  id: string;
  tenantId: string;
  categoryId: string;

  code: string;
  label: string;
  inputType: MeasurementInputType;
  unit?: string | null;
  sortOrder: number;

  isRequired: boolean;
  isActive: boolean;

  helpText?: string | null;
  options?: string[] | null;

  createdAt: string;
  updatedAt: string;

  category?: MeasurementCategory | null;
}

export interface MeasurementFieldsPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface MeasurementFieldsResponse {
  items: MeasurementField[];
  pagination: MeasurementFieldsPagination;
}

export interface MeasurementFieldListParams {
  pageIndex: number;
  pageSize: number;
  search?: string;
  categoryId?: string;
  inputType?: MeasurementInputType;
  isActive?: boolean;
}

export interface CreateMeasurementFieldPayload {
  categoryId: string;
  code: string;
  label: string;
  inputType: MeasurementInputType;
  unit?: string;
  sortOrder: number;
  isRequired: boolean;
  isActive: boolean;
  helpText?: string;
  options?: string[];
}

export type UpdateMeasurementFieldPayload = CreateMeasurementFieldPayload;