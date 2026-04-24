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
  LayoutGrid,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetInvoices } from "./api/useGetInvoices";
import { StatCardSkeleton } from "./components/stat-card-skeleton";
import { Input } from "@/components/ui/input";
import { ListSkeleton } from "./components/table-component";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/layout/stat-card";
import { FilterDialog } from "./components/filter-popover";
import { InvoiceCard } from "./components/invoice-list";
import { OrderDetailsDialog } from "./components/order-details-sheet";
import { useAuthStore } from "@/auth/store/authStore";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function InvoicePage() {
  const activeCustomer = useAuthStore((state) => state.activeCustomer);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>(
    {},
  );

  const PAGE_SIZE = 10;

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [_expandedOrderId, _setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, dateRange]);

  const {
    data: responseData,
    isLoading,
    isFetching,
    refetch,
  } = useGetInvoices({
    customerNo: activeCustomer?.customerId || "",
    invoiceNo: debouncedSearch,
    status: statusFilter,
    fromDate: dateRange.start,
    toDate: dateRange.end,
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  const invoices = responseData?.items || [];
  const totalCount = responseData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const amounts = responseData?.invoiceAmounts;

  const stats = useMemo(
    () => ({
      outstanding: amounts?.totalOutstanding ?? 0,
      paid: amounts?.totalPaid ?? 0,
      due: amounts?.totalOverDue ?? 0,
      canceled: amounts?.totalCancelled ?? 0,
    }),
    [amounts],
  );

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
          className={cn(
            "space-y-6 pb-10 p-2 lg:p-16 max-w-11/12 mx-auto py-4 transition-all duration-300",
            isFetching &&
              !isLoading &&
              "opacity-50 pointer-events-none grayscale-[0.5]",
          )} >
          <Card className="gap-0">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
              <div className="w-full space-y-1">
                <CardTitle className="text-lg font-bold text-slate-900 sm:text-xl">
                  Invoices
                </CardTitle>

                <CardDescription className="text-[11px] leading-relaxed text-slate-500 sm:text-xs">
                  Manage your financial standing and payment history.
                </CardDescription>

                <div className="mt-2 w-full rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800 sm:mt-3 sm:text-sm">
                  <div className="flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="leading-snug">
                      This portal provides access exclusively to customer
                      order-related information.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label="Refresh account data"
                className={cn(
                  "flex h-8 shrink-0 justify-center transition-all duration-300 shadow-sm",
                  "w-8 gap-0 px-0 sm:w-auto sm:gap-2 sm:px-3",
                  isFetching
                    ? "cursor-wait border-slate-200 bg-slate-50 text-slate-400"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
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
                <span className="hidden text-sm font-medium sm:inline">
                  {isFetching ? "Updating..." : "Refresh"}
                </span>
              </Button>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
                {isLoading ? (
                  Array(3)
                    .fill(0)
                    .map((_, i) => <StatCardSkeleton key={i} />)
                ) : (
                  <>
                    <StatCard
                      variant="processing"
                      title="Outstanding Invoices"
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
                      variant="delivered"
                      title="Paid Invoices"
                      value={`£ ${Number(stats.paid).toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                      subtitle="Settled Invoices"
                      icon={Truck}
                    />
                    <StatCard
                      variant="invoiced"
                      title="Overdue Invoices"
                      value={`£ ${Number(stats.due).toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                      subtitle="Overdue for payments"
                      icon={FileText}
                    />
                    {/* <StatCard
                      variant="cancelled"
                      title="Cancelled"
                      value={`£ ${stats.canceled.toLocaleString()}`}
                      subtitle="Cancelled invoices"
                      icon={Truck}
                    /> */}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="py-2 lg:py-0">
            <CardContent className="px-2 lg:px-6 py-2 lg:py-4">
              <div className="space-y-4">
                <div className="sticky top-0 z-10 border-slate-200 bg-background/95 pb-2 backdrop-blur-sm">
                  <div className="flex flex-col gap-3 md:flex-row-reverse md:items-center md:justify-between ">
                    <div className="flex w-full items-center gap-2 md:w-auto">
                      <div className="relative flex-1 md:min-w-60">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <Input
                          placeholder="Search by invoice number..."
                          className="h-8 border-slate-200 bg-muted pl-9 text-sm placeholder:text-xs"
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
                      className="w-full md:flex-1"
                    >
                      <div className="-mx-4 overflow-x-auto px-4 no-scrollbar md:mx-0 md:px-0">
                        <TabsList className="flex h-12 w-fit gap-1 rounded-none bg-transparent p-0">
                          {[
                            { id: "all", label: "All", icon: LayoutGrid },
  { id: "outstanding", label: "Outstanding", icon: Clock },
  { id: "paid", label: "Paid", icon: CheckCircle2 },
  { id: "overdue", label: "Overdue", icon: AlertCircle },
                            // {
                            //   id: "Cancelled",
                            //   label: "Canceled",
                            //   icon: AlertCircle,
                            // },
                          ].map((tab) => (
                            <TabsTrigger
                              key={tab.id}
                              value={tab.id}
                              className={cn(
                                "flex h-12 items-center gap-2 whitespace-nowrap rounded-none border-b-2 border-transparent bg-transparent px-3 text-xs font-semibold text-slate-500 outline-none transition-all",
                                "data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:text-slate-900",
                              )}
                            >
                              <tab.icon
                                className={cn(
                                  "h-4 w-4 stroke-[2px]",
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
                      </div>
                    </Tabs>
                  </div>
                </div>

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
                          invoice={invoice}
                          onViewDetails={() => handleViewDetails(invoice)}
                        />
                      ))}

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
                    <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                      <FileText className="mb-4 h-12 w-12 opacity-20" />
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
