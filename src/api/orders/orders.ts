import API_ECOMMERCE from "../ecommerce-base-api";

export function getAllOrders(params: { page: number, limit: number }) {
    return API_ECOMMERCE.get("/orders", { params });
}

export function getOrderById(id: string) {
    return API_ECOMMERCE.get(`/orders/${id}`);
}

