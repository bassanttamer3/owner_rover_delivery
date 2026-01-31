import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type OrderHistoryItem = { id: string; status: string };
type RoverOrder = { id: string; eta?: string; from?: string; to?: string };
type Rover = {
  id: string;
  name: string;
  status: string;
  battery?: number;
  speed?: number;
  currentOrder?: RoverOrder;
  history?: OrderHistoryItem[];
};

type RoverReportModalProps = {
  rover: Rover | null;
  onClose: () => void;
};

const RoverReportModal = ({ rover, onClose }: RoverReportModalProps) => {
  if (!rover) return null;

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Rover Detailed Report</h2>
          <Badge>{rover.status}</Badge>
        </div>

        <div className="border rounded-xl p-5 bg-muted/40 mb-6">
          <h3 className="text-lg font-semibold">{rover.name}</h3>
          <p className="text-muted-foreground">{rover.id}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-sm text-muted-foreground">Battery</p>
              <Progress value={rover.battery ?? 0} />
              <p className="text-sm font-medium mt-1">{rover.battery ?? 0}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Speed</p>
              <p className="font-semibold">{rover.speed ?? 0} mph</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Health</p>
              <p className="font-semibold text-green-500">Excellent</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mode</p>
              <p className="font-semibold">Autonomous</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold mb-2">🚚 Current Order (In Progress)</h4>
          {rover.currentOrder ? (
            <div className="border rounded-lg p-4 grid grid-cols-2 gap-4">
              <p>
                <b>ID:</b> {rover.currentOrder.id}
              </p>
              <p>
                <b>ETA:</b> {rover.currentOrder.eta ?? "—"}
              </p>
              <p>
                <b>From:</b> {rover.currentOrder.from ?? "—"}
              </p>
              <p>
                <b>To:</b> {rover.currentOrder.to ?? "—"}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">No active order</p>
          )}
        </div>

        <div>
          <h4 className="font-semibold mb-2">📦 Previous Orders</h4>
          <div className="space-y-2">
            {rover.history?.map((order) => (
              <div
                key={order.id}
                className="flex justify-between items-center border rounded-md p-3"
              >
                <span>{order.id}</span>
                <Badge variant="outline">{order.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoverReportModal;
