import type {
  PackageTemplate,
  PackageTemplatePayload,
} from "../api/package-template-api";
import type {
  EditablePackageTemplate,
  EditablePackageTemplateItem,
} from "../types/package-template-form.types";

export function emptyPackageTemplateItem(
  sortOrder = 1,
): EditablePackageTemplateItem {
  return {
    itemType: "GARMENT",
    categoryId: "",
    itemDescription: "",
    defaultQuantity: 1,
    defaultUnitPrice: 0,
    priceSource: "PACKAGE_INCLUDED_ITEM",
    isOptional: false,
    sortOrder,
    notes: "",
  };
}

export function emptyPackageTemplate(): EditablePackageTemplate {
  return {
    name: "",
    description: "",
    packagePrice: 0,
    isActive: true,
    items: [emptyPackageTemplateItem()],
  };
}

export function toEditablePackageTemplate(
  template: PackageTemplate,
): EditablePackageTemplate {
  return {
    id: template.id,
    name: template.name,
    description: template.description ?? "",
    packagePrice: Number(template.packagePrice ?? 0),
    isActive: template.isActive,
    items: template.items.map((item) => ({
      itemType: item.itemType,
      categoryId: item.categoryId ?? "",
      itemDescription: item.itemDescription,
      defaultQuantity: item.defaultQuantity,
      defaultUnitPrice: Number(item.defaultUnitPrice ?? 0),
      priceSource: item.priceSource,
      isOptional: item.isOptional,
      sortOrder: item.sortOrder,
      notes: item.notes ?? "",
    })),
  };
}

export function toPackageTemplatePayload(
  form: EditablePackageTemplate,
): PackageTemplatePayload {
  return {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    packagePrice: Number(form.packagePrice || 0),
    isActive: form.isActive,
    items: form.items.map((item, index) => ({
      itemType: item.itemType,
      categoryId:
        item.itemType === "GARMENT" ? item.categoryId || undefined : undefined,
      itemDescription: item.itemDescription.trim(),
      defaultQuantity: Number(item.defaultQuantity || 1),
      defaultUnitPrice: Number(item.defaultUnitPrice || 0),
      priceSource: item.priceSource,
      isOptional: item.isOptional,
      sortOrder: Number(item.sortOrder || index + 1),
      notes: item.notes.trim() || undefined,
    })),
  };
}
