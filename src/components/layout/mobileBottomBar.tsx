import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Settings, 
  User 
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function MobileBottomBar() {
  // 1. Get the current Tenant ID to build dynamic links
  // 2. Define your navigation config
  const tabs = [
    {
      label: "Home",
      icon: LayoutDashboard,
      to: "/app/dashboard", // Update this to match your actual route path
    },
    {
      label: "Orders",
      icon: Package,
      to: "/app/orders",
    },
    {
      label: "Invoices",
      icon: FileText,
      to: "/app/invoices",
    },
    {
      label: "Settings",
      icon: Settings,
      to: "/app/settings",
    },
    {
      label: "Account",
      icon: User,
      to: "/app/profile",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border pb-safe">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            to={tab.to}
            // 3. Active State: TanStack Router applies these classes automatically when the route matches
            activeProps={{
              className: "text-primary bg-primary/5",
            }}
            inactiveProps={{
              className: "text-muted-foreground hover:bg-muted/50 hover:text-primary",
            }}
            className={cn(
              "flex flex-col items-center justify-center h-full gap-1 transition-colors duration-200"
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        ))}

      </div>
    </div>
  );
}