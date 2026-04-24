import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Column } from "@tanstack/react-table"

export function SortableHeader<T>({
  column,
  title,
}: {
  column: Column<T, unknown>
  title: string
}) {
  const isSorted = column.getIsSorted()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 gap-1"
      onClick={() => column.toggleSorting(isSorted === "asc")}
    >
      {title}

      {!isSorted && <ArrowUpDown className="h-4 w-4 opacity-50" />}
      {isSorted === "asc" && <ArrowUp className="h-4 w-4" />}
      {isSorted === "desc" && <ArrowDown className="h-4 w-4" />}
    </Button>
  )
}
