import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import type { SettingsCategory } from "../types/settings.types";

interface Props {
  category: SettingsCategory;
  onOpen: () => void;
}

export function SettingCard({ category, onOpen }: Props) {
  const Icon = category.icon;

  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-black text-slate-950">
                  {category.title}
                </h3>

                <Badge
                  variant="secondary"
                  className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600"
                >
                  {category.badge}
                </Badge>
              </div>

              <p className="mt-1 text-sm font-medium leading-5 text-slate-500">
                {category.description}
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onOpen}
          className="mt-4 h-10 w-full rounded-lg font-bold"
        >
          Open Settings
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}