import { useState } from "react";
import { Search, MapPin, Truck, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RoverCard from "@/components/RoverCard";
import MapPanel from "@/components/MapPanel";
import type { RoverForMap } from "@/components/MapPanel";
import mockRovers from "@/data/mockrovers.json";
import { useApp } from "@/contexts/AppContext";
import { Card } from "@/components/ui/card";

const LiveTracking = () => {
  const { selectedRover, setSelectedRover } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const roversData = mockRovers as RoverForMap[];
  const filteredRovers = roversData.filter((rover) => {
    const matchesSearch =
      rover.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rover.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || rover.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Live Tracking</h1>
          <p className="text-muted-foreground">Monitor rover locations and real-time status</p>
        </div>
      </div>

      <div className="h-[calc(100vh-12rem)] grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-lg border bg-background">
          <MapPanel
            rovers={roversData}
            selectedRover={selectedRover as RoverForMap | null}
            onMarkerClick={setSelectedRover as (rover: RoverForMap) => void}
          />
        </div>

        <div className="rounded-2xl border bg-gradient-to-br from-background to-primary/5 shadow-lg flex flex-col overflow-hidden">
          <div className="p-5 border-b space-y-4">
            <h2 className="text-xl font-bold">Rovers Control</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rovers</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="problem">Problem</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-3 text-center">
                <Truck className="w-5 h-5 mx-auto text-green-600 mb-1" />
                <p className="text-lg font-bold">{roversData.filter((r) => r.status === "active").length}</p>
                <span className="text-xs text-muted-foreground">Active</span>
              </Card>
              <Card className="p-3 text-center">
                <MapPin className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
                <p className="text-lg font-bold">{roversData.filter((r) => r.status === "idle").length}</p>
                <span className="text-xs text-muted-foreground">Idle</span>
              </Card>
              <Card className="p-3 text-center">
                <AlertTriangle className="w-5 h-5 mx-auto text-red-600 mb-1" />
                <p className="text-lg font-bold">{roversData.filter((r) => r.status === "problem").length}</p>
                <span className="text-xs text-muted-foreground">Problem</span>
              </Card>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredRovers.length ? (
              filteredRovers.map((rover) => (
                <div
                  key={rover.id}
                  className={`transition-all rounded-xl ${(selectedRover as RoverForMap)?.id === rover.id ? "ring-2 ring-primary" : ""}`}
                >
                  <RoverCard rover={rover} onDetails={() => setSelectedRover(rover)} />
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-10">No matching rovers found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
