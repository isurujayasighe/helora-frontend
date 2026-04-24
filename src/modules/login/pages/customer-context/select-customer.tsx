import { useEffect } from "react";
import { Building2, ArrowRight, LogOut } from "lucide-react";
import { useNavigate, } from "@tanstack/react-router";
import { useAuthStore } from "@/auth/store/authStore";
import { useGetCustomerProfile } from "@/api/useGetCustomers";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SelectCustomerPage() {
  const navigate = useNavigate();
  const { switchCustomer, user, logout, activeCustomer } = useAuthStore();
  const { data: customers = [], isLoading } = useGetCustomerProfile();

  // Redirect if they somehow already have an active customer
  useEffect(() => {
    if (activeCustomer) {
      navigate({ to: "/app/dashboard", });
    }
  }, [activeCustomer, navigate]);

  const handleSelect = (customerId: string) => {
    switchCustomer(customerId);
    navigate({ 
      to: "/app/dashboard", 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-2xl border-none ring-1 ring-slate-200">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-indigo-200">
            <Building2 className="text-white size-7" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Select Organization
          </CardTitle>
          <CardDescription className="text-slate-500">
            Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>. 
            Please select an account to continue.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {isLoading ? (
            <SelectionSkeleton />
          ) : (
            <div className="space-y-2">
              {customers.map((customer) => (
                <button
                  key={customer.customerId}
                  onClick={() => handleSelect(customer.customerId)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white",
                    "hover:border-indigo-600 hover:ring-1 hover:ring-indigo-600/10 hover:bg-indigo-50/30",
                    "transition-all duration-200 group text-left outline-none focus:ring-2 focus:ring-indigo-500"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="size-11 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-white group-hover:text-indigo-600 transition-colors border border-transparent group-hover:border-indigo-100">
                      {customer.name.substring(0, 1)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{customer.name}</p>
                      <p className="text-xs text-slate-400 font-mono uppercase tracking-tighter">
                        ID: {customer.customerId}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="size-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 mt-4">
            <Button 
              variant="ghost" 
              onClick={logout}
              className="w-full text-slate-500 hover:text-destructive hover:bg-destructive/5 gap-2"
            >
              <LogOut className="size-4" />
              Sign in with a different account
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <p className="mt-8 text-sm text-slate-400">
        &copy; 2026 Covalent Systems. All rights reserved.
      </p>
    </div>
  );
}

function SelectionSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 border border-slate-50 rounded-xl bg-white/50">
          <Skeleton className="size-11 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="size-4 rounded-full" />
        </div>
      ))}
    </div>
  );
}