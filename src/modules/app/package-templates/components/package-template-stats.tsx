import { CheckCircle2, Package2, Plus } from "lucide-react";

import { CustomerStatCard } from "@/components/common/customer-stat-card";

export type PackageTemplateStats = {
  total: number;
  active: number;
  items: number;
  optional: number;
};

type PackageTemplateStatsCardsProps = {
  stats: PackageTemplateStats;
};

export function PackageTemplateStatsCards({
  stats,
}: PackageTemplateStatsCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <CustomerStatCard
        title="Total Sets"
        value={stats.total}
        description="All configured packages"
        icon={Package2}
      />

      <CustomerStatCard
        title="Active Sets"
        value={stats.active}
        description="Available in Order Builder"
        icon={CheckCircle2}
      />

      <CustomerStatCard
        title="Set Items"
        value={stats.items}
        description="Garments and accessories"
        icon={Package2}
      />

      <CustomerStatCard
        title="Optional Items"
        value={stats.optional}
        description="Customer selectable add-ons"
        icon={Plus}
      />
    </div>
  );
}
