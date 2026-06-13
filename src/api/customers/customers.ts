import { ListCusotmersParamsInterface, UpdateCustomerDataInterface } from "@/common";
import API_PAYMENT from "../payment-base-api";



export function getAllCustomers(params: ListCusotmersParamsInterface) {
  return API_PAYMENT.get(
    '/customers',
    { params }
  );
}

// export function searchForCustomer(query: string) {
//   return API_PAYMENT.get('/customers/search', {
//     params: { query },
//   });
// }

export function searchForCustomer(query: string) {
  return API_PAYMENT.get(
    `/customers/search?query=${encodeURIComponent(query)}`
  );
}

export function getCustomerDetails(customer_id: string) {
  return API_PAYMENT.get(
    `/customers/${customer_id}`
  );
}

export function deleteCustomer(customer_id: string) {
  return API_PAYMENT.delete(
    `/customers/${customer_id}`
  );
}

export function updateCustomerData(customer_id: string, data: UpdateCustomerDataInterface) {
  return API_PAYMENT.put(
    `/customers/${customer_id}`,
    data
  );
}