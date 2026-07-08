export interface ProductPlan {
  productId: string;
  name: string;
  description: string;
  planKey: string;
  active: boolean;
  limits: PlanLimits;
  features: string[];
  prices: PlanPrices;
}

export interface PlanLimits {
  rovers: number;
  ordersPerMonth: number;
  branches: number;
  apiAccess: boolean;
  gateways: string[];
  notifications: string[];
  supportSla: string;
}

export interface PlanPrices {
  monthly: PriceDetails;
  annual: PriceDetails;
}

export interface PriceDetails {
  id: string;
  amount: number;
  currency: string;
  interval: string;
  nickname: string;
  metadata: PriceMetadata;
}

export interface PriceMetadata {
  billing_cycle: string;
  plan_key: string;
}