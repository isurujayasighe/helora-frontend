import type { MeasurementFieldConfig } from "@/components/layout/components/measurements-fields";
import type { CategoryOption } from "../types/create-order.types";

export const DEFAULT_CATEGORIES: CategoryOption[] = [
  { id: "cmo8n1mof000qdk64iu6f27nf", name: "Uniform" },
  { id: "cmo8n1mxw000sdk642l58ko48", name: "Blouse" },
  { id: "cat-saree", name: "Saree" },
  { id: "cat-shirt", name: "Shirt" },
];

export const CATEGORY_MEASUREMENTS: Record<string, MeasurementFieldConfig[]> = {
  cmo8n1mof000qdk64iu6f27nf: [
    { key: "shoulder", label: "Shoulder", unit: "in" },
    { key: "chest", label: "Chest", unit: "in" },
    { key: "waist", label: "Waist", unit: "in" },
    { key: "hip", label: "Hip", unit: "in" },
    { key: "sleeve_length", label: "Sleeve Length", unit: "in" },
    { key: "top_length", label: "Top Length", unit: "in" },
  ],
  cmo8n1mxw000sdk642l58ko48: [
    { key: "bust", label: "Bust", unit: "in" },
    { key: "waist", label: "Waist", unit: "in" },
    { key: "blouse_length", label: "Blouse Length", unit: "in" },
    { key: "shoulder", label: "Shoulder", unit: "in" },
    { key: "armhole", label: "Armhole", unit: "in" },
    { key: "sleeve_length", label: "Sleeve Length", unit: "in" },
  ],
  "cat-saree": [
    { key: "waist", label: "Waist", unit: "in" },
    { key: "hip", label: "Hip", unit: "in" },
    { key: "height", label: "Height", unit: "in" },
    { key: "blouse_bust", label: "Blouse Bust", unit: "in" },
    { key: "blouse_length", label: "Blouse Length", unit: "in" },
  ],
  "cat-shirt": [
    { key: "chest", label: "Chest", unit: "in" },
    { key: "waist", label: "Waist", unit: "in" },
    { key: "shoulder", label: "Shoulder", unit: "in" },
    { key: "neck", label: "Neck", unit: "in" },
    { key: "sleeve_length", label: "Sleeve Length", unit: "in" },
    { key: "shirt_length", label: "Shirt Length", unit: "in" },
  ],
};

export const ORDER_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CUTTING", label: "Cutting" },
  { value: "SEWING", label: "Sewing" },
  { value: "READY", label: "Ready" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export const ORDER_ITEM_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "CUTTING", label: "Cutting" },
  { value: "SEWING", label: "Sewing" },
  { value: "READY", label: "Ready" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export const ORDER_SOURCE_OPTIONS = [
  { value: "PHYSICAL_SHOP", label: "Physical Shop" },
  { value: "PHONE_CALL", label: "Phone Call" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "DREZAURA", label: "Drezaura" },
  { value: "ONLINE", label: "Online" },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  { value: "UNPAID", label: "Unpaid" },
  { value: "ADVANCE_PAID", label: "Advance Paid" },
  { value: "PARTIALLY_PAID", label: "Partially Paid" },
  { value: "PAID", label: "Paid" },
  { value: "REFUNDED", label: "Refunded" },
] as const;

export const PAYMENT_MODE_OPTIONS = [
  { value: "CASH", label: "Cash" },
  { value: "ONLINE_TRANSFER", label: "Online Transfer" },
  { value: "BANK_DEPOSIT", label: "Bank Deposit" },
  { value: "CARD", label: "Card" },
  { value: "MIXED", label: "Mixed" },
] as const;