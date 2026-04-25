export type Customer = {
  id: string;
  tenantId: string;
  fullName: string;
  phoneNumber: string;
  alternatePhone: string | null;
  town: string | null;
  address: string | null;
  notes: string | null;
  createdById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    blocks: number;
    orders: number;
  };
};

export type CustomersResponse = {
  success: boolean;
  data: Customer[];
};