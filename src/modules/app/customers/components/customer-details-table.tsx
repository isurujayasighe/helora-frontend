import {
  Blocks,
  Eye,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  UserRound,
} from "lucide-react";

import { useCan } from "@/auth/rbac/useCan";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Customer } from "@/types/customers";

const formatDate = (value?: string | null) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
};

type CustomersTableProps = {
  customers: Customer[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onViewCustomer: (customerId: string) => void;
  onEditCustomer: (customerId: string) => void;
  onAssignBlocks: (customerId: string) => void;
};

export function CustomersTable({
  customers,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onViewCustomer,
  onEditCustomer,
  onAssignBlocks,
}: CustomersTableProps) {
  const canEditCustomer = useCan("update", "customers");
  const canAssignBlocks = useCan("update", "blocks");

  if (customers.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center border border-dashed bg-background p-8 text-center">
        <UserRound className="size-10 text-muted-foreground" />
        <h3 className="mt-4 text-sm font-semibold text-foreground">
          No customers found
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try changing your search filters or add a new customer.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="px-4">Customer</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Alternative Phone</TableHead>
            <TableHead>Town</TableHead>

            <TableHead>Created Date</TableHead>
            <TableHead className="px-4 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {customer.fullName}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Phone className="size-3.5 text-muted-foreground" />
                  {customer.phoneNumber}
                </span>
              </TableCell>

              <TableCell>
                {customer.alternatePhone ? (
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Phone className="size-3.5 text-muted-foreground" />
                    {customer.alternatePhone}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>

              <TableCell>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  {customer.town || "-"}
                </span>
              </TableCell>

              <TableCell>{formatDate(customer.createdAt)}</TableCell>

              <TableCell className="px-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Open customer actions</span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onViewCustomer(customer.id)}
                    >
                      <Eye className="size-4" />
                      View details
                    </DropdownMenuItem>

                    {canEditCustomer && (
                      <DropdownMenuItem
                        onClick={() => onEditCustomer(customer.id)}
                      >
                        <Pencil className="size-4" />
                        Edit customer
                      </DropdownMenuItem>
                    )}

                    {canAssignBlocks && (
                      <DropdownMenuItem
                        onClick={() => onAssignBlocks(customer.id)}
                      >
                        <Blocks className="size-4" />
                        Assign blocks
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing page{" "}
          <span className="font-medium text-foreground">{currentPage}</span> of{" "}
          <span className="font-medium text-foreground">{totalPages}</span> -{" "}
          <span className="font-medium text-foreground">{totalCount}</span>{" "}
          customers
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
