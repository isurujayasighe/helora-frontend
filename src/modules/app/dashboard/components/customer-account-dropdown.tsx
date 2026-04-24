import { Building2, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/auth/store/authStore";

export function CustomerAccountDropdown() {
  const activeCustomer = useAuthStore((state) => state.activeCustomer);

  // use the same source you already use in the profile dropdown
  const availableCustomers = useAuthStore((state) => state.availableCustomers);
  const setActiveCustomer = useAuthStore((state) => state.switchCustomer);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-11 w-full justify-between rounded-xl border-slate-200 bg-white px-4",
            "text-left shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-300",
            "lg:w-70"
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Building2 className="h-4 w-4 text-slate-500" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Customer
              </p>
              <p className="truncate text-sm font-semibold text-slate-700">
                {activeCustomer?.name || "Select Account"}
              </p>
            </div>
          </div>

          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-70 rounded-xl border border-slate-200 p-1 shadow-lg"
      >
        {availableCustomers?.map((customer) => {
          const isActive = customer.customerId === activeCustomer?.customerId;

          return (
            <DropdownMenuItem
              key={customer.customerId}
              onClick={() => setActiveCustomer(customer.customerId)}
              className="flex items-center justify-between rounded-lg px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-700">
                  {customer.name}
                </p>
                {customer.customerId && (
                  <p className="truncate text-xs text-slate-400">
                    {customer.customerId}
                  </p>
                )}
              </div>

              {isActive && <Check className="h-4 w-4 text-slate-500" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}