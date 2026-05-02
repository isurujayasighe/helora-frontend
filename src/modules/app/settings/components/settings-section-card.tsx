import { Card, CardContent } from "@/components/ui/card";

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsSectionCard({ title, description, children }: Props) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="mb-4">
          <h3 className="text-base font-black text-slate-950">{title}</h3>
          {description && (
            <p className="mt-1 text-sm font-medium leading-5 text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div className="grid gap-4">{children}</div>
      </CardContent>
    </Card>
  );
}