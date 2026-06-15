import type { LucideIcon } from "lucide-react";

export type DashboardSearchScope = "all" | "customers" | "blocks" | "orders";

export type DashboardMetricTone = "default" | "primary" | "destructive";

export type DashboardStatItem = {
  title: string;
  value: string;
  description: string;
  badge: string;
  icon: LucideIcon;
  tone?: DashboardMetricTone;
  supportingText?: string;
  onClick?: () => void;
};

export type DashboardPipelineStage = {
  label: string;
  value: number;
  percent: number;
  tone?: DashboardMetricTone;
};

export type DashboardActivityItem = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone?: DashboardMetricTone;
};

export type DashboardShortcutItem = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
};

export type DashboardPromisedOrder = {
  id: string;
  title: string;
  customerName: string;
  units: number;
  orderNo: string;
  date: string;
};

export type DashboardRecentOrder = {
  id: string;
  orderNo: string;
  customerName: string;
  itemName: string;
  quantity: number;
  promisedDate: string;
  status: string;
};
