import { UploadCloud } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function BillingTab() {
  const inputClass = "bg-slate-50 border-slate-200";
  const labelClass = "text-slate-900 font-medium mb-1.5 text-sm";
  const sectionTitleClass = "text-sm font-bold text-slate-900 mb-6 capitalize tracking-wider";

  return (
    <div className="space-y-10">
      {/* Profile Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm">Profile Picture</h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-slate-200 text-slate-600">JD</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-slate-800 text-white p-1 rounded-full">
                <UploadCloud className="w-3 h-3" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">John Doe</h4>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button className="bg-[#4a47a3] hover:bg-[#3b3882] text-white">Upload</Button>
            <Button variant="outline">Delete</Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Form Fields */}
      <div>
        <h3 className={sectionTitleClass}>Organization Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className={labelClass}>Business Name</Label>
            <Input className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label className={labelClass}>Email Address</Label>
            <Input className={inputClass} type="email" />
          </div>
        </div>
      </div>
    </div>
  );
}