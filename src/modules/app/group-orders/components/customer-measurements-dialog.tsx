"use client";

import { Loader2, Ruler, ShieldCheck, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  useGetCustomerMeasurements,
} from "@/api/useGetCustomerMeasurements";

import type { Measurement } from "@/api/useGetLatestMeasurement";
import { cn } from "@/lib/utils";

type CustomerMeasurementsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId?: string;
  onSelectMeasurement?: (measurement: Measurement) => void;
};

export function CustomerMeasurementsDialog({
  open,
  onOpenChange,
  customerId,
  onSelectMeasurement,
}: CustomerMeasurementsDialogProps) {
  const {
    data: measurements = [],
    isFetching,
    isError,
  } = useGetCustomerMeasurements({
    customerId,
    enabled: open && Boolean(customerId),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-5xl">
        <DialogHeader className="border-b border-slate-200 px-5 py-4 text-left">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Ruler className="h-5 w-5" />
            </div>

            <div>
              <DialogTitle className="text-lg font-semibold text-slate-950">
                Customer measurements
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-slate-500">
                Select the correct previous measurement for this order item.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-slate-50/60 p-5">
          {isFetching && (
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading measurements...
            </div>
          )}

          {isError && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
              <TriangleAlert className="h-4 w-4" />
              Unable to load measurements.
            </div>
          )}

          {!isFetching && !isError && measurements.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <p className="text-sm font-semibold text-slate-900">
                No measurements found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                This customer does not have previous measurements yet.
              </p>
            </div>
          )}

          {!isFetching && !isError && measurements.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {measurements.map((measurement) => (
                <MeasurementCard
                  key={measurement.id}
                  measurement={measurement}
                  onSelect={() => {
                    onSelectMeasurement?.(measurement);
                    onOpenChange(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MeasurementCard({
  measurement,
  onSelect,
}: {
  measurement: Measurement;
  onSelect: () => void;
}) {
  const isVerified = measurement.verificationStatus === "VERIFIED_OK";

  const values = [...(measurement.values ?? [])].sort(
    (a, b) => (a.field?.sortOrder ?? 0) - (b.field?.sortOrder ?? 0)
  );

  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-none">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-slate-950">
                {measurement.measurementNumber}
              </p>

              <Badge
                variant="secondary"
                className={cn(
                  "rounded-full",
                  isVerified
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                )}
              >
                {measurement.verificationStatus.replaceAll("_", " ")}
              </Badge>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {measurement.category?.name ?? "Category"} · Block{" "}
              {measurement.block?.blockNumber ?? "-"}
            </p>
          </div>

          {isVerified && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {values.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <p className="text-[11px] font-medium text-slate-500">
                {item.field?.label ?? item.fieldId}
              </p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">
                {item.value || "-"}
                {item.field?.unit ? (
                  <span className="ml-1 text-xs font-medium text-slate-500">
                    {item.field.unit}
                  </span>
                ) : null}
              </p>
            </div>
          ))}
        </div>

        {measurement.notes && (
          <div className="rounded-xl bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-800">
            {measurement.notes}
          </div>
        )}

        <Button type="button" className="w-full" onClick={onSelect}>
          Use this measurement
        </Button>
      </CardContent>
    </Card>
  );
}