import { Bell, Mail, FileText, Clock, Smartphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function NotificationsTab() {
  const notificationItems = [
    {
      id: "email",
      icon: <Mail className="w-4 h-4 text-slate-500" />,
      title: "Email Notifications",
      description: "Receive updates via email",
      defaultChecked: true,
    },
    {
      id: "orders",
      icon: <FileText className="w-4 h-4 text-slate-500" />,
      title: "Order Updates",
      description: "Get notified about order status changes",
      defaultChecked: true,
    },
    {
      id: "invoices",
      icon: <Clock className="w-4 h-4 text-slate-500" />,
      title: "Invoice Reminders",
      description: "Reminders for upcoming and overdue invoices",
      defaultChecked: true,
    },
    {
      id: "marketing",
      icon: <Smartphone className="w-4 h-4 text-slate-500" />,
      title: "Marketing Updates",
      description: "Promotional offers and news",
      defaultChecked: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
      </div>
      <p className="text-sm text-slate-500 mb-8">Manage how you receive updates and alerts</p>

      <div className="space-y-8">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          General Notifications
        </h3>
        
        <div className="space-y-6">
          {notificationItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex gap-4 items-start">
                <div className="mt-1">{item.icon}</div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
              </div>
              <Switch defaultChecked={item.defaultChecked} className="data-[state=checked]:bg-primary" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}