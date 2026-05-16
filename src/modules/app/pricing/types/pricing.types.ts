export type PriceBookStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type PricingMethod = "FIXED" | "CHART" | "SUM_OF_ITEMS" | "MANUAL" | "FREE";

export type PricingScope =
  | "PACKAGE"
  | "PACKAGE_ITEM"
  | "ADDITIONAL_ITEM"
  | "STANDALONE_ITEM";

export type PriceSource =
  | "PACKAGE_PRICE"
  | "PACKAGE_INCLUDED_ITEM"
  | "ADDITIONAL_ITEM_PRICE"
  | "MEASUREMENT_CHART_PRICE"
  | "FIXED_ITEM_PRICE"
  | "MANUAL_OVERRIDE"
  | "FREE_OF_CHARGE";

export type PriceBook = {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  status: PriceBookStatus;
  createdAt: string;
  updatedAt: string;
  rules?: PriceRule[];
  _count?: {
    rules?: number;
  };
};

export type PriceRule = {
  id: string;
  tenantId: string;
  priceBookId: string;
  garmentSetId: string | null;
  packageTemplateId: string | null;
  packageTemplateItemId: string | null;
  scope: PricingScope;
  method: PricingMethod;
  fixedPrice: string | number | null;
  priority: number;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  priceBook?: Pick<PriceBook, "id" | "name" | "status">;
  packageTemplate?: { id: string; name: string } | null;
  packageTemplateItem?: { id: string; itemDescription: string } | null;
  measurementKeys?: Array<{
    id: string;
    axisName: string | null;
    field: { id: string; code: string; label: string };
  }>;
  priceCharts?: Array<{ id: string; name: string; isActive: boolean }>;
};

export type GarmentSet = {
  id: string;
  tenantId: string;
  categoryId: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
  } | null;
};

export type PriceChartCell = {
  id: string;
  measurement1From: string | number | null;
  measurement1To: string | number | null;
  measurement2From: string | number | null;
  measurement2To: string | number | null;
  price: string | number;
  notes: string | null;
};

export type PriceChart = {
  id: string;
  tenantId: string;
  priceRuleId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  cells: PriceChartCell[];
  priceRule?: PriceRule;
};

export type PreviewPriceLinePayload = {
  packageTemplateItemId?: string;
  quantity: number;
  scope: PricingScope;
  manualUnitPrice?: number;
  manualOverrideReason?: string;
};

export type PreviewPricePayload = {
  priceBookId?: string;
  customerId?: string;
  categoryId?: string;
  garmentSetId?: string;
  packageTemplateId?: string;
  measurementId?: string;
  lines: PreviewPriceLinePayload[];
};

export type PriceBookPayload = {
  name: string;
  description?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  status?: PriceBookStatus;
};

export type PriceRulePayload = {
  priceBookId: string;
  garmentSetId?: string;
  packageTemplateId?: string;
  packageTemplateItemId?: string;
  scope: PricingScope;
  method: PricingMethod;
  fixedPrice?: number;
  priority?: number;
  isActive?: boolean;
  notes?: string;
  measurementFieldIds?: string[];
};

export type PriceChartCellPayload = {
  measurement1From?: number;
  measurement1To?: number;
  measurement2From?: number;
  measurement2To?: number;
  price: number;
  notes?: string;
};

export type PriceChartPayload = {
  priceRuleId: string;
  name: string;
  description?: string;
  isActive?: boolean;
  cells: PriceChartCellPayload[];
};

export type PreviewPriceLineResult = {
  packageTemplateItemId?: string;
  description: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  priceSource: PriceSource;
  pricingMethod: PricingMethod;
  priceRuleId?: string;
  priceChartId?: string;
  measurementsUsed: Record<string, string>;
  matchedRange?: {
    measurement1?: string;
    measurement2?: string;
  };
  warnings: string[];
};

export type PreviewPriceResult = {
  currency: "LKR";
  lines: PreviewPriceLineResult[];
  totalAmount: string;
  warnings: string[];
};
