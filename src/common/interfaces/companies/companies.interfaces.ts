export interface CompanyContact {
  primary_contact: string;
  email: string;
  phone: string;
  address: string;
}

export interface SubscriptionPricing {
  base_fee: number;
  per_delivery_fee: number;
  included_deliveries: number;
  overage_rate: number;
}

export interface Subscription {
  tier: "starter" | "professional" | "enterprise";
  billing_cycle: "monthly" | "yearly";
  pricing?: SubscriptionPricing;
  status?: string;
  current_period_start?: string;
  current_period_end?: string;
}

/** Operational Location Schema */
export interface CompanyLocation {
  location_id?: string;
  name: string;
  address: string;
  coordinates: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  operating_hours?: Record<string, { open: string; close: string }>;
  is_primary: boolean;
  active: boolean;
}

/** Company Operational Settings */
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
}

/** Performance and Analytics Stats */
export interface CompanyStats {
  total_deliveries: number;
  successful_deliveries: number;
  failed_deliveries: number;
  average_delivery_time: number;
  customer_satisfaction: number;
  success_rate: number;
  active_users: number;
  assigned_rovers: number;
  active_locations: number;
}

export interface CompanyStatusPayload {
  status?: string;
  reason: string;
}

export interface CreateCompanyPayload {
  name: string;
  business_type: "restaurant" | "healthcare" | "campus" | "ecommerce" | "logistics";
  contact: CompanyContact;
  subscription: Subscription;
  locations: CompanyLocation[];
  assigned_rovers: string[];
  admin_user: {
    name: string;
    email: string;
    phone: string;
    role: "company_admin";
  };
}

export interface CompanyParams {
  page?: number;
  limit?: number;
  status?: "active" | "trial" | "suspended" | "cancelled";
  business_type?: string;
  subscription_tier?: string;
  search?: string;
  sort?: string;
}