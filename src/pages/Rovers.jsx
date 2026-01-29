// Rovers.jsx
import React, { useState, useMemo } from "react";
import { Search, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RoverCard from "@/components/RoverCard";
import RoverReportModal from "@/components/RoverReportModal";
import mockRovers from "@/data/mockRovers.json";

const Rovers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState("grid");
  const [selectedRover, setSelectedRover] = useState(null);

  const filteredRovers = useMemo(() => {
    return mockRovers.filter((rover) => {
      const matchesSearch =
        rover.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rover.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || rover.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  return (
    <div className="space-y-8">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-bold">Rovers Fleet</h1>
        <p className="text-muted-foreground">Monitor and manage all autonomous rovers</p>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-card p-4 border">
          <p className="text-sm text-muted-foreground">Total</p>
          <h2 className="text-2xl font-bold">{mockRovers.length}</h2>
        </div>
        <div className="rounded-xl bg-card p-4 border">
          <p className="text-sm text-muted-foreground">Active</p>
          <h2 className="text-2xl font-bold text-green-500">{mockRovers.filter(r => r.status === "active").length}</h2>
        </div>
        <div className="rounded-xl bg-card p-4 border">
          <p className="text-sm text-muted-foreground">Idle</p>
          <h2 className="text-2xl font-bold text-yellow-500">{mockRovers.filter(r => r.status === "idle").length}</h2>
        </div>
        <div className="rounded-xl bg-card p-4 border">
          <p className="text-sm text-muted-foreground">Problem</p>
          <h2 className="text-2xl font-bold text-red-500">{mockRovers.filter(r => r.status === "problem").length}</h2>
        </div>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search rover by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="idle">Idle</SelectItem>
            <SelectItem value="problem">Problem</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2 border rounded-lg p-1">
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded ${view === "grid" ? "bg-primary text-white" : ""}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded ${view === "list" ? "bg-primary text-white" : ""}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* ================= ROVERS ================= */}
      <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "flex flex-col gap-4"}>
        {filteredRovers.length ? (
          filteredRovers.map((rover) => (
            <RoverCard
              key={rover.id}
              rover={rover}
              onDetails={() => setSelectedRover(rover)}
            />
          ))
        ) : (
          <div className="text-center py-16 text-muted-foreground">No rovers found</div>
        )}
      </div>

      {selectedRover && (
        <RoverReportModal
          rover={selectedRover}
          onClose={() => setSelectedRover(null)}
        />
      )}
    </div>
  );
};

export default Rovers;
