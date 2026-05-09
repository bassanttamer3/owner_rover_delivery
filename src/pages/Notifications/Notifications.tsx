import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, CheckCircle, Info, Clock } from "lucide-react";

type NotificationType = "warning" | "success" | "error" | "info";
type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
};

const Notifications = () => {
  const notifications: Notification[] = [
    { id: 1, type: "warning", title: "Low Battery Alert", message: "Rover Delta battery is at 22%. Consider charging soon.", timestamp: "5 minutes ago", read: false },
    { id: 2, type: "success", title: "Delivery Completed", message: "Rover Alpha successfully completed order ORD-12345.", timestamp: "15 minutes ago", read: false },
    { id: 3, type: "error", title: "Rover Issue", message: "Rover Delta has stopped responding. Please check immediately.", timestamp: "30 minutes ago", read: false },
    { id: 4, type: "info", title: "New Order Assigned", message: "Order ORD-12352 has been assigned to Rover Epsilon.", timestamp: "1 hour ago", read: true },
    { id: 5, type: "success", title: "Rover Connected", message: "Rover Kappa is now online and ready for assignments.", timestamp: "2 hours ago", read: true },
    { id: 6, type: "info", title: "Maintenance Scheduled", message: "Rover Gamma scheduled for maintenance at 3:00 PM.", timestamp: "3 hours ago", read: true },
  ];

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case "error":
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-success" />;
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case "warning":
        return "bg-warning/10 border-warning/20";
      case "error":
        return "bg-destructive/10 border-destructive/20";
      case "success":
        return "bg-success/10 border-success/20";
      default:
        return "bg-primary/10 border-primary/20";
    }
  };

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated with your fleet alerts</p>
        </div>
        <Badge className="bg-destructive text-destructive-foreground">
          {notifications.filter((n) => !n.read).length} Unread
        </Badge>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`${getTypeColor(notification.type)} border-l-4 transition-all hover:shadow-md ${!notification.read ? "bg-opacity-100" : "bg-opacity-50"}`}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-foreground">{notification.title}</h3>
                    {!notification.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{notification.timestamp}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Notifications;