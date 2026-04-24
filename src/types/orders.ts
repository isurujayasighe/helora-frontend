export type OrderStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface OrderCustomer {
  id: string;
  fullName: string;
  phoneNumber: string;
  alternatePhone?: string | null;
  town?: string | null;
  address?: string | null;
  notes?: string | null;
}

export interface OrderCategory {
  id: string;
  name: string;
  description?: string | null;
}

export interface OrderBlock {
  id: string;
  blockNumber: string;
  readyMadeSize?: string | null;
  sizeLabel?: string | null;
  fitNotes?: string | null;
  versionNo?: number;
  description?: string | null;
  status?: string;
  isDefault?: boolean;
  remarks?: string | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  categoryId: string;
  blockId?: string | null;
  itemDescription: string;
  quantity: number;
  unitPrice: string | number;
  lineTotal: string | number;
  notes?: string | null;
  category?: OrderCategory | null;
  block?: OrderBlock | null;
}

export interface Order {
  id: string;
  tenantId: string;
  customerId: string;
  orderNumber: string;
  orderDate: string;
  promisedDate: string;
  status: OrderStatus;
  notes?: string | null;
  totalAmount: string | number;
  advanceAmount: string | number;
  balanceAmount: string | number;
  customer: OrderCustomer;
  items: OrderItem[];
  _count?: {
    items: number;
  };
}

export interface OrdersResponse {
  items: Order[];
  totalCount: number;
  page: number;
  pageSize: number;
}