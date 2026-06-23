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
    <Card className="transition-colors hover:bg-muted/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Icon className="size-5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{category.title}</h3>

                <Badge variant="secondary" className="text-xs">
                  {category.badge}
                </Badge>
              </div>

              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                {category.description}
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onOpen}
          className="mt-4 w-full"
        >
          Open Settings
          <ArrowRight className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
