import type { OrderItemType, PriceSource } from "@/api/useCreateOrder";

export type EditablePackageTemplateItem = {
  itemType: OrderItemType;
  categoryId: string;
  itemDescription: string;
  defaultQuantity: number;
  defaultUnitPrice: number;
  priceSource: PriceSource;
  isOptional: boolean;
  sortOrder: number;
  notes: string;
};

export type EditablePackageTemplate = {
  id?: string;
  name: string;
  description: string;
  packagePrice: number;
  isActive: boolean;
  items: EditablePackageTemplateItem[];
};

export const PRICE_SOURCE_OPTIONS: Array<{
  value: PriceSource;
  label: string;
}> = [
  { value: "PACKAGE_INCLUDED_ITEM", label: "Included in package" },
  { value: "ADDITIONAL_ITEM_PRICE", label: "Additional item price" },
  { value: "FIXED_ITEM_PRICE", label: "Fixed item price" },
  { value: "MEASUREMENT_CHART_PRICE", label: "Measurement chart" },
  { value: "FREE_OF_CHARGE", label: "Free of charge" },
];
