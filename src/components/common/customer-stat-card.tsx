import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type CustomerStatCardProps = {
  title: string;
  value: ReactNode;
  description: string;
  icon: LucideIcon;
};

export function CustomerStatCard({
  title,
  value,
}: CustomerStatCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
