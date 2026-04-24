import { Loader2 } from "lucide-react";

export function SectionSpinner() {
  return (
    <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur">
      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Updating
      </span>
    </div>
  );
}