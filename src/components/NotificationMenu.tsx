import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Bell, CheckCircle, Clock, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/common/interfaces/notification/notification.interface";

const INITIAL_VISIBLE_NOTIFICATIONS = 5;
const LOAD_MORE_BATCH_SIZE = 2;

const NotificationMenu = () => {
  const navigate = useNavigate();
  const { data: allNotifications, count: unreadCount, handleRead, handleReadAll } = useNotifications();
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_NOTIFICATIONS);

  const visibleNotifications = useMemo(
    () => allNotifications.slice(0, visibleCount),
    [allNotifications, visibleCount],
  );

  const hasLoadedPreviousNotifications = visibleCount > INITIAL_VISIBLE_NOTIFICATIONS;
  const hasMorePreviousNotifications = visibleCount < allNotifications.length;

  const loadPreviousNotifications = () => {
    setVisibleCount((previous) => Math.min(previous + LOAD_MORE_BATCH_SIZE, allNotifications.length));
  };

  const renderTypeIcon = (notification: Notification) => {
    if (notification.priority === "high") {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
    
    const lowerTitle = notification.title.toLowerCase();
    if (lowerTitle.includes("alert") || lowerTitle.includes("delay") || lowerTitle.includes("issue")) {
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    }
    if (lowerTitle.includes("completed") || lowerTitle.includes("success") || lowerTitle.includes("connected")) {
      return <CheckCircle className="h-4 w-4 text-success" />;
    }
    
    return <Info className="h-4 w-4 text-primary" />;
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
                onClick={handleReadAll}
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
                key={notification._id}
                type="button"
                onClick={() => notification.status === "unread" && handleRead(notification._id)}
                className={`w-full p-4 text-left transition-colors hover:bg-muted/60 ${
                  notification.status === "read" ? "bg-background" : "bg-primary/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{renderTypeIcon(notification)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{notification.title}</p>
                      {notification.status === "unread" ? <span className="mt-1 h-2 w-2 rounded-full bg-primary" /> : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{notification.body}</p>
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {visibleNotifications.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No notifications available.</p>
            )}
          </div>
        </ScrollArea>

        {allNotifications.length > 0 && (
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
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMenu;