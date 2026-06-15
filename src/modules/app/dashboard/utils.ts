import type { Order } from "@/types/orders";

const inactiveOrderStatuses = ["DELIVERED", "CANCELLED", "COMPLETED"];

export function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatMonthDayParts(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      month: "-",
      day: "-",
    };
  }

  return {
    month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: date.getDate().toString().padStart(2, "0"),
  };
}

export function formatCurrency(value: string | number) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

export function getOrderQuantity(order: Order) {
  if (typeof order.totalQty === "number") return order.totalQty;

  return order.items.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );
}

export function getOrderTitle(order: Order) {
  const firstItem = order.items[0];

  return (
    firstItem?.itemDescription ||
    firstItem?.category?.name ||
    order.customer?.fullName ||
    order.orderNumber
  );
}

export function isOrderOverdue(order: Order) {
  if (!order.promisedDate || inactiveOrderStatuses.includes(order.status)) {
    return false;
  }

  const promisedDate = new Date(order.promisedDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return promisedDate.getTime() < today.getTime();
}

export function formatOrderStatus(
  status: string,
  promisedDate?: string | null,
) {
  const isOverdue =
    promisedDate &&
    !inactiveOrderStatuses.includes(status) &&
    new Date(promisedDate).getTime() < new Date().setHours(0, 0, 0, 0);

  if (isOverdue) return "Overdue";

  const labels: Record<string, string> = {
    PENDING: "Draft",
    CONFIRMED: "Confirmed",
    CUTTING: "Cutting",
    SEWING: "Sewing",
    READY: "Ready",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
  };

  return labels[status] ?? status;
}

export function getDaysUntil(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  const target = new Date(date);
  const today = new Date();

  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function formatDueLabel(value: string) {
  const daysUntil = getDaysUntil(value);

  if (daysUntil === null) return "Date pending";
  if (daysUntil < 0) return "Overdue";
  if (daysUntil === 0) return "Due today";
  if (daysUntil === 1) return "Due tomorrow";

  return `Due in ${daysUntil} days`;
}
