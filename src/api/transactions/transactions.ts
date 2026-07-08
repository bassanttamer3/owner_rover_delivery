import API_PAYMENT from "../payment-base-api";

export function listAllPaymentIntents() {
  return API_PAYMENT.get("/payments", { params: { limit: 10 } });
}