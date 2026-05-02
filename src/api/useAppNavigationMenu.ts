import { useQuery } from "@tanstack/react-query";
// import { covalentHubClient } from "@/services/clients/covalent.client";

export interface MenuItem {
  title: string;
  url: string;
  icon: string; // String name of the Lucide icon
  items?: MenuItem[]; // For nested sub-menus
}

// --- MOCK DATA ---<VenetianMask />
// This represents what the backend would return for a "System Admin"
const MOCK_MENU_RESPONSE: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: "LayoutDashboard",
  },
 {
    title: "Orders",
    url: "/app/orders",
    icon: "SendToBack",
  },
  {
    title: "Orders",
    url: "/app/group-orders",
    icon: "SendToBack",
    items: [
      {
        title: "All Group Orders",  
        url: "/app/group-orders",
        icon: "SendToBack",
      },
    ],
  },
  {
    title: "Customers",
    url: "/app/customers",
    icon: "Customers",
  },
   {
    title: "Blocks",
    url: "/app/blocks",
    icon: "FileChartLine",
  },
  {
    title: "Account",
    url: "/app/account",
    icon: "VenetianMask",
  },

   {
    title: "Support",
    url: "/app/support",
    icon: "Info",
  },
 
 
  // {
  //   title: "Access Control",
  //   url: "#",
  //   icon: "ShieldCheck",
  //   items: [
  //     {
  //       title: "Users",
  //       url: "/admin/users",
  //       icon: "Users",
  //     },
  //     {
  //       title: "Roles & Permissions",
  //       url: "/admin/role-permissions",
  //       icon: "UserCog",
  //     },
  //   ],
  // },

  // {
  //   title: "Administration",
  //   url: "#",
  //   icon: "Settings",
  //   items: [
  //     {
  //       title: "System Settings",
  //       url: "/admin/settings",
  //       icon: "Settings",
  //     },
  //     {
  //       title: "Activity Logs",
  //       url: "/admin/activity-log",
  //       icon: "ClipboardList",
  //     },
  //   ],
  // },

  // {
  //   title: "Support Center",
  //   url: "/app/support",
  //   icon: "Info",
  // },
];

export const useAppMenu = () => {
  return useQuery({
    queryKey: ["app-menu"],
    queryFn: async () => {
      // --- MOCK API CALL ---

      // Simulate network delay (500ms) to test your Skeletons
      await new Promise((resolve) => setTimeout(resolve, 500));

      return MOCK_MENU_RESPONSE;

      // --- REAL API CALL (Uncomment when backend is ready) ---
      // const res = await covalentHubClient.get<MenuItem[]>("/admin/Menu");
      // return res.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
