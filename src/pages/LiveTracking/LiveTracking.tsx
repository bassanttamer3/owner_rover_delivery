import { useState } from "react";
import { Search, MapPin, Truck, AlertTriangle, Navigation2 } from "lucide-react";
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
    <div className="space-y-6 pt-6 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Navigation2 className="w-6 h-6 text-[#2ec8cf] animate-pulse" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Live Tracking</h1>
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Real-time fleet intelligence and path monitoring
          </p>
        </div>
      </div>

      <div className="h-[calc(100vh-14rem)] grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map View Area (Takes 3 columns now for better visibility) */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-2xl border bg-background relative group">
          <MapPanel
            rovers={roversData}
            selectedRover={selectedRover as RoverForMap | null}
            onMarkerClick={(rover) => setSelectedRover(rover)}
          />
          {/* Overlay info for selected rover */}
          {selectedRover && (
            <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur-md p-4 rounded-xl border border-primary/20 shadow-2xl z-[1000] animate-in slide-in-from-bottom-5 duration-300 max-w-xs">
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Focusing on:</p>
              <h3 className="font-bold">{(selectedRover as RoverForMap).name}</h3>
              <p className="text-xs text-muted-foreground italic">Tracing path to destination...</p>
            </div>
          )}
        </div>

        {/* Control Panel (Sidebar) */}
        <div className="lg:col-span-1 rounded-2xl border bg-gradient-to-br from-background to-[#2ec8cf]/5 shadow-xl flex flex-col overflow-hidden">
          <div className="p-5 border-b space-y-5 bg-background/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Fleet Control
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {roversData.length} TOTAL
              </span>
            </h2>
            
            <div className="space-y-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[#2ec8cf] transition-colors" />
                <Input
                  placeholder="ID or Rover Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 focus-visible:ring-[#2ec8cf]"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Status: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active (On Duty)</SelectItem>
                  <SelectItem value="idle">Idle (Waiting)</SelectItem>
                  <SelectItem value="problem">Problem (Review)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Active', icon: Truck, color: 'text-green-500', bg: 'bg-green-500/10', status: 'active' },
                { label: 'Idle', icon: MapPin, color: 'text-yellow-500', bg: 'bg-yellow-500/10', status: 'idle' },
                { label: 'Issue', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', status: 'problem' },
              ].map((stat) => (
                <div key={stat.label} className={`p-2 rounded-lg ${stat.bg} border border-transparent hover:border-current/20 transition-all text-center`}>
                  <stat.icon className={`w-4 h-4 mx-auto ${stat.color} mb-1`} />
                  <p className="text-md font-black">{roversData.filter((r) => r.status === stat.status).length}</p>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* List Section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40">
            {filteredRovers.length ? (
              filteredRovers.map((rover) => (
                <div
                  key={rover.id}
                  onClick={() => setSelectedRover(rover)}
                  className={`transition-all duration-300 rounded-xl cursor-pointer hover:translate-x-1 ${
                    (selectedRover as RoverForMap)?.id === rover.id 
                    ? "ring-2 ring-[#2ec8cf] shadow-lg bg-[#2ec8cf]/5" 
                    : "hover:bg-accent"
                  }`}
                >
                  <RoverCard rover={rover} onDetails={() => setSelectedRover(rover)} />
                </div>
              ))
            ) : (
              <div className="text-center py-20 opacity-50">
                <Search className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm">No rovers found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;