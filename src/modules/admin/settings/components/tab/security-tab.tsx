import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function SecurityTab() {
  const sectionTitle = "text-sm font-semibold text-slate-900 mb-1";
  const sectionDesc = "text-xs text-slate-500 mb-4";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900">Security</h2>
        </div>
        <p className="text-sm text-slate-500">Manage your account security settings</p>
      </div>

      <div className="space-y-8">
        {/* Password Section */}
        <div>
          <h3 className={sectionTitle}>Password</h3>
          <p className={sectionDesc}>Last changed: 30 days ago</p>
          <Button variant="outline" className="h-9 px-4 text-xs font-semibold">
            Change Password
          </Button>
        </div>

        <Separator className="bg-slate-100" />

        {/* 2FA Section */}
        <div>
          <h3 className={sectionTitle}>Two-Factor Authentication</h3>
          <p className={sectionDesc}>Add an extra layer of security to your account</p>
          <Button variant="outline" className="h-9 px-4 text-xs font-semibold">
            Enable 2FA
          </Button>
        </div>

        <Separator className="bg-slate-100" />

        {/* Sessions Section */}
        <div>
          <h3 className={sectionTitle}>Active Sessions</h3>
          <p className={sectionDesc}>Manage devices where you're logged in</p>
          <Button variant="outline" className="h-9 px-4 text-xs font-semibold">
            View Sessions
          </Button>
        </div>
      </div>
    </div>
  );
}