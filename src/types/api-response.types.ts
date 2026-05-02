export interface ApiResponse<TData> {
  success: boolean;
  data: TData;
  error?: string | null;
}

export interface PaginatedResponse<TItem> {
  items: TItem[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiCount {
  [key: string]: number;
}