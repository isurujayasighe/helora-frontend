"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Package2, Ruler, Trash2 } from "lucide-react";
import type { Control, UseFormSetValue } from "react-hook-form";
import {
  MeasurementFields,
  type MeasurementFieldConfig,
} from "./measurement-fields";

export type CategoryOption = {
  id: string;
  name: string;
};

export type CustomerBlockCategory = {
  id: string;
  name: string;
};

export type CustomerBlock = {
  id: string;
  categoryId: string;
  blockNumber: string;
  sizeLabel?: string | null;
  versionNo?: number;
  isDefault?: boolean;
  category?: CustomerBlockCategory | null;
};

export type OrderItemFormValue = {
  categoryId: string;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  notes?: string;
  blockMode: "existing" | "new";
  blockId?: string;
  measurements?: Record<string, string | number | undefined>;
};

export type CreateOrderFormInput = {
  phoneNumber: string;
  customerMode: "existing" | "new";
  customerId?: string;
  customerName?: string;
  customerTown?: string;
  customerAddress?: string;
  customerNotes?: string;
  orderNumber: string;
  orderDate: string;
  promisedDate: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes?: string;
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  items: OrderItemFormValue[];
};

type OrderItemFormCardProps = {
  index: number;
  control: Control<CreateOrderFormInput>;
  setValue: UseFormSetValue<CreateOrderFormInput>;
  item: OrderItemFormValue | undefined;
  categories: CategoryOption[];
  availableBlocks: CustomerBlock[];
  measurementFields: MeasurementFieldConfig[];
  onMeasurementChange: (itemIndex: number, key: string, value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
};

export function OrderItemFormCard({
  index,
  control,
  setValue,
  item,
  categories,
  availableBlocks,
  measurementFields,
  onMeasurementChange,
  onRemove,
  canRemove,
}: OrderItemFormCardProps) {
  const selectedMeasurements = item?.measurements || {};
  const selectedBlockMode = item?.blockMode;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white">
            <Package2 className="h-4 w-4 text-slate-600" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">Item {index + 1}</p>
            <p className="text-xs text-slate-500">
              Category, measurements, block handling and notes
            </p>
          </div>
        </div>

        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FormField
          control={control}
          name={`items.${index}.categoryId`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  onChange={(e) => {
                    field.onChange(e);
                    setValue(`items.${index}.blockId`, "");
                    setValue(`items.${index}.measurements`, {});
                  }}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`items.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`items.${index}.unitPrice`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Price</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`items.${index}.lineTotal`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Line Total</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  readOnly
                  className="bg-slate-100"
                  {...field}
                  value={Number(item?.quantity || 0) * Number(item?.unitPrice || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="xl:col-span-4">
          <FormField
            control={control}
            name={`items.${index}.itemDescription`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Description</FormLabel>
                <FormControl>
                  <Input placeholder="Eg: 2 school uniforms" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {measurementFields.length > 0 && (
          <div className="xl:col-span-4">
            <div className="mb-2 flex items-center gap-2">
              <Ruler className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Measurements</span>
              <Badge variant="secondary" className="ml-1">
                Dynamic by category
              </Badge>
            </div>

            <MeasurementFields
              fields={measurementFields}
              value={selectedMeasurements}
              onChange={(key, value) => onMeasurementChange(index, key, value)}
            />
          </div>
        )}

        <div className="xl:col-span-4 rounded-xl border border-slate-200 bg-white p-4">
          <FormField
            control={control}
            name={`items.${index}.blockMode`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Block Handling</FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="radio"
                        value="existing"
                        checked={field.value === "existing"}
                        onChange={() => field.onChange("existing")}
                        disabled={availableBlocks.length === 0}
                      />
                      Use Existing Block
                    </label>

                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="radio"
                        value="new"
                        checked={field.value === "new"}
                        onChange={() => {
                          field.onChange("new");
                          setValue(`items.${index}.blockId`, "");
                        }}
                      />
                      Create New Block Later
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedBlockMode === "existing" && (
            <div className="mt-4">
              <FormField
                control={control}
                name={`items.${index}.blockId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Existing Block</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        disabled={availableBlocks.length === 0}
                      >
                        <option value="">
                          {availableBlocks.length === 0
                            ? "No matching blocks for selected category"
                            : "Select block"}
                        </option>
                        {availableBlocks.map((block) => (
                          <option key={block.id} value={block.id}>
                            {block.blockNumber}
                            {block.sizeLabel ? ` • ${block.sizeLabel}` : ""}
                            {block.versionNo ? ` • V${block.versionNo}` : ""}
                            {block.isDefault ? ` • Default` : ""}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {availableBlocks.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  No existing block matches this category. Choose “Create New Block Later”.
                </p>
              )}
            </div>
          )}

          {selectedBlockMode === "new" && (
            <p className="mt-4 text-xs text-slate-500">
              A new block will be prepared after order placement.
            </p>
          )}
        </div>

        <div className="xl:col-span-4">
          <FormField
            control={control}
            name={`items.${index}.notes`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Eg: urgent item, special stitching, etc."
                    className="min-h-20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}