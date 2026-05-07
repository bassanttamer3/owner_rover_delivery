export interface CompanyLocation {
  location_id?: string;
  name: string;
  address: string;
  coordinates: {
    type: "Point";
    coordinates: [number, number];
  };
  operating_hours?: Record<string, { open: string; close: string }>;
  is_primary: boolean;
  active: boolean;
  created_at?: string;
}

export interface UpdateCompanyLocation {
  name: string;
  address: string;
  coordinates: {
    type: "Point";
    coordinates: [number, number];
  };
  operating_hours?: Record<string, { open: string; close: string }>;
  is_primary: boolean;
  active: boolean;
}

export interface CompanySettings {
  auto_dispatch: boolean;
  require_otp: boolean;
  enable_face_detection: boolean;
  enable_weight_check: boolean;
  default_delivery_timeout: number;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    webhook: boolean;
  };
  updated_at?: string;
  updated_by?: string;
}

export interface CompanyStats {
  total_deliveries: number;
  successful_deliveries: number;
  failed_deliveries: number;
  average_delivery_time: number;
  customer_satisfaction: number;
  success_rate: number;
  failure_rate: number;
  active_users: number;
  monthly_deliveries: number;
  active_locations: number;
  total_locations: number;
  assigned_rovers: number;
}

export interface Company {
  company_id: string;
  name: string;
  business_type: "restaurant" | "healthcare" | "campus" | "ecommerce" | "logistics";
  status: "active" | "trial" | "suspended" | "cancelled";
  contact: {
    primary_contact: string;
    email: string;
    phone: string;
    address: string;
  };
  subscription: {
    renewal_date: string;
    start_date: string;
    tier: "starter" | "professional" | "enterprise";
    billing_cycle: "monthly" | "yearly";
    pricing?: {
      base_fee: number;
      per_delivery_fee: number;
      included_deliveries: number;
      overage_rate: number;
    };
    status?: string;
  };
  settings?: CompanySettings;
  locations: CompanyLocation[];
  assigned_rovers: string[];
  stats?: CompanyStats;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyPayload {
  name: string;
  business_type: "restaurant" | "healthcare" | "campus" | "ecommerce" | "logistics";
  contact: {
    primary_contact: string;
    email: string;
    phone: string;
    address: string;
  };
  subscription: {
    tier: "starter" | "professional" | "enterprise";
    billing_cycle: "monthly" | "yearly";
    pricing: {
      base_fee: number;
      per_delivery_fee: number;
      included_deliveries: number;
      overage_rate: number;
    };
  };
  locations: Array<{
    name: string;
    address: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number];
    };
    operating_hours?: Record<string, { open: string; close: string }>;
    is_primary: boolean;
    active: boolean;
  }>;
  assigned_rovers: string[];
  admin_user: {
    name: string;
    email: string;
    phone: string;
    role: "company_admin";
  };
}

export interface CompanyStatusPayload {
  status?: string;
  reason?: string;
}

export interface CompanyParams {
  page?: number;
  limit?: number;
  status?: "active" | "trial" | "suspended" | "cancelled";
  business_type?: "restaurant" | "healthcare" | "campus" | "ecommerce" | "logistics";
  subscription_tier?: "starter" | "professional" | "enterprise";
  search?: string;
  sort?: string;
}
export interface StripeAuthorizePayload {
  companyId: string;
  email: string;
  name?: string;
}

export interface StripeAuthorizeResponse {
  url: string;
}
export interface StripeStatusResponse {
  isConnected: boolean;
  isFullyActivated: boolean;
  status: string;
  details: {
    accountId: string;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    livemode: boolean;
  };
}

 export interface OnboardingLinkResponse {
  url: string;
}

export interface DisconnectResponse {
  message: string;
}