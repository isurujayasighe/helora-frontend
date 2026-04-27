export type GroupOrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "READY"
  | "PARTIALLY_DELIVERED"
  | "DELIVERED"
  | "CANCELLED";

export type GroupOrderCoordinatorCustomer = {
  id: string;
  fullName: string;
  phoneNumber: string | null;
  town: string | null;
  hospitalName: string | null;
};

export type GroupOrder = {
  id: string;
  tenantId: string;
  groupOrderNumber: string;
  coordinatorCustomerId: string | null;
  title: string | null;
  hospitalName: string | null;
  town: string | null;
  contactName: string | null;
  contactPhone: string | null;
  deliveryAddress: string | null;
  deliveryTown: string | null;
  status: GroupOrderStatus;
  totalOrders: number;
  totalQty: number;
  totalAmount: string | number;
  advanceAmount: string | number;
  balanceAmount: string | number;
  courierCharges: string | number;
  expectedDeliveryDate: string | null;
  deliveredAt: string | null;
  notes: string | null;
  createdById: string | null;
  updatedById: string | null;
  createdAt: string;
  updatedAt: string;
  coordinatorCustomer: GroupOrderCoordinatorCustomer | null;
  _count?: {
    orders?: number;
    payments?: number;
  };
};

export type GroupOrdersPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedGroupOrdersData = {
  items: GroupOrder[];
  pagination: GroupOrdersPagination;
};