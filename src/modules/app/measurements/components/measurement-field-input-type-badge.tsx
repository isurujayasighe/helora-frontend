import { Badge } from "@/components/ui/badge";
import {
  Binary,
  CheckSquare,
  Hash,
  ListChecks,
  SquareMenu,
  TextCursorInput,
} from "lucide-react";
import type { MeasurementInputType } from "../types/measurement-fields-types";

export function MeasurementFieldInputTypeBadge({
  inputType,
}: {
  inputType: MeasurementInputType;
}) {
  const config = getInputTypeConfig(inputType);
  const Icon = config.icon;

  return (
    <Badge
      variant="secondary"
      className="rounded-lg bg-slate-100 px-2.5 py-1 font-bold text-slate-700"
    >
      <Icon className="mr-1 h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}

function getInputTypeConfig(inputType: MeasurementInputType) {
  const map = {
    TEXT: {
      label: "Text",
      icon: TextCursorInput,
    },
    NUMBER: {
      label: "Number",
      icon: Hash,
    },
    DECIMAL: {
      label: "Decimal",
      icon: Hash,
    },
    SELECT: {
      label: "Select",
      icon: SquareMenu,
    },
    MULTI_SELECT: {
      label: "Multi Select",
      icon: ListChecks,
    },
    BOOLEAN: {
      label: "Yes / No",
      icon: CheckSquare,
    },
  } satisfies Record<
    MeasurementInputType,
    {
      label: string;
      icon: React.ElementType;
    }
  >;

  return map[inputType] ?? {
    label: inputType,
    icon: Binary,
  };
}