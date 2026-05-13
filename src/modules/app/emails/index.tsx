import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  MessageCircle,
  MoreVertical,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
} from "lucide-react";

import { PermissionGate } from "@/auth/rbac/PermissionGate";
import { fadeUp } from "@/components/motions/MotionFade";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useEmailLogsQuery,
  useResendEmail,
  useSendEmail,
} from "./api/email-api";
import { EmailDetailDialog } from "./components/email-detail-dialog";
import { EmailStatusBadge } from "./components/email-status-badge";
import { SendEmailDialog } from "./components/send-email-dialog";
import type {
  EmailLog,
  EmailRelatedEntityType,
  EmailStatus,
} from "./types/email.types";

type StatusFilter = "ALL" | EmailStatus;
type EntityFilter = "ALL" | EmailRelatedEntityType;

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: "ALL", label: "All status" },
  { value: "PENDING", label: "Pending" },
  { value: "SENT", label: "Sent" },
  { value: "FAILED", label: "Failed" },
];

const entityFilters: Array<{ value: EntityFilter; label: string }> = [
  { value: "ALL", label: "All entities" },
  { value: "ORDER", label: "Orders" },
  { value: "PAYMENT", label: "Payments" },
  { value: "CUSTOMER", label: "Customers" },
  { value: "USER", label: "Users" },
  { value: "GROUP_ORDER", label: "Group Orders" },
  { value: "OTHER", label: "Other" },
];

export default function EmailsPage() {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [entityFilter, setEntityFilter] = useState<EntityFilter>("ALL");
  const [relatedEntityId, setRelatedEntityId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [composeOpen, setComposeOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);

  const { data, isLoading, isRefetching, refetch } = useEmailLogsQuery({
    pageIndex,
    pageSize,
    recipientEmail: recipientEmail || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    relatedEntityType: entityFilter === "ALL" ? undefined : entityFilter,
    relatedEntityId: relatedEntityId || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const sendEmail = useSendEmail();
  const resendEmail = useResendEmail();

  const emails = data?.items ?? [];
  const pagination = data?.pagination;
  const total = pagination?.totalItems ?? 0;
  const pageCount = Math.max(1, pagination?.totalPages ?? 1);

  const stats = useMemo(() => {
    return {
      total,
      sent: emails.filter((email) => email.status === "SENT").length,
      pending: emails.filter((email) => email.status === "PENDING").length,
      failed: emails.filter((email) => email.status === "FAILED").length,
    };
  }, [emails, total]);

  const resetFilters = () => {
    setRecipientEmail("");
    setStatusFilter("ALL");
    setEntityFilter("ALL");
    setRelatedEntityId("");
    setFromDate("");
    setToDate("");
    setPageIndex(0);
  };

  const openDetails = (email: EmailLog) => {
    setSelectedEmail(email);
    setDetailsOpen(true);
  };

  const handleResend = async (email: EmailLog) => {
    await resendEmail.mutateAsync(email.id);
    await refetch();
  };

  return (
    <PermissionGate action="read" subject="emails">
      <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50/60">
        <AnimatePresence mode="wait">
          <motion.div
            key="helora-emails"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex h-full flex-col gap-4 p-3 md:p-5"
          >
            <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-black tracking-tight text-slate-950 md:text-2xl">
                    Email Messages
                  </h1>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Track transactional emails, delivery state, and provider
                    message IDs.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  asChild
                  className="h-9 rounded-lg bg-white font-bold"
                >
                  <Link to="/app/whatsapp">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Link>
                </Button>

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

                <PermissionGate action="create" subject="emails">
                  <Button
                    onClick={() => setComposeOpen(true)}
                    className="h-9 rounded-lg font-bold shadow-sm"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                </PermissionGate>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <EmailStatCard
                title="Total Emails"
                value={stats.total}
                description="All email records"
                icon={Mail}
              />
              <EmailStatCard
                title="Sent"
                value={stats.sent}
                description="Accepted by provider"
                icon={CheckCircle2}
              />
              <EmailStatCard
                title="Pending"
                value={stats.pending}
                description="Saved before send"
                icon={Send}
              />
              <EmailStatCard
                title="Failed"
                value={stats.failed}
                description="Needs checking"
                icon={AlertTriangle}
              />
            </div>

            <Card className="rounded-lg border-slate-200 shadow-sm">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="grid w-full gap-3 md:grid-cols-[1fr_180px_180px_180px] xl:max-w-5xl">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        value={recipientEmail}
                        onChange={(event) => {
                          setRecipientEmail(event.target.value);
                          setPageIndex(0);
                        }}
                        placeholder="Search recipient email..."
                        className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-9 font-semibold shadow-none focus-visible:bg-white"
                      />
                    </div>
                    <Input
                      value={relatedEntityId}
                      onChange={(event) => {
                        setRelatedEntityId(event.target.value);
                        setPageIndex(0);
                      }}
                      placeholder="Related entity ID"
                      className="h-10 rounded-lg border-slate-200 bg-slate-50 font-semibold shadow-none focus-visible:bg-white"
                    />
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(event) => {
                        setFromDate(event.target.value);
                        setPageIndex(0);
                      }}
                      className="h-10 rounded-lg border-slate-200 bg-slate-50 font-semibold shadow-none focus-visible:bg-white"
                    />
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(event) => {
                        setToDate(event.target.value);
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
                      label="Entity"
                      value={
                        entityFilters.find((item) => item.value === entityFilter)
                          ?.label ?? "Entity"
                      }
                      items={entityFilters}
                      onSelect={(value) => {
                        setEntityFilter(value as EntityFilter);
                        setPageIndex(0);
                      }}
                    />

                    {(recipientEmail ||
                      statusFilter !== "ALL" ||
                      entityFilter !== "ALL" ||
                      relatedEntityId ||
                      fromDate ||
                      toDate) && (
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
                      Email Log
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm font-medium text-slate-500">
                      Review transactional emails sent by Helora ERP.
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="hidden rounded-lg px-3 py-1 font-bold text-slate-600 sm:inline-flex"
                  >
                    {total} emails
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="min-h-0 flex-1 overflow-auto p-0">
                <EmailTable
                  emails={emails}
                  isLoading={isLoading}
                  isResending={resendEmail.isPending}
                  onView={openDetails}
                  onResend={handleResend}
                />
              </CardContent>

              <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
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
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!pagination?.hasNextPage}
                    onClick={() => setPageIndex((prev) => prev + 1)}
                    className="h-9 rounded-lg font-bold"
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <SendEmailDialog
          open={composeOpen}
          isPending={sendEmail.isPending}
          onOpenChange={setComposeOpen}
          onSend={(payload) => sendEmail.mutateAsync(payload)}
        />

        <EmailDetailDialog
          open={detailsOpen}
          email={selectedEmail}
          isResending={resendEmail.isPending}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedEmail(null);
          }}
          onResend={handleResend}
        />
      </div>
    </PermissionGate>
  );
}

function EmailStatCard({
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
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
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

function EmailTable({
  emails,
  isLoading,
  isResending,
  onView,
  onResend,
}: {
  emails: EmailLog[];
  isLoading: boolean;
  isResending?: boolean;
  onView: (email: EmailLog) => void;
  onResend: (email: EmailLog) => void;
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

  if (!emails.length) {
    return (
      <div className="flex h-80 flex-col items-center justify-center p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Mail className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-black text-slate-950">
          No email logs found
        </h3>
        <p className="mt-1 max-w-md text-sm font-medium text-slate-500">
          Emails will appear here after Helora sends order updates, receipts,
          statements, and reminders.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Recipient</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {emails.map((email) => (
          <TableRow
            key={email.id}
            className="cursor-pointer"
            onClick={() => onView(email)}
          >
            <TableCell>
              <p className="font-bold text-slate-900">{email.recipientEmail}</p>
              <p className="mt-1 text-xs text-slate-500">
                {email.cc?.length ? `CC ${email.cc.length}` : "Direct email"}
              </p>
            </TableCell>
            <TableCell className="max-w-100 truncate">{email.subject}</TableCell>
            <TableCell>
              {email.relatedEntityType ? (
                <Badge variant="outline" className="rounded-lg">
                  {email.relatedEntityType}
                </Badge>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell>
              <EmailStatusBadge status={email.status} />
            </TableCell>
            <TableCell>{email.provider}</TableCell>
            <TableCell>{formatDateTime(email.createdAt)}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(event) => {
                      event.stopPropagation();
                      onView(email);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={isResending}
                    onClick={(event) => {
                      event.stopPropagation();
                      onResend(email);
                    }}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Resend
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

