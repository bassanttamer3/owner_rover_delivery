import API from "@/api/base-api";
import { 
  CreateCompanyPayload, 
  CompanyParams, 
  CompanyLocation, 
  CompanySettings,
  CompanyStatusPayload
} from "@/common";

// --- Core Company Management ---

export function createCompany(data: CreateCompanyPayload) {
  return API.post("/fleet/companies", data);
}

export function getCompanies(params: CompanyParams) {
  return API.get("/fleet/companies", { params });
}

export function getCompanyById(id: string) {
  return API.get(`/fleet/companies/${id}`);
}

export function updateCompany(id: string, data: { name: string; contact: any }) {
  return API.put(`/fleet/companies/${id}`, data);
}

// --- Status & Subscription ---

export function activateCompany(id: string, reason: string) {
  return API.post(`/fleet/companies/${id}/activate`, { reason });
}

export function suspendCompany(id: string, reason: string) {
  return API.post(`/fleet/companies/${id}/suspend`, { reason });
}

export function cancelCompanySubscription(id: string, reason: string) {
  return API.post(`/fleet/companies/${id}/cancel`, { reason });
}

export function updateCompanyStatus(id: string, data: CompanyStatusPayload) {
  return API.patch(`/fleet/companies/${id}/status`, data);
}
// --- Location Management ---

/** Add a new operational location to a company */
export function addCompanyLocation(companyId: string, data: CompanyLocation) {
  return API.post(`/fleet/companies/${companyId}/locations`, data);
}

/** Update existing location details */
export function updateCompanyLocation(companyId: string, locationId: string, data: Partial<CompanyLocation>) {
  return API.put(`/fleet/companies/${companyId}/locations/${locationId}`, data);
}

/** Remove a location (Cannot delete primary or last location) */
export function deleteCompanyLocation(companyId: string, locationId: string) {
  return API.delete(`/fleet/companies/${companyId}/locations/${locationId}`);
}

// --- Rover Assignment ---

/** Assign a list of rovers to a company */
export function assignRoversToCompany(companyId: string, roverIds: string[]) {
  return API.post(`/fleet/companies/${companyId}/rovers/assign`, { rover_ids: roverIds });
}

/** Remove rover assignments from a company */
export function unassignRoversFromCompany(companyId: string, roverIds: string[]) {
  return API.post(`/fleet/companies/${companyId}/rovers/unassign`, { rover_ids: roverIds });
}

// --- Security & Settings ---

/** Regenerate API Key and Secret (Super Admin only) */
export function regenerateCompanyCredentials(companyId: string, reason: string) {
  return API.post(`/fleet/companies/${companyId}/api-credentials/regenerate`, { reason });
}

/** Update operational settings and notification preferences */
export function updateCompanySettings(companyId: string, data: CompanySettings) {
  return API.patch(`/fleet/companies/${companyId}/settings`, data);
}

// --- Analytics ---

/** Fetch comprehensive performance and resource statistics */
export function getCompanyStats(companyId: string) {
  return API.get(`/fleet/companies/${companyId}/stats`);
}


