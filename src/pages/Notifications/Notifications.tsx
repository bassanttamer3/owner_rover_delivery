import { useMemo, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type NotificationItem = {
  id: number;
  type: "warning" | "success" | "error" | "info";
  title: string;
  message: string;
  timestamp: string;
  avatar?: string;
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

const Notifications = () => {
  const [allNotifications, setAllNotifications] = useState(notificationsSource);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");

  const hasLoadedPreviousNotifications = visibleCount > INITIAL_VISIBLE_NOTIFICATIONS;
  const hasMorePreviousNotifications = visibleCount < allNotifications.length;

  const filteredNotifications = useMemo(
    () =>
      allNotifications.filter((item) => {
        if (activeFilter === "unread") {
          return !item.read;
        }
        return true;
      }),
    [activeFilter, allNotifications],
  );

  const visibleNotifications = useMemo(
    () => filteredNotifications.slice(0, visibleCount),
    [filteredNotifications, visibleCount],
  );

  const groupedNotifications = useMemo(
    () => ({
      new: visibleNotifications.filter((item) => !item.read),
      earlier: visibleNotifications.filter((item) => item.read),
    }),
    [visibleNotifications],
  );

  const markAsRead = (notificationId: number) => {
    setAllNotifications((previous) =>
      previous.map((item) => (item.id === notificationId ? { ...item, read: true } : item)),
    );
  };

  const loadPreviousNotifications = () => {
    setVisibleCount((previous) => Math.min(previous + LOAD_MORE_BATCH_SIZE, allNotifications.length));
  };

  const allUnreadCount = useMemo(
    () => allNotifications.filter((item) => !item.read).length,
    [allNotifications],
  );

  const renderNotificationRow = (notification: NotificationItem) => {
    const initials = notification.title
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <button
        key={notification.id}
        type="button"
        onClick={() => markAsRead(notification.id)}
        className={`w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/70 ${
          notification.read ? "bg-transparent" : "bg-primary/5"
        }`}
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11">
            {notification.avatar ? <AvatarImage src={notification.avatar} alt={notification.title} /> : null}
            <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">{initials}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="text-sm leading-5 text-foreground">
              <span className="font-semibold">{notification.title}</span> {notification.message}
            </p>
            <p className="mt-1 text-xs text-primary">{notification.timestamp}</p>
          </div>

          {!notification.read ? <span className="mt-4 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" /> : null}
        </div>
      </button>
    );
  };

  return (
    <div className="flex justify-center pt-6">
      <div className="w-full max-w-xl rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More options">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={activeFilter === "all" ? "secondary" : "ghost"}
            className="h-8 rounded-full px-4 text-xs font-semibold"
            onClick={() => setActiveFilter("all")}
          >
            All
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activeFilter === "unread" ? "secondary" : "ghost"}
            className="h-8 rounded-full px-4 text-xs font-semibold"
            onClick={() => setActiveFilter("unread")}
          >
            Unread ({allUnreadCount})
          </Button>
        </div>

        <div className="space-y-3">
          {groupedNotifications.new.length > 0 ? (
            <section>
              <h2 className="mb-1 text-sm font-semibold text-foreground">New</h2>
              <div className="space-y-1">{groupedNotifications.new.map(renderNotificationRow)}</div>
            </section>
          ) : null}

          {groupedNotifications.earlier.length > 0 ? (
            <section>
              <h2 className="mb-1 text-sm font-semibold text-foreground">Earlier</h2>
              <div className="space-y-1">{groupedNotifications.earlier.map(renderNotificationRow)}</div>
            </section>
          ) : null}

          {visibleNotifications.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No notifications in this filter.</p>
          ) : null}
        </div>

        <div className="mt-4 border-t border-border pt-3">
          <Button
            type="button"
            variant="secondary"
            className="h-9 w-full text-sm font-semibold"
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
      </div>
    </div>
  );
};

export default Notifications;