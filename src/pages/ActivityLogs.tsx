import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertCircle, CheckCircle } from "lucide-react";

type LogType = "success" | "error" | "warning" | "info";
type Log = {
  id: number;
  timestamp: string;
  rover: string;
  roverId: string;
  action: string;
  type: LogType;
  details: string;
};

const ActivityLogs = () => {
  const logs: Log[] = [
    { id: 1, timestamp: "2024-01-15 10:30:45", rover: "Rover Alpha", roverId: "RVR-001", action: "Delivery Completed", type: "success", details: "Order ORD-12345 delivered successfully" },
    { id: 2, timestamp: "2024-01-15 10:28:32", rover: "Rover Theta", roverId: "RVR-008", action: "Route Updated", type: "info", details: "New route assigned for order ORD-12350" },
    { id: 3, timestamp: "2024-01-15 10:25:18", rover: "Rover Beta", roverId: "RVR-002", action: "Status Changed", type: "warning", details: "Rover entered idle state - low battery" },
    { id: 4, timestamp: "2024-01-15 10:20:55", rover: "Rover Delta", roverId: "RVR-004", action: "Critical Issue", type: "error", details: "Communication lost - immediate attention required" },
    { id: 5, timestamp: "2024-01-15 10:18:22", rover: "Rover Gamma", roverId: "RVR-003", action: "Order Started", type: "info", details: "Started delivery for order ORD-12346" },
    { id: 6, timestamp: "2024-01-15 10:15:10", rover: "Rover Epsilon", roverId: "RVR-005", action: "Battery Charged", type: "success", details: "Battery level restored to 78%" },
    { id: 7, timestamp: "2024-01-15 10:12:45", rover: "Rover Kappa", roverId: "RVR-010", action: "System Start", type: "info", details: "Rover powered on and initialized" },
    { id: 8, timestamp: "2024-01-15 10:10:30", rover: "Rover Eta", roverId: "RVR-007", action: "Route Optimized", type: "info", details: "AI-optimized route for faster delivery" },
  ];

  const getIcon = (type: LogType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return <Activity className="w-4 h-4 text-primary" />;
    }
  };

  const getBadgeVariant = (type: LogType) => {
    switch (type) {
      case "success":
        return "bg-success text-success-foreground";
      case "error":
        return "bg-destructive text-destructive-foreground";
      case "warning":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Activity Logs</h1>
        <p className="text-muted-foreground mt-1">Complete history of fleet activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Activity className="w-4 h-4" />
            <span>Total Events</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{logs.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-success mb-1">
            <CheckCircle className="w-4 h-4" />
            <span>Success</span>
          </div>
          <p className="text-2xl font-bold text-success">{logs.filter((l) => l.type === "success").length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-warning mb-1">
            <AlertCircle className="w-4 h-4" />
            <span>Warnings</span>
          </div>
          <p className="text-2xl font-bold text-warning">{logs.filter((l) => l.type === "warning").length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-destructive mb-1">
            <AlertCircle className="w-4 h-4" />
            <span>Errors</span>
          </div>
          <p className="text-2xl font-bold text-destructive">{logs.filter((l) => l.type === "error").length}</p>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Rover</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-sm text-muted-foreground">{log.timestamp}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{log.rover}</p>
                    <p className="text-xs text-muted-foreground">{log.roverId}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getBadgeVariant(log.type)}>
                    <span className="flex items-center gap-1.5">
                      {getIcon(log.type)}
                      {log.action}
                    </span>
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ActivityLogs;
