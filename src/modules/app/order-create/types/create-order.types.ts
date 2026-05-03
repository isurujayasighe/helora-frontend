import type { z } from "zod";
import type { CreateOrderPayload } from "@/api/useCreateOrder";
import type { formSchema } from "../schema/create-order.schema";

export type CreateOrderFormInput = z.input<typeof formSchema>;
export type CreateOrderFormValues = z.output<typeof formSchema>;

export type CategoryOption = {
  id: string;
  name: string;
  isActive?: boolean;
};

export type CreateOrderPrefill = {
  customerId?: string;
  measurementId?: string;
  blockId?: string;
  categoryId?: string;
};

export type CreateOrderPageProps = {
  prefill?: CreateOrderPrefill;
  onSubmit?: (payload: CreateOrderPayload) => Promise<void> | void;
};