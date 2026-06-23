import { Eye, MapPin, Phone, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
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
};

export function CustomersTable({
  customers,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onViewCustomer,
}: CustomersTableProps) {
  if (customers.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center border border-dashed p-8 text-center">
        <UserRound className="h-10 w-10" />
        <h3 className="mt-4 text-sm font-semibold">No customers found</h3>
        <p className="mt-1 text-sm">
          Try changing your search filters or add a new customer.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border">
      <div className="overflow-x-auto">
        <Table className="w-full min-w-237.5 text-left text-sm">
          <TableHeader className="border-b text-xs uppercase">
            <TableRow>
              <TableHead className="px-4 py-3 font-semibold">
                Customer
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold">Phone</TableHead>
              <TableHead className="px-4 py-3 font-semibold">
                Alternative Phone
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold">Town</TableHead>
              <TableHead className="px-4 py-3 font-semibold">Orders</TableHead>
              <TableHead className="px-4 py-3 font-semibold">
                Created Date
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-semibold">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y">
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center text-xs">
                      {customer.fullName?.charAt(0)?.toUpperCase() || "C"}
                    </div>

                    <div>
                      <p className="font-semibold">{customer.fullName}</p>
                      <p className="text-xs">
                        {customer.address || "No address"}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-4">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Phone className="h-3.5 w-3.5" />
                    {customer.phoneNumber}
                  </span>
                </TableCell>

                <TableCell className="px-4 py-4">
                  {customer.alternatePhone ? (
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Phone className="h-3.5 w-3.5" />
                      {customer.alternatePhone}
                    </span>
                  ) : (
                    <span>-</span>
                  )}
                </TableCell>

                <TableCell className="px-4 py-4">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {customer.town || "-"}
                  </span>
                </TableCell>

                <TableCell className="px-4 py-4">
                  <span className="px-2.5 py-1 text-xs font-semibold">
                    {customer._count?.orders ?? 0}
                  </span>
                </TableCell>

                <TableCell className="px-4 py-4">
                  {formatDate(customer.createdAt)}
                </TableCell>

                <TableCell className="px-4 py-4 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => onViewCustomer(customer.id)}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          Showing page <span className="font-medium">{currentPage}</span> of{" "}
          <span className="font-medium">{totalPages}</span> —{" "}
          <span className="font-medium">{totalCount}</span> customers
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
