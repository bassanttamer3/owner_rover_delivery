import { CreateProductInterface, ListProductsInterface, UpdateProductInterface } from "@/common";
import API_ECOMMERCE from "../ecommerce-base-api";


export function listProducts(params: ListProductsInterface, company_id: string) {
    return API_ECOMMERCE.get('/products', { params, headers: { 'company-id': company_id } });
}

export function createProduct(data: CreateProductInterface) {
    return API_ECOMMERCE.post('/products/create', data);
}

export function getProductById(product_id: string) {
    return API_ECOMMERCE.get(`/products/${product_id}`);
}

export function updateProduct(data: UpdateProductInterface, id: string) {
    return API_ECOMMERCE.patch(`/products/update/${id}`, data);
}
