import { TrendingUp, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type RoverOrder = { id: string };
type Rover = {
  id: string;
  name: string;
  status: "active" | "idle" | "problem";
  speed?: number;
  currentOrder?: RoverOrder;
  deliveryProgress?: number;
};

type RoverCardProps = {
  rover: Rover;
  onDetails: () => void;
};

const RoverCard = ({ rover, onDetails }: RoverCardProps) => {
  const statusStyles: Record<string, string> = {
    active: "bg-green-500/10 text-green-600",
    idle: "bg-yellow-500/10 text-yellow-600",
    problem: "bg-red-500/10 text-red-600",
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold leading-tight">{rover.name}</h3>
            <p className="text-xs text-muted-foreground">{rover.id}</p>
          </div>
          <Badge className={statusStyles[rover.status] ?? ""}>{rover.status}</Badge>
        </div>

        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            {rover.speed ?? 0} mph
          </div>
        </div>

        {rover.currentOrder && (
          <div className="flex items-center gap-2 text-sm">
            <Package className="w-4 h-4 text-primary" />
            <span className="truncate">{rover.currentOrder.id}</span>
          </div>
        )}

        {(rover.deliveryProgress ?? 0) > 0 && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Delivery</span>
              <span>{rover.deliveryProgress}%</span>
            </div>
            <Progress value={rover.deliveryProgress} className="h-1.5" />
          </div>
        )}

        <button
          onClick={onDetails}
          className="mt-3 w-full bg-primary text-white py-1.5 rounded-lg hover:bg-primary/90 transition"
        >
          View Details
        </button>
      </CardContent>
    </Card>
  );
};

export default RoverCard;
