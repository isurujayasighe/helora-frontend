import { Eye, MapPin, Phone, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <UserRound className="h-10 w-10 text-slate-400" />
        <h3 className="mt-4 text-sm font-semibold text-slate-900">
          No customers found
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Try changing your search filters or add a new customer.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-237.5 text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Alternative Phone</th>
              <th className="px-4 py-3 font-semibold">Town</th>
              <th className="px-4 py-3 font-semibold">Orders</th>
              <th className="px-4 py-3 font-semibold">Created Date</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                      {customer.fullName?.charAt(0)?.toUpperCase() || "C"}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {customer.fullName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {customer.address || "No address"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {customer.phoneNumber}
                  </span>
                </td>

                <td className="px-4 py-4">
                  {customer.alternatePhone ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {customer.alternatePhone}
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>

                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1.5 text-slate-700">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {customer.town || "-"}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {customer._count?.orders ?? 0}
                  </span>
                </td>

                <td className="px-4 py-4 text-slate-700">
                  {formatDate(customer.createdAt)}
                </td>

                <td className="px-4 py-4 text-right">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Showing page{" "}
          <span className="font-medium text-slate-900">{currentPage}</span> of{" "}
          <span className="font-medium text-slate-900">{totalPages}</span> —{" "}
          <span className="font-medium text-slate-900">{totalCount}</span>{" "}
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