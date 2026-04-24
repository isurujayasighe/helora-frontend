import { CreditCard, Calendar, FileText, Download } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function InvoiceTab() {
  const selectTriggerClass = "bg-white border-slate-200 h-11 focus:ring-1 focus:ring-primary";
  const labelClass = "text-slate-900 font-medium mb-2 text-sm block";
  const sectionHeaderClass = "text-xs font-bold text-slate-400 uppercase tracking-widest mb-6";

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1 rounded">
            <CreditCard className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Invoice & Payment</h2>
        </div>
        <p className="text-sm text-slate-500">
          Manage invoice delivery and payment preferences
        </p>
      </div>

      <div className="space-y-6">
        <h3 className={sectionHeaderClass}>Payment Reminders</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Reminder Before Due Date */}
          <div className="space-y-2">
            <Label className={labelClass}>Reminder Before Due Date</Label>
            <Select defaultValue="3-days">
              <SelectTrigger className={selectTriggerClass}>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <SelectValue placeholder="Select timing" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-day">1 Day Before</SelectItem>
                <SelectItem value="3-days">3 Days Before</SelectItem>
                <SelectItem value="7-days">7 Days Before</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Account Statement Frequency */}
          <div className="space-y-2">
            <Label className={labelClass}>Account Statement Frequency</Label>
            <Select defaultValue="monthly">
              <SelectTrigger className={selectTriggerClass}>
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <SelectValue placeholder="Select frequency" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Statement Format */}
          <div className="space-y-2">
            <Label className={labelClass}>Statement Format</Label>
            <Select defaultValue="pdf">
              <SelectTrigger className={selectTriggerClass}>
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-slate-400" />
                  <SelectValue placeholder="Select format" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}