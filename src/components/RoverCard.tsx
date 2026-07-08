import { TrendingUp, Package, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type RoverCardProps = {
  rover: unknown;
  onDetails: () => void;
};

const RoverCard = ({ rover, onDetails }: RoverCardProps) => {
  const statusConfig: Record<string, { style: string, icon: JSX.Element, label: string, color: string }> = {
    arrived: { 
      style: "bg-green-100 text-green-700 border-green-200", 
      icon: <CheckCircle2 className="w-3 h-3 mr-1" />, 
      label: "Arrived",
      color: "#15803d"
    },
    moving: { 
      style: "bg-blue-100 text-blue-700 border-blue-200", 
      icon: <Loader2 className="w-3 h-3 mr-1 animate-spin" />, 
      label: "Moving",
      color: "#1d4ed8"
    },
    error: { 
      style: "bg-red-100 text-red-700 border-red-200", 
      icon: <AlertCircle className="w-3 h-3 mr-1" />, 
      label: "Issue",
      color: "#b91c1c"
    },
    idle: { 
      style: "bg-gray-100 text-gray-700 border-gray-200", 
      icon: <AlertCircle className="w-3 h-3 mr-1" />, 
      label: "Idle",
      color: "#374151"
    }
  };

  const status = statusConfig[rover.status] || statusConfig.idle;

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition border-l-4" 
      style={{ borderLeftColor: status.color }}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold leading-tight">{rover.name}</h3>
            <p className="text-xs text-muted-foreground">{rover.id}</p>
          </div>
          <Badge variant="outline" className={`${status.style} font-medium`}>
            {status.icon}
            {status.label}
          </Badge>
        </div>

        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            {rover.speed ?? 0} mph
          </div>
        </div>

        {rover.currentOrder && (
          <div className="flex items-center gap-2 text-sm bg-slate-50 p-2 rounded-md">
            <Package className="w-4 h-4 text-primary" />
            <span className="truncate font-medium">{rover.currentOrder.id}</span>
          </div>
        )}

        {(rover.deliveryProgress ?? 0) > 0 && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Delivery Progress</span>
              <span className="font-semibold">{rover.deliveryProgress}%</span>
            </div>
            <Progress value={rover.deliveryProgress} className="h-1.5" />
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDetails();
          }}
          className="mt-3 w-full bg-primary text-white py-1.5 rounded-lg hover:bg-primary/90 transition text-sm font-medium"
        >
          View Details
        </button>
      </CardContent>
    </Card>
  );
};

export default RoverCard;