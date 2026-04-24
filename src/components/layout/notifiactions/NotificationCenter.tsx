import { useState, useEffect } from "react";
import { Bell, Check, Trash2, Package, FileText, User, Info, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'invoice' | 'account';
  read: boolean;
  action_url: string | null;
  created_at: string;
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'order': return <Package className="h-4 w-4" />;
    case 'invoice': return <FileText className="h-4 w-4" />;
    case 'account': return <User className="h-4 w-4" />;
    case 'success': return <CheckCircle className="h-4 w-4" />;
    case 'warning': return <AlertTriangle className="h-4 w-4" />;
    case 'error': return <AlertCircle className="h-4 w-4" />;
    default: return <Info className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'success': return 'text-green-600';
    case 'warning': return 'text-yellow-600';
    case 'error': return 'text-red-600';
    case 'order': return 'text-blue-600';
    case 'invoice': return 'text-purple-600';
    case 'account': return 'text-orange-600';
    default: return 'text-muted-foreground';
  }
};

export default function NotificationCenter() {
  const [notifications, _setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, _setLoading] = useState(true);


  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    fetchNotifications();
    setupRealtimeSubscription();
  }, []);

  const fetchNotifications = async () => {
    // try {
    //   const { data: { user } } = await supabase.auth.getUser();
    //   if (!user) return;

    //   const { data, error } = await supabase
    //     .from('notifications')
    //     .select('*')
    //     .eq('user_id', user.id)
    //     .order('created_at', { ascending: false })
    //     .limit(20);

    //   if (error) throw error;
    //   setNotifications((data || []) as Notification[]);
    // } catch (error) {
    //   console.error('Error fetching notifications:', error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to load notifications",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setLoading(false);
    // }
  };

  const setupRealtimeSubscription = () => {
    // const channel = supabase
    //   .channel('notifications-changes')
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: '*',
    //       schema: 'public',
    //       table: 'notifications'
    //     },
    //     (payload) => {
    //       console.log('Notification update:', payload);
    //       if (payload.eventType === 'INSERT') {
    //         setNotifications(prev => [payload.new as Notification, ...prev]);
    //         toast({
    //           title: (payload.new as Notification).title,
    //           description: (payload.new as Notification).message,
    //         });
    //       } else if (payload.eventType === 'UPDATE') {
    //         setNotifications(prev =>
    //           prev.map(n => n.id === payload.new.id ? payload.new as Notification : n)
    //         );
    //       } else if (payload.eventType === 'DELETE') {
    //         setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
    //       }
    //     }
    //   )
    //   .subscribe();

    // return () => {
    //   supabase.removeChannel(channel);
    // };
  };

  const markAsRead = async (_notificationId: string) => {
    // try {
    //   const { error } = await supabase
    //     .from('notifications')
    //     .update({ read: true })
    //     .eq('id', notificationId);

    //   if (error) throw error;
    // } catch (error) {
    //   console.error('Error marking notification as read:', error);
    // }
  };

  const markAllAsRead = async () => {
    // try {
    //   const { data: { user } } = await supabase.auth.getUser();
    //   if (!user) return;

    //   const { error } = await supabase
    //     .from('notifications')
    //     .update({ read: true })
    //     .eq('user_id', user.id)
    //     .eq('read', false);

    //   if (error) throw error;

    //   setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    //   toast({
    //     title: "Success",
    //     description: "All notifications marked as read",
    //   });
    // } catch (error) {
    //   console.error('Error marking all as read:', error);
    // }
  };

  const deleteNotification = async (_notificationId: string) => {
    // try {
    //   const { error } = await supabase
    //     .from('notifications')
    //     .delete()
    //     .eq('id', notificationId);

    //   if (error) throw error;
    // } catch (error) {
    //   console.error('Error deleting notification:', error);
    // }
  };

  const handleNotificationClick = async (_notification: Notification) => {
    // if (!notification.read) {
    //   await markAsRead(notification.id);
    // }
    // if (notification.action_url) {
    //   navigate(notification.action_url);
    //   setOpen(false);
    // }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-100">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                        <div className="flex gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}