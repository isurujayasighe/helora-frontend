// src/components/layout/components/customer-phone-lookup-field.tsx

"use client";

import * as React from "react";
import {
  CheckCircle2,
  Loader2,
  Phone,
  Search,
  UserRound,
  X,
} from "lucide-react";
import type {
  Control,
  FieldValues,
  Path,
  PathValue,
  UseFormSetValue,
} from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  type CustomerLookupItem,
  useCustomerLookup,
} from "@/api/useGetCustomerLookup";

type CustomerLookupFieldNames<TFormValues extends FieldValues> = {
  customerId: Path<TFormValues>;
  customerName: Path<TFormValues>;
  phoneNumber: Path<TFormValues>;
  town?: Path<TFormValues>;
  address?: Path<TFormValues>;
  notes?: Path<TFormValues>;
  hospitalName?: Path<TFormValues>;
};

type CustomerPhoneLookupFieldProps<TFormValues extends FieldValues> = {
  control: Control<TFormValues>;
  setValue: UseFormSetValue<TFormValues>;
  names: CustomerLookupFieldNames<TFormValues>;
  disabled?: boolean;
  onCustomerSelect?: (customer: CustomerLookupItem) => void;
  onClear?: () => void;
};

function setFormValue<TFormValues extends FieldValues>(
  setValue: UseFormSetValue<TFormValues>,
  name: Path<TFormValues> | undefined,
  value: string,
  options?: {
    shouldDirty?: boolean;
    shouldTouch?: boolean;
    shouldValidate?: boolean;
  },
) {
  if (!name) return;

  setValue(name, value as PathValue<TFormValues, Path<TFormValues>>, {
    shouldDirty: options?.shouldDirty ?? true,
    shouldTouch: options?.shouldTouch ?? true,
    shouldValidate: options?.shouldValidate ?? true,
  });
}

export function CustomerPhoneLookupField<TFormValues extends FieldValues>({
  control,
  setValue,
  names,
  disabled,
  onCustomerSelect,
  onClear,
}: CustomerPhoneLookupFieldProps<TFormValues>) {
  const [search, setSearch] = React.useState("");
  const [isSuggestionsOpen, setIsSuggestionsOpen] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    React.useState<CustomerLookupItem | null>(null);

  const {
    data: customers = [],
    isFetching,
    isError,
  } = useCustomerLookup({
    search,
    limit: 8,
  });

  return (
    <FormField
      control={control}
      name={names.phoneNumber}
      render={({ field }) => {
        const phoneValue = String(field.value ?? "");
        const hasValue = phoneValue.trim().length > 0;

        const shouldShowSuggestions =
          isSuggestionsOpen &&
          !selectedCustomer &&
          phoneValue.trim().length >= 2;

        const clearSelectedCustomerFields = () => {
          setFormValue(setValue, names.customerId, "", {
            shouldValidate: false,
          });

          setFormValue(setValue, names.customerName, "", {
            shouldValidate: true,
          });

          setFormValue(setValue, names.town, "", {
            shouldValidate: false,
          });

          setFormValue(setValue, names.address, "", {
            shouldValidate: false,
          });

          setFormValue(setValue, names.notes, "", {
            shouldValidate: false,
          });

          setFormValue(setValue, names.hospitalName, "", {
            shouldValidate: false,
          });
        };

        const handleClear = () => {
          field.onChange("");

          setSearch("");
          setSelectedCustomer(null);
          setIsSuggestionsOpen(false);

          clearSelectedCustomerFields();
          onClear?.();
        };

        const handleSelectCustomer = (customer: CustomerLookupItem) => {
          setSelectedCustomer(customer);
          setIsSuggestionsOpen(false);
          setSearch(customer.phoneNumber ?? "");

          setFormValue(setValue, names.customerId, customer.id);
          setFormValue(setValue, names.customerName, customer.fullName);
          setFormValue(setValue, names.phoneNumber, customer.phoneNumber ?? "");
          setFormValue(setValue, names.town, customer.town ?? "");
          setFormValue(setValue, names.address, customer.address ?? "");
          setFormValue(setValue, names.notes, customer.hospitalName ?? "");
          setFormValue(
            setValue,
            names.hospitalName,
            customer.hospitalName ?? "",
          );

          onCustomerSelect?.(customer);
        };

        return (
          <FormItem className="relative">
            <FormLabel>Phone number / customer lookup</FormLabel>

            <FormControl>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <Input
                  value={phoneValue}
                  name={field.name}
                  ref={field.ref}
                  disabled={disabled}
                  placeholder="Type phone number to find customer..."
                  className="h-11 rounded-lg pl-9 pr-16"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  inputMode="tel"
                  onFocus={() => {
                    if (!selectedCustomer) {
                      setIsSuggestionsOpen(true);
                    }
                  }}
                  onBlur={() => {
                    field.onBlur();

                    window.setTimeout(() => {
                      setIsSuggestionsOpen(false);
                    }, 150);
                  }}
                  onChange={(event) => {
                    const value = event.target.value;

                    field.onChange(value);
                    setSearch(value);
                    setSelectedCustomer(null);
                    setIsSuggestionsOpen(true);
                    clearSelectedCustomerFields();
                  }}
                />

                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                  {isFetching && (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  )}

                  {selectedCustomer && !isFetching && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}

                  {hasValue && !disabled && (
                    <button
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        handleClear();
                      }}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition",
                        "hover:bg-slate-100 hover:text-slate-700",
                        "focus:outline-none focus:ring-2 focus:ring-slate-200",
                      )}
                      aria-label="Clear customer lookup"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </FormControl>

            {shouldShowSuggestions && (
              <div className="absolute left-0 right-0 top-18.5 z-50 overflow rounded-lg border border-slate-200 bg-white shadow-lg">
                {isFetching ? (
                  <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching customers...
                  </div>
                ) : isError ? (
                  <div className="px-3 py-3 text-sm text-red-600">
                    Unable to load customers.
                  </div>
                ) : customers.length > 0 ? (
                  <div className="max-h-100 overflow-y-auto p-1">
                    {customers.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          handleSelectCustomer(customer);
                        }}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition",
                          "hover:bg-slate-50 focus:bg-slate-50 focus:outline-none",
                        )}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                          <UserRound className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {customer.fullName}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            {customer.phoneNumber && (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" />
                                {customer.phoneNumber}
                              </span>
                            )}

                            
                          </div>

                         

                          {customer.hospitalName && (
                            <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                              {customer.hospitalName}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-3 text-sm text-slate-500">
                    No customer found.
                  </div>
                )}
              </div>
            )}

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}