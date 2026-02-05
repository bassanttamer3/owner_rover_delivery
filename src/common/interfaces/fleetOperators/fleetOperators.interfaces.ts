export interface CreateFleetOperatorPayload {
  name: string;
  email: string;
  phone: string;
  role: string;
  permissions: string[];
}

export interface FleetOperatorParams {
  role?: string;   // Available: super_admin, admin, manager, dispatcher
  status?: string; // Available: active, inactive, suspended
  page?: number;   // Default: 1
  limit?: number;  // Default: 20, Max: 100
}

// Simple interface for status change reasons
export interface OperatorStatusPayload {
  reason: string;
}