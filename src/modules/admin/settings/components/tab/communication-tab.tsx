import { MessageSquare, Phone, MessageCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CommunicationTab() {
  const selectTriggerClass = "bg-white border-slate-200 h-11";
  const labelClass = "text-slate-900 font-medium mb-2 text-sm block";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900">Communication</h2>
        </div>
        <p className="text-sm text-slate-500">Choose how and when we contact you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label className={labelClass}>Preferred Contact Method</Label>
          <Select defaultValue="email">
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className={labelClass}>Notification Digest</Label>
          <Select defaultValue="daily">
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instant">Instant</SelectItem>
              <SelectItem value="daily">Daily Digest</SelectItem>
              <SelectItem value="weekly">Weekly Summary</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          Additional Channels
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <Phone className="w-4 h-4 text-slate-400 mt-1" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">SMS Alerts</h4>
                <p className="text-xs text-slate-500">Receive critical alerts via SMS (delivery, payment due)</p>
              </div>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <MessageCircle className="w-4 h-4 text-slate-400 mt-1" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">WhatsApp Updates</h4>
                <p className="text-xs text-slate-500">Get order and invoice updates via WhatsApp</p>
              </div>
            </div>
            <Switch />
          </div>
        </div>
      </div>
    </div>
  );
}