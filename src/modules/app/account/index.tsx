import { useCallback, useMemo, useState, useEffect } from "react";
import { PermissionGate } from "@/auth/rbac/PermissionGate";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import {
  Truck,
  FileText,
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  RefreshCw,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetAccountDetails } from "./api/useGetAccounts"; // Ensure this matches your hook filename
import { StatCardSkeleton } from "./components/stat-card-skeleton";
import { Input } from "@/components/ui/input";
import { ListSkeleton } from "./components/table-component";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/layout/stat-card";
import { FilterDialog } from "./components/filter-popover";
import { InvoiceCard } from "./components/account-list";
import { OrderDetailsDialog } from "./components/order-details-sheet";
import { useAuthStore } from "@/auth/store/authStore";
import { Cash } from "tabler-icons-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function AccountPage() {
  const activeCustomer = useAuthStore((state) => state.user);

  // --- Filter & Pagination States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>(
    {},
  );

  const PAGE_SIZE = 10;

  // UI States
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // 1. Search Debounce Logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 2. Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, dateRange]);

  // 3. API Hook: Consuming the Refactored Response
  const {
    data: responseData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAccountDetails({
    customerNo: activeCustomer?.id || "",
    invoiceNo: debouncedSearch,
    status: statusFilter,
    fromDate: dateRange.start,
    toDate: dateRange.end,
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  // Extract items and metadata safely
  const invoices = responseData?.items || [];
  const totalCount = responseData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const amounts = responseData?.accountAmounts;

  // 4. Financial Stats from API (Invoiced and Paid)
  const stats = useMemo(
    () => ({
      outstanding: amounts?.totalOutstanding ?? 0,
      paid: amounts?.totalCustomerAdvances ?? 0,
      due: amounts?.totalInvoiced ?? 0,
      // Note: If you still need item counts, you'd filter locally or get them from backend
    }),
    [amounts],
  );

  const handleToggle = useCallback((id: string) => {
    setExpandedOrderId((prevId) => (prevId === id ? null : id));
  }, []);

  const handleViewDetails = useCallback((order: any) => {
    setSelectedOrder(order);
  }, []);

  return (
    <PermissionGate action="read" subject="Orders">
      <AnimatePresence mode="wait">
        <motion.div
          key="invoice-page"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="space-y-6 pb-10 p-2 lg:p-16 max-w-7xl mx-auto py-4"
        >
          {/* Background Loading Bar */}
          {isFetching && !isLoading && (
            <div className="fixed top-0 left-0 w-full z-50">
              <div className="h-1 bg-blue-600 animate-pulse w-full" />
            </div>
          )}

          {/* Stat Cards Section - Financial Focused */}
          <Card className="gap-0">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
              <div className="w-full space-y-1">
                <CardTitle className="text-xl font-bold text-slate-900">
                  Account Balance
                </CardTitle>

                <CardDescription className="text-xs text-slate-500">
                  View your account balance, transactions, and payment history
                </CardDescription>

                <div className="mt-3 w-full rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">
                  <div className="flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                      This portal provides access exclusively to customer
                      order-related information.
                    </p>
                  </div>
                </div>
              </div>

              {/* The Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label="Refresh account data"
                className={cn(
                  "h-8 transition-all duration-300 shadow-sm shrink-0",
                  // Mobile: Square icon button (w-8, no padding, no gap). Desktop: Auto width, padding, and gap.
                  "w-8 px-0 sm:w-auto sm:px-3 gap-0 sm:gap-2 flex justify-center",
                  isFetching
                    ? "bg-slate-50 text-slate-400 border-slate-200 cursor-wait" // Soft muted state while loading
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300", // Crisp interactive state
                )}
              >
                <RefreshCw
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    isFetching
                      ? "animate-spin text-slate-400"
                      : "text-slate-500",
                  )}
                />
                {/* Hidden on mobile, inline on sm screens and up */}
                <span className="hidden sm:inline font-medium text-sm">
                  {isFetching ? "Updating..." : "Refresh"}
                </span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3  gap-4">
                {isLoading ? (
                  Array(3)
                    .fill(0)
                    .map((_, i) => <StatCardSkeleton key={i} />)
                ) : (
                  <>
                    <StatCard
                      variant="processing"
                      title="Outstanding Balance"
                      value={`£ ${Number(stats.outstanding).toLocaleString(
                        "en-GB",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}`}
                      subtitle="Pending for Payment"
                      icon={Package}
                    />
                    <StatCard
                      variant="invoiced"
                      title="Total Invoiced"
                      value={`£ ${Number(stats.due).toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                      subtitle="Invoice Gross Amount"
                      icon={FileText}
                    />
                    <StatCard
                      variant="delivered"
                      title="Customer Advances"
                      value={`£ ${Number(stats.paid).toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                      subtitle="Advances paid"
                      icon={Truck}
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="py-2 lg:py-0">
            <CardContent className="px-2 lg:px-6 py-2 lg:py-4">
              <div className="space-y-4">
                {/* Search & Tabs Toolbar */}
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm  border-slate-200 pb-2">
                  <div className="flex flex-col md:flex-row-reverse md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <div className="relative flex-1 md:min-w-75">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                          placeholder="Search by Invoice Number"
                          className="pl-9 h-8 bg-muted border-slate-200 placeholder:text-xs text-sm"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <FilterDialog
                        currentStatus={statusFilter}
                        onStatusChange={setStatusFilter}
                        onDateChange={(start, end) =>
                          setDateRange({ start, end })
                        }
                      />
                    </div>

                    <Tabs
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                      className="w-full md:w-auto"
                    >
                      <TabsList className="h-12 bg-transparent p-0 flex w-full justify-start rounded-none  gap-2">
                        {[
                          {
                            id: "all",
                            label: "All",
                            icon: Package,
                          },

                          {
                            id: "OUTSTANDING",
                            label: "Outstanding",
                            icon: Clock,
                          },
                          {
                            id: "TOTAL_INVOICED",
                            label: "Invoiced",
                            icon: CheckCircle2,
                          },
                          {
                            id: "CUSTOMER_ADVANCES",
                            label: "Advances",
                            icon: Cash,
                          },
                        ].map((tab) => (
                          <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className={cn(
                              "flex items-center gap-2 h-12 px-3 bg-transparent rounded-none transition-all outline-none border-b-2 border-transparent text-xs font-semibold text-slate-500 whitespace-nowrap",
                              "data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 data-[state=active]:bg-transparent",
                            )}
                          >
                            <tab.icon
                              className={cn(
                                "h-4 w-4 stroke-[2px]",
                                // Optional: Specific colors for icons when active
                                statusFilter === tab.id &&
                                  tab.id === "due" &&
                                  "text-rose-500",
                                statusFilter === tab.id &&
                                  tab.id === "paid" &&
                                  "text-emerald-500",
                              )}
                            />
                            <span>{tab.label}</span>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                </div>

                {/* Invoices List */}
                <div
                  className={cn(
                    "space-y-3 transition-opacity",
                    isFetching && "opacity-60",
                  )}
                >
                  {isLoading ? (
                    <ListSkeleton />
                  ) : invoices.length > 0 ? (
                    <>
                      {invoices.map((invoice: any) => (
                        <InvoiceCard
                          key={invoice.invoiceNo}
                          order={invoice} // Ensure OrderCard is mapped to Invoice fields
                          isExpanded={expandedOrderId === invoice.invoiceNo}
                          onToggle={() => handleToggle(invoice.invoiceNo)}
                          onViewDetails={() => handleViewDetails(invoice)}
                        />
                      ))}

                      {/* Enterprise Pagination Bar */}
                      <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
                        <span className="text-center text-[11px] text-slate-500 sm:text-left sm:text-xs">
                          Showing {invoices.length} of {totalCount}
                        </span>

                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            className="h-8 w-8 rounded-md"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>

                          <div className="rounded-md border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700 sm:text-xs">
                            {currentPage} / {totalPages || 1}
                          </div>

                          <Button
                            variant="outline"
                            size="icon"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            className="h-8 w-8 rounded-md"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400">
                      <FileText className="h-12 w-12 mb-4 opacity-20" />
                      <p>No invoices found matching your criteria.</p>
                    </div>
                  )}
                </div>
              </div>

              <OrderDetailsDialog
                order={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
              />
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </PermissionGate>
  );
}
