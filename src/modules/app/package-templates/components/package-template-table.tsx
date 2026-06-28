import { MoreHorizontal, Package2, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { PackageTemplate } from "../api/package-template-api";
import { formatDate, formatMoney } from "../utils/package-template-formatters";

type PackageTemplateTableProps = {
  templates: PackageTemplate[];
  isLoading: boolean;
  isDeactivating: boolean;
  onEdit: (template: PackageTemplate) => void;
  onDeactivate: (template: PackageTemplate) => void;
};

export function PackageTemplateTable({
  templates,
  isLoading,
  isDeactivating,
  onEdit,
  onDeactivate,
}: PackageTemplateTableProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!templates.length) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center p-6 text-center">
        <Package2 className="size-10 text-muted-foreground" />

        <h3 className="mt-4 text-lg font-semibold">No garment sets found</h3>

        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Create sets like Nurse Full Kit or School Uniform Set, then add the
          garments and accessories that belong to each one.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="bg-background">
        <TableRow>
          <TableHead className="px-4">Garment Set</TableHead>
          <TableHead>Package Price</TableHead>
          <TableHead>Included</TableHead>
          <TableHead>Optional</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="px-4 text-right">Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {templates.map((template) => {
          const includedItems = template.items.filter(
            (item) => !item.isOptional,
          );
          const optionalItems = template.items.filter(
            (item) => item.isOptional,
          );

          return (
            <TableRow key={template.id}>
              <TableCell className="max-w-[320px] px-4 py-3">
                <button
                  type="button"
                  onClick={() => onEdit(template)}
                  className="text-left"
                >
                  <p className="font-medium">{template.name}</p>

                  <p className="mt-1 line-clamp-2 whitespace-normal text-sm text-muted-foreground">
                    {template.description || "No description added"}
                  </p>
                </button>
              </TableCell>

              <TableCell className="py-3">
                Rs. {formatMoney(template.packagePrice)}
              </TableCell>

              <TableCell className="py-3">
                <ItemSummary
                  items={includedItems}
                  fallback="No included items"
                />
              </TableCell>

              <TableCell className="py-3">
                <ItemSummary
                  items={optionalItems}
                  fallback="No optional items"
                />
              </TableCell>

              <TableCell className="py-3">
                <Badge
                  className={cn(
                    "rounded-full",
                    template.isActive
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-100",
                  )}
                >
                  {template.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>

              <TableCell className="py-3 text-sm text-muted-foreground">
                {formatDate(template.updatedAt)}
              </TableCell>

              <TableCell className="px-4 py-3 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Open garment set actions</span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(template)}>
                      <Pencil className="size-4" />
                      Edit Set
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      disabled={isDeactivating || !template.isActive}
                      onClick={() => onDeactivate(template)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="size-4" />
                      Deactivate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function ItemSummary({
  items,
  fallback,
}: {
  items: PackageTemplate["items"];
  fallback: string;
}) {
  if (!items.length) {
    return <span className="text-sm text-muted-foreground">{fallback}</span>;
  }

  return (
    <div className="flex max-w-65 flex-wrap gap-1.5">
      {items.slice(0, 3).map((item) => (
        <Badge
          key={item.id}
          className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100"
        >
          {item.itemDescription}
        </Badge>
      ))}

      {items.length > 3 && (
        <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
          +{items.length - 3}
        </Badge>
      )}
    </div>
  );
}
