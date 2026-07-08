import API from "@/api/base-api";
import {
  CreateCompanyPayload,
  CompanyParams,
  CompanyLocation,
  CompanySettings,
  CompanyStatusPayload,
  UpdateCompanyLocation,
  StripeAuthorizeResponse,
  StripeAuthorizePayload,
  StripeStatusResponse,
  OnboardingLinkResponse,
  DisconnectResponse,
  SetupIntentResponse,
  SetupIntentRequest,
  SetupIntentDetailsResponse,
  PaymentMethodsResponse,
} from "@/common";
const PAYMENT_BASE_URL = "https://rovex.click/payment/api/v1";

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

export function activateCompany(id: string, reason?: string) {
  return API.post(`/fleet/companies/${id}/activate`, reason ? { reason } : {});
}

export function suspendCompany(id: string, reason?: string) {
  return API.post(`/fleet/companies/${id}/suspend`, reason ? { reason } : {});
}

export function cancelCompanySubscription(id: string, reason?: string) {
  return API.post(`/fleet/companies/${id}/cancel`, reason ? { reason } : {});
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
export function updateCompanyLocation(companyId: string, locationId: string, data: UpdateCompanyLocation) {
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
// stripe connect
export function authorizeStripe(data: StripeAuthorizePayload) {
  return API.post<StripeAuthorizeResponse>("/connect/authorize", data, {
    baseURL: PAYMENT_BASE_URL,
  });
}

export const getStripeStatus = (companyId: string) => {
  return API.get<StripeStatusResponse>(`/connect/${companyId}/status`, {
    baseURL: PAYMENT_BASE_URL,
  });
};

export const getOnboardingLink = (companyId: string) => {
  return API.get<OnboardingLinkResponse>(`/connect/${companyId}/onboarding-link`, {
    baseURL: PAYMENT_BASE_URL,
  });
};

export const disconnectStripe = (companyId: string) => {
  return API.delete<DisconnectResponse>(`/connect/${companyId}/disconnect`, {
    baseURL: PAYMENT_BASE_URL,
  });
};

export function createSetupIntent(data: SetupIntentRequest) {
  return API.post<SetupIntentResponse>("/payment-methods/setup-intent", data, {
    baseURL: PAYMENT_BASE_URL,
  });
}

export function getSetupIntentDetails(setupIntentId: string) {
  return API.get<SetupIntentDetailsResponse>(`/payment-methods/setup-intent/${setupIntentId}`, {
    baseURL: PAYMENT_BASE_URL,
  });
}

export function getCustomerPaymentMethods(type: string = "card") {
  return API.get<PaymentMethodsResponse>(`/payment-methods/customer`, {
    baseURL: PAYMENT_BASE_URL,
    params: { 
      type, 
      limit: 10 
    },
  });
}

export function deletePaymentMethod(paymentMethodId: string) {
  return API.post(`/payment-methods/detach/${paymentMethodId}`, {}, {
    baseURL: PAYMENT_BASE_URL,
  });
}
export function setDefaultPaymentMethod(paymentMethodId: string) {
  return API.post(`/payment-methods/default`, { paymentMethodId }, {
    baseURL: PAYMENT_BASE_URL,
  });
}

export function getDefaultPaymentMethod() {
  return API.get(`/payment-methods/customer/default`, {
    baseURL: PAYMENT_BASE_URL,
  });
}