import type { CustomerByPhone } from "@/api/useFindCustomerByPhone";

type CustomerByPhoneBlock = NonNullable<CustomerByPhone["blocks"]>[number];

type CustomerCategoryLike = CustomerByPhoneBlock["category"];

type CustomerBlockLike = Partial<CustomerByPhoneBlock> & {
  id: string;
  blockNumber: string;
  versionNo: number;
  status: CustomerByPhoneBlock["status"];
  isDefault: boolean;
  category?: CustomerCategoryLike | null;
};

type CustomerDetailsLike = Omit<Partial<CustomerByPhone>, "blocks"> & {
  id: string;
  fullName: string;
  phoneNumber: string;
  alternatePhone?: string | null;
  town?: string | null;
  address?: string | null;
  notes?: string | null;
  hospitalName?: string | null;
  blocks?: CustomerBlockLike[];
};

type MeasurementCustomerLike = {
  id?: string;
  fullName?: string | null;
  phoneNumber?: string | null;
  alternatePhone?: string | null;
  town?: string | null;
  address?: string | null;
  notes?: string | null;
  hospitalName?: string | null;
};

type MeasurementPrefillLike = {
  customerId: string;
  categoryId: string;
  customer?: MeasurementCustomerLike | null;
  category?: CustomerCategoryLike | null;
  block?: CustomerBlockLike | null;
};

function mapBlockToCustomerByPhoneBlock(
  block: CustomerBlockLike,
  customerId: string,
  categoryId?: string,
): CustomerByPhoneBlock {
  return {
    ...block,
    tenantId: block.tenantId ?? "",
    customerId: block.customerId ?? customerId,
    categoryId: block.categoryId ?? categoryId ?? block.category?.id ?? "",
    category: block.category ?? null,
    sizeLabel: block.sizeLabel ?? null,
    readyMadeSize: block.readyMadeSize ?? null,
    fitNotes: block.fitNotes ?? null,
    description: block.description ?? null,
    remarks: block.remarks ?? null,
  } as CustomerByPhoneBlock;
}

export function mapCustomerDetailsToCustomerByPhone(
  customer: CustomerDetailsLike,
): CustomerByPhone {
  return {
    id: customer.id,
    fullName: customer.fullName,
    phoneNumber: customer.phoneNumber,
    alternatePhone: customer.alternatePhone ?? null,
    town: customer.town ?? null,
    address: customer.address ?? null,
    notes: customer.notes ?? null,
    hospitalName: customer.hospitalName ?? null,
    blocks:
      customer.blocks?.map((block) =>
        mapBlockToCustomerByPhoneBlock(
          block,
          customer.id,
          block.categoryId ?? block.category?.id,
        ),
      ) ?? [],
  } as CustomerByPhone;
}

export function mapPrefillMeasurementToCustomerByPhone(
  measurement: MeasurementPrefillLike,
): CustomerByPhone {
  const customer = measurement.customer;

  return {
    id: customer?.id ?? measurement.customerId,
    fullName: customer?.fullName ?? "",
    phoneNumber: customer?.phoneNumber ?? "",
    alternatePhone: customer?.alternatePhone ?? null,
    town: customer?.town ?? null,
    address: customer?.address ?? null,
    notes: customer?.notes ?? null,
    hospitalName: customer?.hospitalName ?? null,
    blocks: measurement.block
      ? [
          mapBlockToCustomerByPhoneBlock(
            {
              ...measurement.block,
              categoryId: measurement.categoryId,
              category: measurement.category ?? measurement.block.category,
              isDefault: true,
            },
            measurement.customerId,
            measurement.categoryId,
          ),
        ]
      : [],
  } as CustomerByPhone;
}