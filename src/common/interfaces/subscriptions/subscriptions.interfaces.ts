export interface Subscription {
  stripeSubscriptionId: string;
  customer: string;
  status: string;
  plan: SubscriptionPlan;
  currentPeriod: SubscriptionPeriod;
  trial: SubscriptionTrial;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

export interface SubscriptionPlan {
  productId: string;
  priceId: string;
  name: string;
  amount: number;
  currency: string;
  interval: string;
  intervalCount: number;
}

export interface SubscriptionPeriod {
  start: string; // ISO 8601 date
  end: string;   // ISO 8601 date
}

export interface SubscriptionTrial {
  isInTrial: boolean;
  trialEnd: string; // ISO 8601 date
}

export interface CreateSubscriptionDTO {
  priceId: string;
  trialDays?: number;
}

export interface ListSubscriptionsParams {
  page?: number;
  limit?: number;
}

export interface UpdateSubscriptionDTO {
  priceId?: string;
}




