import { useMemo, useState } from "react";
import { MoreHorizontal, Check } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Notification } from "@/common/interfaces/notification/notification.interface";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const INITIAL_VISIBLE_NOTIFICATIONS = 5;
const LOAD_MORE_BATCH_SIZE = 2;

const Notifications = () => {
  const { data, count, handleRead, handleReadAll } = useNotifications();
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = useMemo(() => {
    return activeFilter === "unread" 
      ? data.filter((item) => item.status === "unread") 
      : data;
  }, [activeFilter, data]);

  const hasLoadedPreviousNotifications = visibleCount > INITIAL_VISIBLE_NOTIFICATIONS;
  const hasMorePreviousNotifications = visibleCount < filteredNotifications.length;

  const visibleNotifications = useMemo(
    () => filteredNotifications.slice(0, visibleCount),
    [filteredNotifications, visibleCount],
  );

  const groupedNotifications = useMemo(
    () => ({
      new: visibleNotifications.filter((item) => item.status === "unread"),
      earlier: visibleNotifications.filter((item) => item.status === "read"),
    }),
    [visibleNotifications],
  );

  const loadPreviousNotifications = () => {
    setVisibleCount((previous) => Math.min(previous + LOAD_MORE_BATCH_SIZE, filteredNotifications.length));
  };

  const renderNotificationRow = (notification: Notification) => {
    const initials = notification.title
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <button
        key={notification._id}
        type="button"
        onClick={() => notification.status === "unread" && handleRead(notification._id)}
        className={`w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/70 ${
          notification.status === "read" ? "bg-transparent" : "bg-primary/5"
        }`}
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11">
            <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">{initials}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="text-sm leading-5 text-foreground">
              <span className="font-semibold">{notification.title}</span> {notification.body}
            </p>
            <p className="mt-1 text-xs text-primary">{new Date(notification.createdAt).toLocaleDateString()}</p>
          </div>

          {notification.status === "unread" ? <span className="mt-4 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" /> : null}
        </div>
      </button>
    );
  };

  return (
    <div className="flex justify-center pt-6">
      <div className="w-full max-w-xl rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More options">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleReadAll} className="text-sm cursor-pointer flex items-center gap-2">
                <Check className="h-4 w-4" />
                Mark all as read
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            Unread ({count})
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

        {filteredNotifications.length > 0 && (
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
        )}
      </div>
    </div>
  );
};

export default Notifications;