import API from "@/api/base-api";
import { 
  CreateFleetOperatorPayload, 
  FleetOperatorParams, 
  OperatorStatusPayload 
} from "@/common";

// Create new operator
export function createFleetOperator(data: CreateFleetOperatorPayload) {
  return API.post("/fleet/operators", data);
}

// Fetch operators list
export function getFleetOperators(params?: FleetOperatorParams) {
  return API.get("/fleet/operators", { params });
}

// Update operator details
export function updateFleetOperator(operatorId: string, data: Partial<CreateFleetOperatorPayload>) {
  return API.put(`/fleet/operators/${operatorId}`, data);
}

// Get single operator profile
export function getOperatorById(operatorId: string) {
  return API.get(`/fleet/operators/${operatorId}`);
}

// Update status (General)
export function updateOperatorStatus(operatorId: string, data: { status: string; reason?: string }) {
  return API.patch(`/fleet/operators/${operatorId}/status`, data);
}

// Activate operator account
export function activateOperator(operatorId: string, data: OperatorStatusPayload) {
  return API.post(`/fleet/operators/${operatorId}/activate`, data);
}

// Suspend operator account
export function suspendOperator(operatorId: string, data: OperatorStatusPayload) {
  return API.post(`/fleet/operators/${operatorId}/suspend`, data);
}

// Deactivate operator account
export function deactivateOperator(operatorId: string, data: OperatorStatusPayload) {
  return API.post(`/fleet/operators/${operatorId}/deactivate`, data);
}