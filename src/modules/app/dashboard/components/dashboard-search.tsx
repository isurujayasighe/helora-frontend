"use client";

import type { FormEvent } from "react";
import { Search } from "lucide-react";

import { Kbd } from "@/components/ui/kbd";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DashboardSearchScope } from "../types";

const searchScopes: Array<{ value: DashboardSearchScope; label: string }> = [
  { value: "all", label: "All" },
  { value: "customers", label: "Customers" },
  { value: "blocks", label: "Blocks" },
  { value: "orders", label: "Orders" },
];

type DashboardSearchProps = {
  value: string;
  scope: DashboardSearchScope;
  onValueChange: (value: string) => void;
  onScopeChange: (scope: DashboardSearchScope) => void;
  onSubmit: () => void;
};

export function DashboardSearch({
  value,
  scope,
  onValueChange,
  onScopeChange,
  onSubmit,
}: DashboardSearchProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <form onSubmit={handleSubmit}>
        <InputGroup className="h-10">
          <InputGroupAddon>
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            placeholder="Quick search customers, blocks, or orders..."
            aria-label="Quick search customers, blocks, or orders"
          />
          <InputGroupAddon align="inline-end" className="hidden sm:flex">
            <Kbd>Enter</Kbd>
          </InputGroupAddon>
        </InputGroup>
      </form>

      <Tabs
        value={scope}
        onValueChange={(nextScope) =>
          onScopeChange(nextScope as DashboardSearchScope)
        }
      >
        <TabsList>
          {searchScopes.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
