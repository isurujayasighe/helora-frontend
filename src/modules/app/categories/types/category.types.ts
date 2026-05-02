export interface Category {
  id: string;
  tenantId?: string;

  name: string;
  description?: string | null;

  isActive?: boolean;

  createdAt: string;
  updatedAt: string;

  _count?: {
    blocks?: number;
    orderItems?: number;
    measurementFields?: number;
  };
}

export interface CategoryPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CategoriesResponse {
  items: Category[];
  pagination: CategoryPagination;
}

export interface CategoryListParams {
  pageIndex: number;
  pageSize: number;
  search?: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export type UpdateCategoryPayload = CreateCategoryPayload;