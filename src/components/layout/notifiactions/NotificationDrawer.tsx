import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import type { NotificationItem } from "@/types/notificationType";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: NotificationItem[];
  onMarkAllRead: () => void;
}

export function NotificationDrawer({
  open,
  onOpenChange,
  items,
  onMarkAllRead,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] sm:w-[420px]">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Notifications</SheetTitle>
          <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
            Mark all read
          </Button>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">
              You’re all caught up 🎉
            </p>
          )}

          {items.map((n) => (
            <div key={n.id} className="space-y-2">
              <div className="flex gap-3">
                <span
                  className={`mt-1 h-2 w-2 rounded-full ${
                    n.read ? "bg-muted" : "bg-primary"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.description && (
                    <p className="text-xs text-muted-foreground">
                      {n.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {n.time}
                  </p>

                  {n.href && (
                    <Button asChild variant="link" size="sm" className="px-0">
                      <Link to={n.href}>View</Link>
                    </Button>
                  )}
                </div>
              </div>

              <Separator />
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
