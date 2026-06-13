import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Bell, CheckCircle, Clock, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type NotificationType = "warning" | "success" | "error" | "info";

type NotificationItem = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
};

const notificationsSource: NotificationItem[] = [
  {
    id: 1,
    type: "warning",
    title: "Low Battery Alert",
    message: "Rover Delta battery is at 22%. Consider charging soon.",
    timestamp: "5 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "success",
    title: "Delivery Completed",
    message: "Rover Alpha successfully completed order ORD-12345.",
    timestamp: "15 minutes ago",
    read: false,
  },
  {
    id: 3,
    type: "error",
    title: "Rover Issue",
    message: "Rover Delta has stopped responding. Please check immediately.",
    timestamp: "30 minutes ago",
    read: false,
  },
  {
    id: 4,
    type: "info",
    title: "New Order Assigned",
    message: "Order ORD-12352 has been assigned to Rover Epsilon.",
    timestamp: "1 hour ago",
    read: true,
  },
  {
    id: 5,
    type: "info",
    title: "Maintenance Scheduled",
    message: "Rover Gamma scheduled for maintenance at 3:00 PM.",
    timestamp: "3 hours ago",
    read: true,
  },
  {
    id: 6,
    type: "success",
    title: "Rover Connected",
    message: "Rover Kappa is now online and ready for assignments.",
    timestamp: "2 hours ago",
    read: true,
  },
  {
    id: 7,
    type: "warning",
    title: "Route Delay",
    message: "Rover Theta is delayed due to temporary road restrictions.",
    timestamp: "4 hours ago",
    read: true,
  },
  {
    id: 8,
    type: "info",
    title: "Maintenance Completed",
    message: "Rover Beta has completed scheduled maintenance.",
    timestamp: "5 hours ago",
    read: true,
  },
];

const INITIAL_VISIBLE_NOTIFICATIONS = 5;
const LOAD_MORE_BATCH_SIZE = 2;

const NotificationMenu = () => {
  const navigate = useNavigate();
  const [allNotifications, setAllNotifications] = useState(notificationsSource);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_NOTIFICATIONS);
  const visibleNotifications = useMemo(
    () => allNotifications.slice(0, visibleCount),
    [allNotifications, visibleCount],
  );
  const hasLoadedPreviousNotifications = visibleCount > INITIAL_VISIBLE_NOTIFICATIONS;
  const unreadCount = useMemo(
    () => visibleNotifications.filter((item) => !item.read).length,
    [visibleNotifications],
  );
  const hasMorePreviousNotifications = visibleCount < allNotifications.length;

  const markAsRead = (notificationId: number) => {
    setAllNotifications((previous) =>
      previous.map((item) => (item.id === notificationId ? { ...item, read: true } : item)),
    );
  };

  const markAllAsRead = () => {
    setAllNotifications((previous) => previous.map((item) => ({ ...item, read: true })));
  };

  const loadPreviousNotifications = () => {
    setVisibleCount((previous) => Math.min(previous + LOAD_MORE_BATCH_SIZE, allNotifications.length));
  };

  const renderTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Open notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-xs">
              {unreadCount}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            <div className="flex flex-col items-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-primary hover:bg-transparent hover:text-primary"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-primary hover:bg-transparent hover:text-primary"
                onClick={() => navigate("/notifications")}
              >
                See all
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
        </div>

        <ScrollArea className="h-80">
          <div className="divide-y">
            {visibleNotifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => markAsRead(notification.id)}
                className={`w-full p-4 text-left transition-colors hover:bg-muted/60 ${
                  notification.read ? "bg-background" : "bg-primary/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{renderTypeIcon(notification.type)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{notification.title}</p>
                      {!notification.read ? <span className="mt-1 h-2 w-2 rounded-full bg-primary" /> : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{notification.message}</p>
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{notification.timestamp}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t p-2">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-center text-sm"
            onClick={loadPreviousNotifications}
            disabled={!hasMorePreviousNotifications}
          >
            {hasMorePreviousNotifications
              ? hasLoadedPreviousNotifications
                ? "Load more notifications"
                : "See previous notifications"
              : "No more notifications"}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMenu;
