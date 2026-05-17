import { useMemo, useState } from "react";
import {
  BadgeDollarSign,
  BookOpen,
  Calculator,
  FileSpreadsheet,
  Gauge,
  MoreVertical,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
  Shirt,
  Tags,
} from "lucide-react";

import { PermissionGate } from "@/auth/rbac/PermissionGate";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  useArchivePriceBook,
  useDeactivatePriceChart,
  useDeactivatePriceRule,
  useGarmentSetsQuery,
  usePreviewPrice,
  usePriceBooksQuery,
  usePriceChartsQuery,
  usePriceRulesQuery,
} from "./api/pricing-api";
import type {
  PreviewPricePayload,
  PriceBook,
  PriceBookStatus,
  PriceChart,
  PriceRule,
  PricingMethod,
  PricingScope,
} from "./types/pricing.types";
import { PriceBookFormDialog } from "./components/price-book-form-dialog";
import { PriceRuleFormDialog } from "./components/price-rule-form-dialog";
import { PriceChartFormDialog } from "./components/price-chart-form-dialog";
import { PricingConfirmDialog } from "./components/pricing-confirm-dialog";

const statusOptions: Array<{ value: PriceBookStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All price books" },
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "ARCHIVED", label: "Archived" },
];

const methodOptions: Array<{ value: PricingMethod | "ALL"; label: string }> = [
  { value: "ALL", label: "All methods" },
  { value: "FIXED", label: "Fixed" },
  { value: "CHART", label: "Measurement chart" },
  { value: "SUM_OF_ITEMS", label: "Sum of items" },
  { value: "MANUAL", label: "Manual" },
  { value: "FREE", label: "Free" },
];

const scopeOptions: Array<{ value: PricingScope; label: string }> = [
  { value: "PACKAGE", label: "Full kit" },
  { value: "PACKAGE_ITEM", label: "Package item" },
  { value: "ADDITIONAL_ITEM", label: "Extra item" },
  { value: "STANDALONE_ITEM", label: "Standalone item" },
];

export default function PricingPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PriceBookStatus | "ALL">("ALL");
  const [method, setMethod] = useState<PricingMethod | "ALL">("ALL");
  const [priceBookDialogOpen, setPriceBookDialogOpen] = useState(false);
  const [priceRuleDialogOpen, setPriceRuleDialogOpen] = useState(false);
  const [priceChartDialogOpen, setPriceChartDialogOpen] = useState(false);
  const [editingPriceBook, setEditingPriceBook] = useState<PriceBook | null>(
    null,
  );
  const [editingPriceRule, setEditingPriceRule] = useState<PriceRule | null>(
    null,
  );
  const [editingPriceChart, setEditingPriceChart] = useState<PriceChart | null>(
    null,
  );
  const [archivingPriceBook, setArchivingPriceBook] =
    useState<PriceBook | null>(null);
  const [deactivatingPriceRule, setDeactivatingPriceRule] =
    useState<PriceRule | null>(null);
  const [deactivatingPriceChart, setDeactivatingPriceChart] =
    useState<PriceChart | null>(null);

  const bookParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: status === "ALL" ? undefined : status,
    }),
    [search, status],
  );

  const ruleParams = useMemo(
    () => ({
      method: method === "ALL" ? undefined : method,
    }),
    [method],
  );

  const priceBooksQuery = usePriceBooksQuery(bookParams);
  const priceRulesQuery = usePriceRulesQuery(ruleParams);
  const chartRulesQuery = usePriceRulesQuery({
    method: "CHART",
    isActive: true,
  });
  const priceChartsQuery = usePriceChartsQuery();
  const garmentSetsQuery = useGarmentSetsQuery({ isActive: true });
  const archivePriceBook = useArchivePriceBook();
  const deactivatePriceRule = useDeactivatePriceRule();
  const deactivatePriceChart = useDeactivatePriceChart();

  const priceBooks = priceBooksQuery.data ?? [];
  const priceRules = priceRulesQuery.data ?? [];
  const chartPriceRules = chartRulesQuery.data ?? [];
  const priceCharts = priceChartsQuery.data ?? [];
  const garmentSets = garmentSetsQuery.data ?? [];

  const stats = useMemo(
    () => ({
      activeBooks: priceBooks.filter((book) => book.status === "ACTIVE").length,
      totalRules: priceRules.length,
      chartRules: priceRules.filter((rule) => rule.method === "CHART").length,
      chartCells: priceCharts.reduce(
        (sum, chart) => sum + (chart.cells?.length ?? 0),
        0,
      ),
    }),
    [priceBooks, priceRules, priceCharts],
  );

  const refreshAll = () => {
    priceBooksQuery.refetch();
    priceRulesQuery.refetch();
    chartRulesQuery.refetch();
    priceChartsQuery.refetch();
    garmentSetsQuery.refetch();
  };

  const isRefreshing =
    priceBooksQuery.isFetching ||
    priceRulesQuery.isFetching ||
    chartRulesQuery.isFetching ||
    priceChartsQuery.isFetching ||
    garmentSetsQuery.isFetching;

  const openCreatePriceBook = () => {
    setEditingPriceBook(null);
    setPriceBookDialogOpen(true);
  };

  const openCreatePriceRule = () => {
    setEditingPriceRule(null);
    setPriceRuleDialogOpen(true);
  };

  const openCreatePriceChart = () => {
    setEditingPriceChart(null);
    setPriceChartDialogOpen(true);
  };

  return (
    <PermissionGate action="read" subject="settings">
      <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50/60">
        <div className="flex h-full flex-col gap-4 overflow-auto p-3 md:p-5">
          <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                <BadgeDollarSign className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">
                  Pricing Setup
                </h1>
                <p className="mt-1 text-sm font-normal text-slate-500">
                  Set garment prices for full kits, extra items, and measurement
                  charts.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-9 rounded-lg bg-white">
                    <Calculator className="mr-2 h-4 w-4" />
                    Preview Help
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-lg border-slate-200 sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Pricing preview</DialogTitle>
                    <DialogDescription>
                      Use an existing price book, package item, and measurement
                      record to test how Helora will price a garment line.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    Fixed rules use the configured fixed price. Chart rules read
                    the linked measurement values and match the correct price
                    range. Manual rules need a manager reason.
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                onClick={refreshAll}
                disabled={isRefreshing}
                className="h-9 rounded-lg bg-white"
              >
                <RefreshCw
                  className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")}
                />
                Refresh
              </Button>
              <Button onClick={openCreatePriceBook} className="h-9 rounded-lg">
                <Plus className="mr-2 h-4 w-4" />
                Price Book
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <PricingStatCard
              title="Active Books"
              value={stats.activeBooks}
              description="Ready for order pricing"
              icon={BookOpen}
            />
            <PricingStatCard
              title="Price Rules"
              value={stats.totalRules}
              description="Fixed, chart, manual, and free"
              icon={Gauge}
            />
            <PricingStatCard
              title="Chart Rules"
              value={stats.chartRules}
              description="Using measurement ranges"
              icon={FileSpreadsheet}
            />
            <PricingStatCard
              title="Chart Cells"
              value={stats.chartCells}
              description="Saved price ranges"
              icon={Tags}
            />
          </div>

          <Card className="rounded-lg border-slate-200 bg-white">
            <CardContent className="p-3 md:p-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto] lg:items-end">
                <div className="grid gap-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Search price books
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search book name or description"
                      className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-9 shadow-none focus-visible:bg-white"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Book status
                  </Label>
                  <FilterSelect
                    value={status}
                    items={statusOptions}
                    onValueChange={(value) =>
                      setStatus(value as PriceBookStatus | "ALL")
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Rule method
                  </Label>
                  <FilterSelect
                    value={method}
                    items={methodOptions}
                    onValueChange={(value) =>
                      setMethod(value as PricingMethod | "ALL")
                    }
                  />
                </div>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearch("");
                    setStatus("ALL");
                    setMethod("ALL");
                  }}
                  className="h-10 rounded-lg text-slate-500 hover:text-slate-900"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="min-h-0">
            <TabsList className="h-auto flex-wrap justify-start rounded-lg border border-slate-200 bg-white p-1">
              <TabsTrigger value="overview" className="rounded-lg">
                Overview
              </TabsTrigger>
              <TabsTrigger value="books" className="rounded-lg">
                Price Books
              </TabsTrigger>
              <TabsTrigger value="rules" className="rounded-lg">
                Price Rules
              </TabsTrigger>
              <TabsTrigger value="charts" className="rounded-lg">
                Price Charts
              </TabsTrigger>
              <TabsTrigger value="preview" className="rounded-lg">
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="grid min-h-0 gap-4">
                  <PriceBooksSection
                    priceBooks={priceBooks.slice(0, 5)}
                    isLoading={priceBooksQuery.isLoading}
                    onCreate={openCreatePriceBook}
                    onEdit={(book) => {
                      setEditingPriceBook(book);
                      setPriceBookDialogOpen(true);
                    }}
                    onArchive={setArchivingPriceBook}
                  />
                  <PriceRulesSection
                    priceRules={priceRules.slice(0, 5)}
                    isLoading={priceRulesQuery.isLoading}
                    onCreate={openCreatePriceRule}
                    onEdit={(rule) => {
                      setEditingPriceRule(rule);
                      setPriceRuleDialogOpen(true);
                    }}
                    onDeactivate={setDeactivatingPriceRule}
                  />
                  <PriceChartsSection
                    priceCharts={priceCharts.slice(0, 5)}
                    isLoading={priceChartsQuery.isLoading}
                    onCreate={openCreatePriceChart}
                    onEdit={(chart) => {
                      setEditingPriceChart(chart);
                      setPriceChartDialogOpen(true);
                    }}
                    onDeactivate={setDeactivatingPriceChart}
                  />
                </div>

                <PricingPreviewPanel priceBooks={priceBooks} />
              </div>
            </TabsContent>

            <TabsContent value="books" className="mt-4">
              <PriceBooksSection
                priceBooks={priceBooks}
                isLoading={priceBooksQuery.isLoading}
                onCreate={openCreatePriceBook}
                onEdit={(book) => {
                  setEditingPriceBook(book);
                  setPriceBookDialogOpen(true);
                }}
                onArchive={setArchivingPriceBook}
              />
            </TabsContent>

            <TabsContent value="rules" className="mt-4">
              <PriceRulesSection
                priceRules={priceRules}
                isLoading={priceRulesQuery.isLoading}
                onCreate={openCreatePriceRule}
                onEdit={(rule) => {
                  setEditingPriceRule(rule);
                  setPriceRuleDialogOpen(true);
                }}
                onDeactivate={setDeactivatingPriceRule}
              />
            </TabsContent>

            <TabsContent value="charts" className="mt-4">
              <PriceChartsSection
                priceCharts={priceCharts}
                isLoading={priceChartsQuery.isLoading}
                onCreate={openCreatePriceChart}
                onEdit={(chart) => {
                  setEditingPriceChart(chart);
                  setPriceChartDialogOpen(true);
                }}
                onDeactivate={setDeactivatingPriceChart}
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-4 max-w-xl">
              <PricingPreviewPanel priceBooks={priceBooks} />
            </TabsContent>
          </Tabs>
        </div>

        <PriceBookFormDialog
          open={priceBookDialogOpen}
          priceBook={editingPriceBook}
          onOpenChange={(open) => {
            setPriceBookDialogOpen(open);
            if (!open) setEditingPriceBook(null);
          }}
        />
        <PriceRuleFormDialog
          open={priceRuleDialogOpen}
          priceRule={editingPriceRule}
          priceBooks={priceBooks}
          garmentSets={garmentSets}
          onOpenChange={(open) => {
            setPriceRuleDialogOpen(open);
            if (!open) setEditingPriceRule(null);
          }}
        />
        <PriceChartFormDialog
          open={priceChartDialogOpen}
          priceChart={editingPriceChart}
          priceRules={chartPriceRules}
          onOpenChange={(open) => {
            setPriceChartDialogOpen(open);
            if (!open) setEditingPriceChart(null);
          }}
        />
        <PricingConfirmDialog
          open={Boolean(archivingPriceBook)}
          title="Archive price book?"
          description="This will hide the price book from new pricing calculations, but existing orders will keep their saved prices."
          actionLabel="Archive"
          isPending={archivePriceBook.isPending}
          onOpenChange={(open) => !open && setArchivingPriceBook(null)}
          onConfirm={async () => {
            if (!archivingPriceBook) return;
            await archivePriceBook.mutateAsync(archivingPriceBook.id);
            setArchivingPriceBook(null);
          }}
        />
        <PricingConfirmDialog
          open={Boolean(deactivatingPriceRule)}
          title="Deactivate price rule?"
          description="This rule will no longer be used for new price calculations. Existing order pricing snapshots will not change."
          actionLabel="Deactivate"
          isPending={deactivatePriceRule.isPending}
          onOpenChange={(open) => !open && setDeactivatingPriceRule(null)}
          onConfirm={async () => {
            if (!deactivatingPriceRule) return;
            await deactivatePriceRule.mutateAsync(deactivatingPriceRule.id);
            setDeactivatingPriceRule(null);
          }}
        />
        <PricingConfirmDialog
          open={Boolean(deactivatingPriceChart)}
          title="Deactivate price chart?"
          description="This chart will no longer be used for new price calculations. Existing order pricing snapshots will not change."
          actionLabel="Deactivate"
          isPending={deactivatePriceChart.isPending}
          onOpenChange={(open) => !open && setDeactivatingPriceChart(null)}
          onConfirm={async () => {
            if (!deactivatingPriceChart) return;
            await deactivatePriceChart.mutateAsync(deactivatingPriceChart.id);
            setDeactivatingPriceChart(null);
          }}
        />
      </div>
    </PermissionGate>
  );
}

function PricingStatCard({
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
    <Card className="rounded-lg border-slate-200 bg-white">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>
            <p className="mt-1 text-xs font-normal text-slate-400">
              {description}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSelect({
  value,
  items,
  onValueChange,
}: {
  value: string;
  items: Array<{ value: string; label: string }>;
  onValueChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 bg-white shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-lg">
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function PriceBooksSection({
  priceBooks,
  isLoading,
  onCreate,
  onEdit,
  onArchive,
}: {
  priceBooks: PriceBook[];
  isLoading: boolean;
  onCreate: () => void;
  onEdit: (priceBook: PriceBook) => void;
  onArchive: (priceBook: PriceBook) => void;
}) {
  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 bg-white">
      <CardHeader className="border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-slate-950">
              Price Books
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Seasonal or active garment price lists.
            </CardDescription>
          </div>
          <Button onClick={onCreate} className="h-9 rounded-lg">
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <SimpleTableState
          isLoading={isLoading}
          isEmpty={!priceBooks.length}
          emptyTitle="No price books found"
          emptyDescription="Create your first price book to start setting garment prices."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Effective Dates</TableHead>
                <TableHead>Rules</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <p className="font-medium text-slate-900">{book.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {book.description || "No description"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={book.status} />
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {formatDate(book.effectiveFrom)} -{" "}
                    {formatDate(book.effectiveTo)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {book._count?.rules ?? book.rules?.length ?? "-"}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {formatDate(book.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <RowActions
                      onEdit={() => onEdit(book)}
                      onDeactivate={() => onArchive(book)}
                      deactivateLabel="Archive"
                      disabled={book.status === "ARCHIVED"}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SimpleTableState>
      </CardContent>
    </Card>
  );
}

function PriceRulesSection({
  priceRules,
  isLoading,
  onCreate,
  onEdit,
  onDeactivate,
}: {
  priceRules: PriceRule[];
  isLoading: boolean;
  onCreate: () => void;
  onEdit: (priceRule: PriceRule) => void;
  onDeactivate: (priceRule: PriceRule) => void;
}) {
  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 bg-white">
      <CardHeader className="border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-slate-950">
              Price Rules
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              How Helora prices full kits, package items, and extra pieces.
            </CardDescription>
          </div>
          <Button onClick={onCreate} className="h-9 rounded-lg">
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <SimpleTableState
          isLoading={isLoading}
          isEmpty={!priceRules.length}
          emptyTitle="No price rules found"
          emptyDescription="Add a price rule for a full kit, item, or extra item."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <p className="font-medium text-slate-900">
                      {rule.packageTemplateItem?.itemDescription ||
                        rule.packageTemplate?.name ||
                        rule.priceBook?.name ||
                        "Pricing rule"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {rule.measurementKeys?.length
                        ? `${rule.measurementKeys.length} measurement keys`
                        : rule.notes || "No notes"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-lg">
                      {labelize(rule.scope)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="rounded-lg bg-slate-900 text-white">
                      {labelize(rule.method)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-slate-800">
                    {rule.fixedPrice ? money(rule.fixedPrice) : "-"}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {rule.priority}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "rounded-lg",
                        rule.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {rule.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <RowActions
                      onEdit={() => onEdit(rule)}
                      onDeactivate={() => onDeactivate(rule)}
                      deactivateLabel="Deactivate"
                      disabled={!rule.isActive}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SimpleTableState>
      </CardContent>
    </Card>
  );
}

function PriceChartsSection({
  priceCharts,
  isLoading,
  onCreate,
  onEdit,
  onDeactivate,
}: {
  priceCharts: PriceChart[];
  isLoading: boolean;
  onCreate: () => void;
  onEdit: (priceChart: PriceChart) => void;
  onDeactivate: (priceChart: PriceChart) => void;
}) {
  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 bg-white">
      <CardHeader className="border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-slate-950">
              Price Charts
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Measurement ranges and prices used by chart rules.
            </CardDescription>
          </div>
          <Button onClick={onCreate} className="h-9 rounded-lg">
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <SimpleTableState
          isLoading={isLoading}
          isEmpty={!priceCharts.length}
          emptyTitle="No price charts found"
          emptyDescription="Create a chart when a price depends on measurements like bust or hip."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rule Method</TableHead>
                <TableHead>Cells</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceCharts.map((chart) => (
                <TableRow key={chart.id}>
                  <TableCell>
                    <p className="font-medium text-slate-900">{chart.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {chart.description || "No description"}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {chart.priceRule?.method
                      ? labelize(chart.priceRule.method)
                      : "-"}
                  </TableCell>
                  <TableCell className="font-medium text-slate-800">
                    {chart.cells?.length ?? 0}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "rounded-lg",
                        chart.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {chart.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {formatDate(chart.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <RowActions
                      onEdit={() => onEdit(chart)}
                      onDeactivate={() => onDeactivate(chart)}
                      deactivateLabel="Deactivate"
                      disabled={!chart.isActive}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SimpleTableState>
      </CardContent>
    </Card>
  );
}

function RowActions({
  onEdit,
  onDeactivate,
  deactivateLabel,
  disabled,
}: {
  onEdit: () => void;
  onDeactivate: () => void;
  deactivateLabel: string;
  disabled?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-lg">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={disabled}
          onClick={onDeactivate}
          className="text-red-600 focus:text-red-600"
        >
          {deactivateLabel === "Archive" ? (
            <BookOpen className="mr-2 h-4 w-4" />
          ) : (
            <Power className="mr-2 h-4 w-4" />
          )}
          {deactivateLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PricingPreviewPanel({ priceBooks }: { priceBooks: PriceBook[] }) {
  const previewPrice = usePreviewPrice();
  const activeBook = priceBooks.find((book) => book.status === "ACTIVE");
  const [priceBookId, setPriceBookId] = useState("");
  const [packageTemplateId, setPackageTemplateId] = useState("");
  const [garmentSetId, setGarmentSetId] = useState("");
  const [measurementId, setMeasurementId] = useState("");
  const [packageTemplateItemId, setPackageTemplateItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [scope, setScope] = useState<PricingScope>("PACKAGE_ITEM");
  const [manualUnitPrice, setManualUnitPrice] = useState("");
  const [manualOverrideReason, setManualOverrideReason] = useState("");

  const selectedBookId = priceBookId || activeBook?.id || "";

  const runPreview = async () => {
    const line: PreviewPricePayload["lines"][number] = {
      packageTemplateItemId: packageTemplateItemId || undefined,
      quantity: Math.max(1, Number(quantity) || 1),
      scope,
      manualUnitPrice: manualUnitPrice ? Number(manualUnitPrice) : undefined,
      manualOverrideReason: manualOverrideReason || undefined,
    };

    await previewPrice.mutateAsync({
      priceBookId: selectedBookId || undefined,
      packageTemplateId: packageTemplateId || undefined,
      garmentSetId: garmentSetId || undefined,
      measurementId: measurementId || undefined,
      lines: [line],
    });
  };

  return (
    <Card className="h-fit rounded-lg border-slate-200 bg-white xl:sticky xl:top-0">
      <CardHeader className="border-b border-slate-100 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-slate-950">
              Pricing Preview
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-slate-500">
              Test one garment line before using it in an order.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="grid gap-2">
          <Label>Price book</Label>
          <Select value={selectedBookId} onValueChange={setPriceBookId}>
            <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 bg-white shadow-none">
              <SelectValue placeholder="Use active price book" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              {priceBooks.map((book) => (
                <SelectItem key={book.id} value={book.id}>
                  {book.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <PreviewInput
          label="Package template ID"
          value={packageTemplateId}
          onChange={setPackageTemplateId}
          placeholder="Optional full kit ID"
        />
        <PreviewInput
          label="Garment set ID"
          value={garmentSetId}
          onChange={setGarmentSetId}
          placeholder="Optional garment set ID"
        />
        <PreviewInput
          label="Measurement ID"
          value={measurementId}
          onChange={setMeasurementId}
          placeholder="Required for chart pricing"
        />
        <PreviewInput
          label="Package item ID"
          value={packageTemplateItemId}
          onChange={setPackageTemplateItemId}
          placeholder="Blouse, Trouser, Cap, Extra Trouser"
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="h-10 rounded-lg border-slate-200 bg-slate-50 shadow-none focus-visible:bg-white"
            />
          </div>
          <div className="grid gap-2">
            <Label>Scope</Label>
            <Select
              value={scope}
              onValueChange={(value) => setScope(value as PricingScope)}
            >
              <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 bg-white shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                {scopeOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <PreviewInput
            label="Manual price"
            value={manualUnitPrice}
            onChange={setManualUnitPrice}
            placeholder="Only for manual rules"
            type="number"
          />
          <PreviewInput
            label="Override reason"
            value={manualOverrideReason}
            onChange={setManualOverrideReason}
            placeholder="Manager approval"
          />
        </div>

        <Button
          onClick={runPreview}
          disabled={previewPrice.isPending}
          className="h-10 w-full rounded-lg"
        >
          <Calculator className="mr-2 h-4 w-4" />
          {previewPrice.isPending ? "Calculating..." : "Calculate Price"}
        </Button>

        {previewPrice.data && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">
                Preview total
              </p>
              <p className="text-lg font-semibold text-slate-950">
                {money(previewPrice.data.totalAmount)}
              </p>
            </div>
            <div className="mt-3 space-y-2">
              {previewPrice.data.lines.map((line, index) => (
                <div
                  key={`${line.packageTemplateItemId ?? "line"}-${index}`}
                  className="rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">
                        {line.description}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {labelize(line.pricingMethod)} via{" "}
                        {labelize(line.priceSource)}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-950">
                      {money(line.lineTotal)}
                    </p>
                  </div>
                  {line.warnings.length > 0 && (
                    <div className="mt-2 text-xs text-amber-700">
                      {line.warnings.join(" ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PreviewInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "number";
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-lg border-slate-200 bg-slate-50 shadow-none focus-visible:bg-white"
      />
    </div>
  );
}

function SimpleTableState({
  children,
  isLoading,
  isEmpty,
  emptyTitle,
  emptyDescription,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  isEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-3 p-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-14 animate-pulse rounded-lg bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex min-h-52 flex-col items-center justify-center p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Shirt className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-950">
          {emptyTitle}
        </h3>
        <p className="mt-1 max-w-md text-sm text-slate-500">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return <div className="overflow-auto">{children}</div>;
}

function StatusBadge({ status }: { status: PriceBookStatus }) {
  const className =
    status === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700"
      : status === "DRAFT"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-600";

  return (
    <Badge variant="secondary" className={cn("rounded-lg", className)}>
      {labelize(status)}
    </Badge>
  );
}

function labelize(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(value?: string | null) {
  if (!value) return "Open";

  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function money(value: string | number) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return `LKR ${value}`;
  }

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(amount);
}
