import { Card, CardContent } from "@/components/ui/card";

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsSectionCard({ title, description, children }: Props) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-4">
          <h3 className="text-base font-semibold">{title}</h3>
          {description && (
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        <div className="grid gap-4">{children}</div>
      </CardContent>
    </Card>
  );
}
