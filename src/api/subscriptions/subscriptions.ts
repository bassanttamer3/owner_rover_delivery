import { CreateSubscriptionDTO, ListSubscriptionsParams, UpdateSubscriptionDTO } from "@/common";
import API_PAYMENT from "../payment-base-api";

export function createSubscription(data: CreateSubscriptionDTO) {
  return API_PAYMENT.post("/subscriptions", { ...data, metadata: { } });
}

export function listSubscriptions(params: ListSubscriptionsParams) {
  return API_PAYMENT.get("/subscriptions", { params });
}

export function getSubscriptionDetails(id: string) {
  return API_PAYMENT.get(`/subscriptions/${id}`);
}

export function updateSubscription(id: string, data: UpdateSubscriptionDTO) {
  return API_PAYMENT.put(`/subscriptions/${id}`, data);
}

export function cancelSubscription(id: string) {
  return API_PAYMENT.post(`/subscriptions/${id}/cancel`);
}

export function resumeSubscription(id: string) {
  return API_PAYMENT.post(`/subscriptions/${id}/resume`);
}

export function listPlans() {
  return API_PAYMENT.get("/plans");
}
