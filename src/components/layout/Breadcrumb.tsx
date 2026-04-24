import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from URL if not provided
  const breadcrumbItems = items || generateBreadcrumbs(location.pathname);

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-muted-foreground px-4 py-2 border-b", className)}>
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
          {item.href && index < breadcrumbItems.length - 1 ? (
            <Link 
              to={item.href} 
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={index === breadcrumbItems.length - 1 ? "text-foreground font-medium" : ""}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always start with Dashboard
  if (pathname !== '/dashboard' && pathname !== '/') {
    breadcrumbs.push({ label: 'Dashboard', href: '/dashboard' });
  }

  // Map path segments to readable labels
  const segmentMap: Record<string, string> = {
    'invoices': 'Connections',
    'integrations': 'Integrations',
    'logs': 'Activity Logs',
    'settings': 'Settings',
    'new': 'New',
    'templates': 'Templates',
    'credentials': 'Credentials Vault',
    'mine': 'My Integrations',
    'builder': 'Builder',
    'mapping': 'Data Mapping',
    'deploy': 'Test and Deploy',
    'system': 'System Events',
    'tests': 'Test Runs',
    'audit': 'Audit Trail',
    'org': 'Organisation Profile',
    'users': 'Users and Roles',
    'access': 'Access Control',
    'environments': 'Environments',
    'api': 'API Keys and Webhooks',
    'notifications': 'Notifications',
    'security': 'Security and Data Residency',
    'billing': 'Billing and Subscription',
    'compliance': 'Compliance and Exports',
  };

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = segmentMap[segment] || segment;
    
    // Don't make the last segment clickable
    const href = index < segments.length - 1 ? currentPath : undefined;
    
    breadcrumbs.push({ label, href });
  });

  return breadcrumbs;
}