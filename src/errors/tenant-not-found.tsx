import { Building2, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function TenantNotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50/50 p-4">
      {/* Background decoration (Optional) */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-50" />

      <Card className="w-full max-w-md shadow-xl border-slate-200 bg-white/80 backdrop-blur-sm p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* 1. Iconography */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 border border-slate-200 shadow-inner">
          <Building2 className="h-10 w-10 text-slate-400" />
        </div>

        {/* 2. Messaging */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Tenant Not Found
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            The tenant you are looking for does not exist or has been deactivated. 
            Please check the URL subdomain (e.g., <span className="font-mono bg-slate-100 px-1 rounded text-slate-700">company.app.com</span>) and try again.
          </p>
        </div>

        {/* 3. Actions */}
        <div className="space-y-3 pt-2">
          <Button asChild className="w-full h-10 gap-2 shadow-sm" size="lg">
            <a href="https://app.yourdomain.com/login">
              Go to Main Login <ArrowRight className="w-4 h-4 opacity-50" />
            </a>
          </Button>
          
          <Button variant="outline" asChild className="w-full h-10 gap-2 border-slate-200">
            <a href="mailto:support@yourdomain.com">
              <HelpCircle className="w-4 h-4 text-slate-500" /> 
              Contact Support
            </a>
          </Button>
        </div>

        {/* 4. Footer / Trust */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium">
            Covalent Customer portal &copy; {new Date().getFullYear()}
          </p>
        </div>
      </Card>
    </div>
  );
}