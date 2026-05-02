import { Database, Clock, ShieldAlert, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DataPrivacyTab() {
  const selectTriggerClass = "bg-white border-slate-200 h-11 focus:ring-1 focus:ring-primary";
  const sectionHeaderClass = "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900">Data & Privacy</h2>
        </div>
        <p className="text-sm text-slate-500">Control how your data is stored, shared, and used</p>
      </div>

      {/* Data Retention */}
      <div className="space-y-4">
        <h3 className={sectionHeaderClass}>Data Retention</h3>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Keep My Data For</Label>
          <Select defaultValue="12-months">
            <SelectTrigger className={selectTriggerClass}>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-400" />
                <SelectValue placeholder="Select duration" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6-months">6 Months</SelectItem>
              <SelectItem value="12-months">12 Months</SelectItem>
              <SelectItem value="24-months">24 Months</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[11px] text-slate-400 italic">Applies to order history, invoices, and communication logs</p>
        </div>
      </div>

      <Separator />

      {/* Security Alerts */}
      <div className="space-y-4">
        <h3 className={sectionHeaderClass}>Security Alerts</h3>
        <div className="flex items-center justify-between">
          <div className="flex gap-4 items-start">
            <ShieldAlert className="w-4 h-4 text-slate-400 mt-1" />
            <div>
              <h4 className="text-sm font-semibold">Unrecognised Login Alerts</h4>
              <p className="text-xs text-slate-500">Get notified when your account is accessed from a new device or location</p>
            </div>
          </div>
          <Switch defaultChecked />
        </div>
      </div>

      <Separator />

      {/* Your Data Rights */}
      <div className="space-y-4">
        <h3 className={sectionHeaderClass}>Your Data Rights</h3>
        <Button variant="outline" className="flex gap-2 text-xs font-semibold h-9">
          <FileText className="w-4 h-4" />
          View Privacy Policy
        </Button>
        <p className="text-[11px] text-slate-400">Under GDPR, you have the right to access, rectify, and erase your personal data at any time.</p>
      </div>

      <Separator />

      {/* Danger Zone */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-red-600">Danger Zone</h3>
        <p className="text-xs text-slate-500">Request account deletion. This action cannot be undone.</p>
        <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-slate-50 flex gap-2 h-10 px-4">
          <Trash2 className="w-4 h-4 text-white" />
          Request Account Deletion
        </Button>
      </div>
    </div>
  );
}