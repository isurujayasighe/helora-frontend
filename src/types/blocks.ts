export type BlockStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED" | string;

export type BlockCustomer = {
  id: string;
  tenantId: string;
  fullName: string;
  phoneNumber: string | null;
  alternatePhone: string | null;
  town: string | null;
  address: string | null;
  notes: string | null;
  createdById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
};

export type BlockCategory = {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerBlockAssignment = {
  customerId: string;
  blockId: string;
  isDefault: boolean;
  assignedAt: string;
  assignedById: string | null;
  customer: BlockCustomer;
};

export type Block = {
  id: string;
  tenantId: string;
  categoryId: string;
  blockNumber: string;
  readyMadeSize: string | null;
  sizeLabel: string | null;
  fitNotes: string | null;
  versionNo: number;
  previousBlockId: string | null;
  description: string | null;
  status: BlockStatus;
  lastUsedAt: string | null;
  remarks: string | null;
  legacyId: number | null;
  createdById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
  category: BlockCategory;
  customerBlocks: CustomerBlockAssignment[];
  _count: {
    orderItems: number;
    measurements?: number;
    customerBlocks?: number;
  };
};
