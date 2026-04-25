export type OrderStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface OrderCustomer {
  id: string;
  tenantId?: string;
  fullName: string;
  phoneNumber: string;
  alternatePhone?: string | null;
  town?: string | null;
  address?: string | null;
  notes?: string | null;
}

export interface OrderCategory {
  id: string;
  tenantId?: string;
  name: string;
  description?: string | null;
}

export interface OrderBlock {
  id: string;
  tenantId?: string;
  customerId?: string;
  categoryId?: string;
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
}

export type OrderItemMeasurements = Record<
  string,
  string | number | undefined
>;

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
  measurements?: OrderItemMeasurements;
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
  createdById?: string;
  updatedById?: string;
  createdAt?: string;
  updatedAt?: string;
  customer: OrderCustomer;
  items: OrderItem[];
  _count?: {
    items: number;
  };
}