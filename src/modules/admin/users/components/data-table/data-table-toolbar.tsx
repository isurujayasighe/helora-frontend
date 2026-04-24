import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Filter, Plus } from "lucide-react";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  onCreate?: () => void;
}

export function DataTableToolbar({ search, onSearchChange, onCreate }: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Input
        placeholder="Search..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />

      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-1" />
          Filters
        </Button>

        {onCreate && (
          <Button size="sm" onClick={onCreate}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}
