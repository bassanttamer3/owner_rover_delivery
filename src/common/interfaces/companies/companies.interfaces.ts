/** Company Contact Information */
export interface CompanyContact {
  primary_contact: string;
  email: string;
  phone: string;
  address: string;
}

/** Detailed Subscription Pricing */
export interface SubscriptionPricing {
  base_fee: number;
  per_delivery_fee: number;
  included_deliveries: number;
  overage_rate: number;
}

/** Subscription Details */
export interface Subscription {
  tier: "starter" | "professional" | "enterprise";
  billing_cycle: "monthly" | "yearly";
  pricing?: SubscriptionPricing;
  status?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean; // Added: To track if subscription will end soon
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
  created_at?: string; // Added: For audit logs
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
  updated_at?: string; // Added: To track last change
  updated_by?: string; // Added: To track who made the change
}

/** Performance and Analytics Stats */
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

/** General Company Object (The full entity from GET) */
export interface Company {
  company_id: string;
  name: string;
  business_type: "restaurant" | "healthcare" | "campus" | "ecommerce" | "logistics";
  status: "active" | "trial" | "suspended" | "cancelled";
  contact: CompanyContact;
  subscription: Subscription;
  settings?: CompanySettings; // Added: Full settings object
  locations: CompanyLocation[];
  assigned_rovers: string[];
  stats?: CompanyStats; // Added: Statistics nested object
  created_at: string; // Added: Audit fields
  updated_at: string;
}

/** Subscription payload when creating a company (pricing required) */
export interface CreateCompanySubscription {
  tier: "starter" | "professional" | "enterprise";
  billing_cycle: "monthly" | "yearly";
  pricing: {
    base_fee: number;
    per_delivery_fee: number;
    included_deliveries: number;
    overage_rate: number;
  };
}

/** Location payload when creating a company */
export interface CreateCompanyLocation {
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

/** Admin user when creating a company */
export interface CreateCompanyAdminUser {
  name: string;
  email: string;
  phone: string;
  role: "company_admin";
}

/** Payload for creating a new company */
export interface CreateCompanyPayload {
  name: string;
  business_type: "restaurant" | "healthcare" | "campus" | "ecommerce" | "logistics";
  contact: CompanyContact;
  subscription: CreateCompanySubscription;
  locations: CreateCompanyLocation[];
  assigned_rovers: string[];
  admin_user: CreateCompanyAdminUser;
}

/** Payload for status updates */
export interface CompanyStatusPayload {
  status?: string;
  reason: string;
}

/** Parameters for company list filtering */
export interface CompanyParams {
  page?: number;
  limit?: number;
  status?: "active" | "trial" | "suspended" | "cancelled";
  business_type?: string;
  subscription_tier?: string;
  search?: string;
  sort?: string;
}