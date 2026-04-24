import {
  LayoutDashboard,
  User,
  ShieldCheck,
  Settings2,
  FileText,
  CreditCard,
  // ... import other icons you might use
  type LucideIcon,
  VenetianMask,
  SendToBack,
  FileChartLine,
  Settings,
  Info,
} from "lucide-react";

// 1. Define the Map
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  VenetianMask,
  User,
  SendToBack,
  FileChartLine,
  ShieldCheck,
  Settings2,
  Settings,
  FileText,
  CreditCard,
  Info,
};

// 2. Helper Component
export const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    // Fallback icon if the name from backend doesn't match
    return <FileText className={className} />;
  }

  return <IconComponent className={className} />;
};