// modules/admin/users/components/user-detail-sheet/ActivityTimeline.tsx

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type ActivityType =
  | "profile_rejection"
  | "export"
  | "role_change";

interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: string; // already formatted
}

/* ------------------------------------------------------------------ */
/* Mock Data (replace with API)                                       */
/* ------------------------------------------------------------------ */

const activities: ActivityItem[] = [
  {
    id: "1",
    type: "profile_rejection",
    message: "Rejected profile changes for undefined",
    timestamp: "Dec 18, 13:29",
  },
  {
    id: "2",
    type: "export",
    message: "Exported 8 users to CSV",
    timestamp: "Dec 18, 13:15",
  },
  {
    id: "3",
    type: "role_change",
    message: "Changed user role from customer to super_admin",
    timestamp: "Dec 17, 16:00",
  },
  {
    id: "4",
    type: "role_change",
    message: "Changed user role from customer to super_admin",
    timestamp: "Dec 16, 18:31",
  },
  {
    id: "5",
    type: "profile_rejection",
    message: "Rejected profile changes for undefined",
    timestamp: "Dec 16, 15:37",
  },
];

/* ------------------------------------------------------------------ */
/* Badge config                                                       */
/* ------------------------------------------------------------------ */

const badgeConfig: Record<
  ActivityType,
  { label: string; className: string }
> = {
  profile_rejection: {
    label: "profile rejection",
    className: "bg-red-100 text-red-700",
  },
  export: {
    label: "export",
    className: "bg-muted text-muted-foreground",
  },
  role_change: {
    label: "role change",
    className: "bg-blue-600 text-white",
  },
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function ActivityTimeline() {
  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const badge = badgeConfig[activity.type];

        return (
          <div
            key={activity.id}
            className="flex items-start justify-between gap-4 rounded-lg border px-4 py-3"
          >
            {/* Left side */}
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "rounded-full px-3 py-0.5 text-xs font-medium capitalize",
                  badge.className
                )}
              >
                {badge.label}
              </span>

              <p className="text-sm text-foreground">
                {activity.message}
              </p>
            </div>

            {/* Right side */}
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              {activity.timestamp}
            </div>
          </div>
        );
      })}
    </div>
  );
}
