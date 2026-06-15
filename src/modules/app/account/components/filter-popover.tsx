import * as React from "react";
import { format, subDays, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, SlidersHorizontal, X } from "lucide-react";

interface FilterDialogProps {
  currentStatus: string;
  onStatusChange: (s: string) => void;
  onDateChange: (start?: string, end?: string) => void;
}

type DatePreset = "all" | "30days" | "6months" | "custom";

export function FilterDialog({
  currentStatus,
  onStatusChange,
  onDateChange,
}: FilterDialogProps) {
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [selectedPreset, setSelectedPreset] = React.useState<DatePreset>("all");

  const formatDateForApi = (date?: Date) =>
    date ? format(date, "yyyy-MM-dd") : undefined;

  const handlePreset = (preset: DatePreset) => {
    const end = new Date();

    if (preset === "all") {
      setSelectedPreset("all");
      setStartDate(undefined);
      setEndDate(undefined);
      return;
    }

    if (preset === "30days") {
      setSelectedPreset("30days");
      setStartDate(subDays(end, 30));
      setEndDate(end);
      return;
    }

    if (preset === "6months") {
      setSelectedPreset("6months");
      setStartDate(subMonths(end, 6));
      setEndDate(end);
      return;
    }
  };

  const handleStartDateChange = (date?: Date) => {
    setSelectedPreset("custom");
    setStartDate(date);
  };

  const handleEndDateChange = (date?: Date) => {
    setSelectedPreset("custom");
    setEndDate(date);
  };

  const handleApply = () => {
    if (selectedPreset === "all") {
      onDateChange(undefined, undefined);
      return;
    }

    onDateChange(formatDateForApi(startDate), formatDateForApi(endDate));
  };

  const handleReset = () => {
    onStatusChange("all");
    setSelectedPreset("all");
    setStartDate(undefined);
    setEndDate(undefined);
    onDateChange(undefined, undefined);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-8 w-8 shrink-0 gap-2 border-slate-200 px-3 font-medium text-slate-600 hover:bg-slate-50"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden text-xs xs:inline">Filter</span>
        </Button>
      </DialogTrigger>

      <DialogContent
        className="flex h-auto max-w-2xl flex-col overflow-hidden rounded-3xl border-none p-6 shadow-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold">Filter</DialogTitle>
          <DialogClose className="rounded-full bg-slate-50 p-2 transition-colors hover:bg-slate-100">
            <X className="h-4 w-4 text-slate-400" />
          </DialogClose>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div className="space-y-3">
            <h4 className="text-[13px] font-bold uppercase tracking-wide text-slate-400">
              Filter by Date Range
            </h4>

            <div className="flex flex-wrap gap-2">
              {[
                { label: "All", value: "all" as DatePreset },
                { label: "Last 30 Days", value: "30days" as DatePreset },
                { label: "Last 6 Months", value: "6months" as DatePreset },
              ].map((preset) => {
                const isActive = selectedPreset === preset.value;

                return (
                  <Button
                    key={preset.value}
                    variant={isActive ? "secondary" : "outline"}
                    className={cn(
                      "h-10 rounded-full px-4 text-sm",
                      isActive
                        ? "border-none bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50",
                    )}
                    onClick={() => handlePreset(preset.value)}
                  >
                    {preset.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator className="bg-slate-100" />

          <div className="space-y-3">
            <h4 className="text-[13px] font-bold uppercase tracking-wide text-slate-400">
              Custom Date Range
            </h4>

            <div className="flex gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-between h-12 rounded-xl border-slate-200 px-4 text-left font-normal",
                      !startDate && "text-slate-500",
                    )}
                  >
                    {startDate ? (
                      format(startDate, "PPP")
                    ) : (
                      <span>Start date</span>
                    )}
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto rounded-2xl border-slate-100 p-0 shadow-xl"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateChange}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-between h-12 rounded-xl border-slate-200 px-4 text-left font-normal",
                      !endDate && "text-slate-500",
                    )}
                  >
                    {endDate ? format(endDate, "PPP") : <span>End date</span>}
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto rounded-2xl border-slate-100 p-0 shadow-xl"
                  align="end"
                >
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDateChange}
                    disabled={(date) => (startDate ? date < startDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Separator className="bg-slate-100" />

          <div className="space-y-3">
            <h4 className="text-[13px] font-bold uppercase tracking-wide text-slate-400">
              Filter by Order Status
            </h4>

            <div className="flex flex-wrap gap-2">
              {[
                { label: "All", value: "all" },
                { label: "Outstanding", value: "OUTSTANDING" },
                { label: "Invoiced", value: "TOTAL_INVOICED" },
                { label: "Advances", value: "CUSTOMER_ADVANCES" },
              ].map((status) => (
                <Button
                  key={status.value}
                  variant={
                    currentStatus === status.value ? "secondary" : "outline"
                  }
                  onClick={() => onStatusChange(status.value)}
                  className={cn(
                    "rounded-full px-5 h-10 transition-all text-sm",
                    currentStatus === status.value
                      ? "bg-emerald-50 text-emerald-700 border-none hover:bg-emerald-100"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <DialogClose asChild>
              <Button
                className="flex-1 h-12 rounded-xl bg-slate-900 font-bold text-white transition-transform active:scale-95"
                onClick={handleApply}
              >
                Apply Filters
              </Button>
            </DialogClose>

            <Button
              variant="ghost"
              className="h-12 font-bold text-slate-400"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
