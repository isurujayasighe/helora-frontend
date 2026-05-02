import { useMemo, useState } from "react";
import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { AnimatePresence, motion } from "framer-motion";
import { fadeUp } from "@/components/motions/MotionFade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  CheckCheck,
  ChevronDown,
  Eye,
  MessageCircle,
  MoreVertical,
  RefreshCw,
  Search,
  Send,
  Smartphone,
} from "lucide-react";
import type {
  WhatsAppMessage,
  WhatsAppMessageDirection,
  WhatsAppMessageStatus,
  WhatsAppMessageType,
} from "./types/whatsapp.types";
import {
  useRetryWhatsAppMessage,
  useWhatsAppMessagesQuery,
} from "./api/whatsapp-api";
import { WhatsAppMessageStatusBadge } from "./components/whatsapp-message-status-badge";
import { WhatsAppMessageTypeBadge } from "./components/whatsapp-message-type-badge";
import { WhatsAppMessageDetailsDialog } from "./components/whatsapp-message-detail-dialog";

type StatusFilter = "ALL" | WhatsAppMessageStatus;
type TypeFilter = "ALL" | WhatsAppMessageType;
type DirectionFilter = "ALL" | WhatsAppMessageDirection;

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: "ALL", label: "All status" },
  { value: "PENDING", label: "Waiting" },
  { value: "SENT", label: "Sent" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "READ", label: "Read" },
  { value: "FAILED", label: "Failed" },
];

const typeFilters: Array<{ value: TypeFilter; label: string }> = [
  { value: "ALL", label: "All message types" },
  { value: "ORDER_CREATED", label: "Order Created" },
  { value: "ORDER_READY", label: "Order Ready" },
  { value: "PAYMENT_RECEIVED", label: "Payment Received" },
  { value: "PAYMENT_REMINDER", label: "Payment Reminder" },
  { value: "GENERAL", label: "General" },
];

const directionFilters: Array<{ value: DirectionFilter; label: string }> = [
  { value: "ALL", label: "All directions" },
  { value: "OUTBOUND", label: "Sent to customer" },
  { value: "INBOUND", label: "Received from customer" },
];

export default function WhatsAppPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [directionFilter, setDirectionFilter] =
    useState<DirectionFilter>("ALL");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] =
    useState<WhatsAppMessage | null>(null);

  const { data, isLoading, isRefetching, refetch } = useWhatsAppMessagesQuery({
    pageIndex,
    pageSize,
    search,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    type: typeFilter === "ALL" ? undefined : typeFilter,
    direction: directionFilter === "ALL" ? undefined : directionFilter,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const retryMessage = useRetryWhatsAppMessage();

  const messages = data?.items ?? [];
  const pagination = data?.pagination;
  const total = pagination?.totalItems ?? 0;
  const pageCount = Math.max(1, pagination?.totalPages ?? 1);

  const stats = useMemo(() => {
    const sent = messages.filter((item) =>
      ["SENT", "DELIVERED", "READ"].includes(item.status)
    ).length;

    const delivered = messages.filter(
      (item) => item.status === "DELIVERED" || item.status === "READ"
    ).length;

    const failed = messages.filter((item) => item.status === "FAILED").length;

    const waiting = messages.filter((item) => item.status === "PENDING").length;

    return {
      total,
      sent,
      delivered,
      failed,
      waiting,
    };
  }, [messages, total]);

  const openDetails = (message: WhatsAppMessage) => {
    setSelectedMessage(message);
    setDetailsOpen(true);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setDirectionFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setPageIndex(0);
  };

  const handleRetry = async (message: WhatsAppMessage) => {
    await retryMessage.mutateAsync(message.id);
    await refetch();
  };

  return (
    <PermissionGate action="read" subject="Dashboard">
      <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50/60">
        <AnimatePresence mode="wait">
          <motion.div
            key="helora-whatsapp"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex h-full flex-col gap-4 p-3 md:p-5"
          >
            <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                  <Smartphone className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl font-black tracking-tight text-slate-950 md:text-2xl">
                    WhatsApp Messages
                  </h1>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    View customer messages, delivery status, and failed message
                    attempts.
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading || isRefetching}
                className="h-9 rounded-lg bg-white font-bold"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    isRefetching ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <WhatsAppStatCard
                title="Total Messages"
                value={stats.total}
                description="All message records"
                icon={MessageCircle}
              />

              <WhatsAppStatCard
                title="Sent"
                value={stats.sent}
                description="Sent, delivered, or read"
                icon={Send}
              />

              <WhatsAppStatCard
                title="Delivered"
                value={stats.delivered}
                description="Reached customer phone"
                icon={CheckCheck}
              />

              <WhatsAppStatCard
                title="Failed"
                value={stats.failed}
                description="Need checking or retry"
                icon={AlertTriangle}
              />
            </div>

            <Card className="rounded-lg border-slate-200 shadow-sm">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="grid w-full gap-3 md:grid-cols-[1fr_180px_180px] xl:max-w-4xl">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        value={search}
                        onChange={(event) => {
                          setSearch(event.target.value);
                          setPageIndex(0);
                        }}
                        placeholder="Search customer, phone, order number, message..."
                        className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-9 font-semibold shadow-none focus-visible:bg-white"
                      />
                    </div>

                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(event) => {
                        setDateFrom(event.target.value);
                        setPageIndex(0);
                      }}
                      className="h-10 rounded-lg border-slate-200 bg-slate-50 font-semibold shadow-none focus-visible:bg-white"
                    />

                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(event) => {
                        setDateTo(event.target.value);
                        setPageIndex(0);
                      }}
                      className="h-10 rounded-lg border-slate-200 bg-slate-50 font-semibold shadow-none focus-visible:bg-white"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <FilterDropdown
                      label="Status"
                      value={
                        statusFilters.find((item) => item.value === statusFilter)
                          ?.label ?? "Status"
                      }
                      items={statusFilters}
                      onSelect={(value) => {
                        setStatusFilter(value as StatusFilter);
                        setPageIndex(0);
                      }}
                    />

                    <FilterDropdown
                      label="Type"
                      value={
                        typeFilters.find((item) => item.value === typeFilter)
                          ?.label ?? "Type"
                      }
                      items={typeFilters}
                      onSelect={(value) => {
                        setTypeFilter(value as TypeFilter);
                        setPageIndex(0);
                      }}
                    />

                    <FilterDropdown
                      label="Direction"
                      value={
                        directionFilters.find(
                          (item) => item.value === directionFilter
                        )?.label ?? "Direction"
                      }
                      items={directionFilters}
                      onSelect={(value) => {
                        setDirectionFilter(value as DirectionFilter);
                        setPageIndex(0);
                      }}
                    />

                    {(search ||
                      statusFilter !== "ALL" ||
                      typeFilter !== "ALL" ||
                      directionFilter !== "ALL" ||
                      dateFrom ||
                      dateTo) && (
                      <Button
                        variant="ghost"
                        onClick={resetFilters}
                        className="h-10 rounded-lg font-bold text-slate-500 hover:text-slate-900"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-black text-slate-950">
                      Message Log
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm font-medium text-slate-500">
                      Check which WhatsApp messages were sent, delivered, read,
                      or failed.
                    </CardDescription>
                  </div>

                  <Badge
                    variant="outline"
                    className="hidden rounded-lg px-3 py-1 font-bold text-slate-600 sm:inline-flex"
                  >
                    {total} messages
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="min-h-0 flex-1 overflow-auto p-0">
                <WhatsAppMessageTable
                  messages={messages}
                  isLoading={isLoading}
                  onView={openDetails}
                  onRetry={handleRetry}
                  isRetrying={retryMessage.isPending}
                />
              </CardContent>

              <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3">
                <p className="text-sm font-semibold text-slate-500">
                  Page {pageIndex + 1} of {pageCount}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!pagination?.hasPreviousPage}
                    onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                    className="h-9 rounded-lg font-bold"
                  >
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    disabled={!pagination?.hasNextPage}
                    onClick={() => setPageIndex((prev) => prev + 1)}
                    className="h-9 rounded-lg font-bold"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <WhatsAppMessageDetailsDialog
          open={detailsOpen}
          message={selectedMessage}
          isRetrying={retryMessage.isPending}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedMessage(null);
          }}
          onRetry={handleRetry}
        />
      </div>
    </PermissionGate>
  );
}

function WhatsAppStatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              {value}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              {description}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterDropdown({
  label,
  value,
  items,
  onSelect,
}: {
  label: string;
  value: string;
  items: Array<{ value: string; label: string }>;
  onSelect: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10 rounded-lg bg-white font-bold">
          {label}
          <Badge
            variant="secondary"
            className="ml-2 rounded-lg bg-slate-100 text-slate-700"
          >
            {value}
          </Badge>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {items.map((item) => (
          <DropdownMenuItem key={item.value} onClick={() => onSelect(item.value)}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function WhatsAppMessageTable({
  messages,
  isLoading,
  isRetrying,
  onView,
  onRetry,
}: {
  messages: WhatsAppMessage[];
  isLoading: boolean;
  isRetrying?: boolean;
  onView: (message: WhatsAppMessage) => void;
  onRetry: (message: WhatsAppMessage) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-3 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-lg bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="flex h-80 flex-col items-center justify-center p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <MessageCircle className="h-7 w-7" />
        </div>

        <h3 className="mt-4 text-lg font-black text-slate-950">
          No WhatsApp messages found
        </h3>
        <p className="mt-1 max-w-md text-sm font-medium text-slate-500">
          Messages will appear here after Helora sends order updates, payment
          messages, or reminders.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-287.5">
      <div className="grid grid-cols-[1.2fr_1fr_1.5fr_1fr_1fr_1fr_70px] border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-400">
        <div>Customer</div>
        <div>Phone</div>
        <div>Message</div>
        <div>Type</div>
        <div>Status</div>
        <div>Created</div>
        <div />
      </div>

      {messages.map((message) => {
        const customerName = message.customer?.fullName || "Unknown customer";
        const orderNumber = message.order?.orderNumber;

        return (
          <div
            key={message.id}
            className="grid grid-cols-[1.2fr_1fr_1.5fr_1fr_1fr_1fr_70px] items-center border-b border-slate-100 px-4 py-3 transition hover:bg-slate-50"
          >
            <button
              type="button"
              onClick={() => onView(message)}
              className="min-w-0 text-left"
            >
              <p className="truncate font-black text-slate-950">
                {customerName}
              </p>
              <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                {orderNumber ? `Order ${orderNumber}` : "No order linked"}
              </p>
            </button>

            <div>
              <p className="font-bold text-slate-800">{message.phoneNumber}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {message.direction === "OUTBOUND"
                  ? "Sent to customer"
                  : "Received"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onView(message)}
              className="min-w-0 text-left"
            >
              <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-700">
                {message.message}
              </p>

              {message.status === "FAILED" && message.errorMessage && (
                <p className="mt-1 truncate text-xs font-bold text-red-600">
                  {message.errorMessage}
                </p>
              )}
            </button>

            <WhatsAppMessageTypeBadge type={message.type} />

            <WhatsAppMessageStatusBadge status={message.status} />

            <div>
              <p className="font-bold text-slate-800">
                {formatDate(message.createdAt)}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {formatTime(message.createdAt)}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(message)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>

                {message.status === "FAILED" && (
                  <DropdownMenuItem
                    disabled={isRetrying}
                    onClick={() => onRetry(message)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-LK", {
    hour: "2-digit",
    minute: "2-digit",
  });
}